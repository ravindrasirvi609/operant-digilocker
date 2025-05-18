# Operant DigiLocker Admin Dashboard

This is a Next.js application integrated with Shadcn UI that allows uploading Excel files and viewing data. The application integrates with DigiLocker's Pull APIs to enable users to view and download certificates from the DigiLocker app.

## Features

- Upload Excel files containing user data
- Generate PDF certificates automatically
- Store certificates in AWS S3
- View user data in a table
- DigiLocker integration with Pull URI and Pull Doc APIs

## Tech Stack

- **Frontend**: Next.js, Shadcn UI, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Storage**: AWS S3
- **PDF Generation**: PDFKit
- **Excel Processing**: ExcelJS

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- AWS account with S3 access
- DigiLocker API key (for API integration)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd operant-digilocker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/digilocker?retryWrites=true&w=majority
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=operant-digilocker
DIGILOCKER_API_KEY=your_digilocker_api_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Uploading Excel Files

1. Navigate to the Upload page from the dashboard
2. Select an Excel file with the following columns:
   - Name
   - ConferenceID
   - Email
   - DigiLockerID
   - Date
3. Click "Upload"

The system will:

- Process the Excel file
- Store user data in MongoDB
- Generate PDF certificates
- Upload certificates to AWS S3
- Create DigiLocker URIs for each certificate

### Viewing Data

1. Navigate to the View Data page from the dashboard
2. The table shows all user records with their certificate URIs

## DigiLocker API Integration

### Pull URI Request

- **Endpoint**: `/api/pull-uri`
- **Method**: POST
- **Headers**:
  - `x-digilocker-hmac`: HMAC signature using the DigiLocker API key
- **Request Format** (XML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PullURIRequest>
    <digilockerid>12345678</digilockerid>
</PullURIRequest>
```

- **Response Format** (XML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PullURIResponse>
    <ResponseStatus>
        <Status>SUCCESS</Status>
        <ErrorCode>0</ErrorCode>
    </ResponseStatus>
    <DocDetails>
        <Document>
            <URI>digilocker://operant/1234abcd</URI>
            <DocType>CERTIFICATE</DocType>
            <Data>
                <DocumentName>Certificate for John Doe</DocumentName>
                <DocumentID>CONF123</DocumentID>
                <Conference>Conference Attendance Certificate</Conference>
                <Recipient>John Doe</Recipient>
                <Date>2023-12-15</Date>
            </Data>
        </Document>
    </DocDetails>
</PullURIResponse>
```

### Pull Doc Request

- **Endpoint**: `/api/pull-doc`
- **Method**: POST
- **Headers**:
  - `x-digilocker-hmac`: HMAC signature using the DigiLocker API key
- **Request Format** (XML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PullDocRequest>
    <URI>digilocker://operant/1234abcd</URI>
</PullDocRequest>
```

- **Response Format** (XML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PullDocResponse>
    <ResponseStatus>
        <Status>SUCCESS</Status>
        <ErrorCode>0</ErrorCode>
    </ResponseStatus>
    <DocDetails>
        <Data>
            <DocumentName>Certificate for John Doe</DocumentName>
            <DocumentID>CONF123</DocumentID>
            <Conference>Conference Attendance Certificate</Conference>
            <Recipient>John Doe</Recipient>
            <Date>2023-12-15</Date>
        </Data>
        <PDF>BASE64_ENCODED_PDF_DATA</PDF>
    </DocDetails>
</PullDocResponse>
```

## Setting Up MongoDB Atlas

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Set up a new cluster
3. Create a database user with read/write privileges
4. Whitelist your IP address
5. Get your connection string and add it to your `.env.local` file

## Setting Up AWS S3

1. Create an AWS account if you don't have one
2. Create an S3 bucket named `operant-digilocker` (or choose your own name)
3. Create an IAM user with S3 access permissions
4. Generate access keys for the IAM user
5. Add the keys and region to your `.env.local` file

## License

This project is licensed under the MIT License - see the LICENSE file for details.
