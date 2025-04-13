# AWS Cloud Attendance System

A highly available attendance management system built with React, AWS Lambda, and DynamoDB.

## Prerequisites

- Node.js 14+ and npm
- Python 3.9+
- AWS Account with Free Tier access
- AWS CLI
- AWS SAM CLI

## Project Structure
```
.
├── backend/
│   ├── app/
│   │   ├── app.py          # Lambda function handler
│   │   └── requirements.txt
│   └── template.yaml       # SAM template
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   └── services/       # API services
    ├── package.json
    └── .env               # Environment configuration
```

## Setup Instructions

### 1. AWS Configuration

1. Create an AWS account if you don't have one
2. Create `.aws` directory in your home folder:
   ```bash
   mkdir -p ~/.aws
   ```

3. Create AWS credentials file:
   ```bash
   # ~/.aws/credentials
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY_ID
   aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
   ```

4. Create AWS config file:
   ```bash
   # ~/.aws/config
   [default]
   region = ap-south-1
   output = json
   ```

### 2. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r app/requirements.txt
   ```

3. Build and deploy using SAM:
   ```bash
   sam build
   sam deploy --guided
   ```

   During guided deployment:
   - Stack Name: attendance-system
   - Region: ap-south-1 (or your preferred region)
   - Confirm changes: yes
   - Allow SAM CLI IAM role creation: yes
   - Save arguments to configuration file: yes

4. Note the API endpoint URL from the deployment output

### 3. Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   # Replace with your API Gateway URL from backend deployment
   REACT_APP_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Features

- Mark attendance with status (present/absent/late)
- Add optional notes to attendance records
- View attendance history with date filtering
- Responsive design
- Serverless architecture
- Highly available and scalable

## AWS Services Used

- **API Gateway**: REST API endpoints
- **Lambda**: Serverless backend functions
- **DynamoDB**: NoSQL database for attendance records
- **CloudWatch**: Monitoring and logging
- **IAM**: Security and access control

## Free Tier Usage

This project is designed to run within AWS Free Tier limits:
- API Gateway: 1M calls/month
- Lambda: 1M requests/month
- DynamoDB: 25GB storage
- CloudWatch: Basic monitoring

## Security

- API Gateway handles request validation
- DynamoDB uses server-side encryption
- IAM roles follow least privilege principle
- Environment variables for sensitive data

## Troubleshooting

1. **API Gateway CORS Issues**:
   - Check CORS configuration in `template.yaml`
   - Verify API URL in frontend `.env` file

2. **DynamoDB Access**:
   - Verify IAM roles and policies
   - Check region configuration

3. **Lambda Function Errors**:
   - Check CloudWatch logs
   - Verify environment variables

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 