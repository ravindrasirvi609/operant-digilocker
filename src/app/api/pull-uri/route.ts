import { NextRequest, NextResponse } from "next/server";
import { validateDigiLockerHmac } from "@/lib/digilocker/validation";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/db/models/user";
import xml2js from "xml2js";

export async function POST(request: NextRequest) {
  try {
    // Get raw body for HMAC validation
    const bodyText = await request.text();

    // Validate HMAC
    const hmacHeader = request.headers.get("x-digilocker-hmac");
    if (!validateDigiLockerHmac(bodyText, hmacHeader)) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><PullURIResponse><ResponseStatus><Status>ERROR</Status><ErrorCode>401</ErrorCode><ErrorMessage>Unauthorized request</ErrorMessage></ResponseStatus></PullURIResponse>',
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

    const pullURIRequest = result.PullURIRequest;
    if (!pullURIRequest) {
      return generateErrorResponse("Invalid request format");
    }

    // Get DigiLocker ID from request
    const digiLockerId = pullURIRequest.digilockerid;
    if (!digiLockerId) {
      return generateErrorResponse("DigiLocker ID is required");
    }

    // Connect to database
    await connectToDatabase();

    // Find user certificates for the given DigiLocker ID
    const users = await User.find({ digiLockerId })
      .sort({ createdAt: -1 })
      .lean();

    if (users.length === 0) {
      return generateErrorResponse(
        "No certificates found for this DigiLocker ID"
      );
    }

    // Build XML response
    const builder = new xml2js.Builder({
      xmldec: { version: "1.0", encoding: "UTF-8" },
    });

    const certificates = users.map((user) => ({
      URI: user.certificateUri,
      DocType: "CERTIFICATE",
      Data: {
        DocumentName: `Certificate for ${user.name}`,
        DocumentID: user.conferenceId,
        Conference: "Conference Attendance Certificate",
        Recipient: user.name,
        Date: new Date(user.date).toISOString().split("T")[0],
      },
    }));

    const responseObj = {
      PullURIResponse: {
        ResponseStatus: {
          Status: "SUCCESS",
          ErrorCode: "0",
        },
        DocDetails: {
          Document: certificates.length === 1 ? certificates[0] : certificates,
        },
      },
    };

    const xmlResponse = builder.buildObject(responseObj);

    return new NextResponse(xmlResponse, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error processing Pull URI request:", error);
    return generateErrorResponse("Internal server error");
  }
}

function generateErrorResponse(errorMessage: string, errorCode = "500") {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><PullURIResponse><ResponseStatus><Status>ERROR</Status><ErrorCode>${errorCode}</ErrorCode><ErrorMessage>${errorMessage}</ErrorMessage></ResponseStatus></PullURIResponse>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    }
  );
}
