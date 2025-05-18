import { NextRequest, NextResponse } from "next/server";
import { validateDigiLockerHmac } from "@/lib/digilocker/validation";
import { connectToDatabase } from "@/lib/db/mongodb";
import User, { IUser } from "@/lib/db/models/user";
import { getFileFromS3 } from "@/lib/aws/s3";
import xml2js from "xml2js";

export async function POST(request: NextRequest) {
  try {
    // Get raw body for HMAC validation
    const bodyText = await request.text();

    // Validate HMAC
    const hmacHeader = request.headers.get("x-digilocker-hmac");
    if (!validateDigiLockerHmac(bodyText, hmacHeader)) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><PullDocResponse><ResponseStatus><Status>ERROR</Status><ErrorCode>401</ErrorCode><ErrorMessage>Unauthorized request</ErrorMessage></ResponseStatus></PullDocResponse>',
        {
          status: 401,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        }
      );
    }

    // Parse XML request
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(bodyText);

    const pullDocRequest = result.PullDocRequest;
    if (!pullDocRequest) {
      return generateErrorResponse("Invalid request format");
    }

    // Get URI from request
    const uri = pullDocRequest.URI;
    if (!uri) {
      return generateErrorResponse("URI is required");
    }

    // Connect to database
    await connectToDatabase();

    // Find user certificate with the given URI
    const user = (await User.findOne({
      certificateUri: uri,
    }).lean()) as IUser | null;

    if (!user || !user.certificateS3Url) {
      return generateErrorResponse(
        "Certificate not found for the provided URI"
      );
    }

    // Extract S3 key from the URL
    const s3UrlParts = user.certificateS3Url.split("/");
    const s3Key = `certificates/${s3UrlParts[s3UrlParts.length - 1]}`;

    try {
      // Get PDF from S3
      const pdfBuffer = await getFileFromS3(s3Key);

      // Convert PDF to Base64
      const base64Pdf = pdfBuffer.toString("base64");

      // Build XML response
      const builder = new xml2js.Builder({
        xmldec: { version: "1.0", encoding: "UTF-8" },
      });

      const responseObj = {
        PullDocResponse: {
          ResponseStatus: {
            Status: "SUCCESS",
            ErrorCode: "0",
          },
          DocDetails: {
            Data: {
              DocumentName: `Certificate for ${user.name}`,
              DocumentID: user.conferenceId,
              Conference: "Conference Attendance Certificate",
              Recipient: user.name,
              Date: new Date(user.date).toISOString().split("T")[0],
            },
            PDF: base64Pdf,
          },
        },
      };

      const xmlResponse = builder.buildObject(responseObj);

      return new NextResponse(xmlResponse, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      });
    } catch (err) {
      console.error("Error fetching certificate from S3:", err);
      return generateErrorResponse("Failed to retrieve certificate");
    }
  } catch (error) {
    console.error("Error processing Pull Doc request:", error);
    return generateErrorResponse("Internal server error");
  }
}

function generateErrorResponse(errorMessage: string, errorCode = "500") {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><PullDocResponse><ResponseStatus><Status>ERROR</Status><ErrorCode>${errorCode}</ErrorCode><ErrorMessage>${errorMessage}</ErrorMessage></ResponseStatus></PullDocResponse>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    }
  );
}
