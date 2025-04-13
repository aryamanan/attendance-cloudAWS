from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from typing import List, Optional
from datetime import datetime
import boto3
from pydantic import BaseModel
import os
from datetime import date

app = FastAPI(title="Attendance System API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
attendance_table = dynamodb.Table(os.getenv('ATTENDANCE_TABLE', 'Attendance'))

class AttendanceRecord(BaseModel):
    user_id: str
    date: str
    status: str
    notes: Optional[str] = None
    timestamp: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Attendance System API"}

@app.post("/attendance", response_model=AttendanceRecord)
async def mark_attendance(record: AttendanceRecord):
    try:
        record.timestamp = datetime.utcnow().isoformat()
        attendance_table.put_item(
            Item={
                'user_id': record.user_id,
                'date': record.date,
                'status': record.status,
                'notes': record.notes,
                'timestamp': record.timestamp
            }
        )
        return record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/attendance/{user_id}", response_model=List[AttendanceRecord])
async def get_user_attendance(user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    try:
        # Basic query for user's attendance
        query_params = {
            'KeyConditionExpression': 'user_id = :uid',
            'ExpressionAttributeValues': {':uid': user_id}
        }
        
        if start_date and end_date:
            query_params['KeyConditionExpression'] += ' AND #date BETWEEN :start AND :end'
            query_params['ExpressionAttributeValues'].update({
                ':start': start_date,
                ':end': end_date
            })
            query_params['ExpressionAttributeNames'] = {'#date': 'date'}

        response = attendance_table.query(**query_params)
        return response.get('Items', [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/attendance/status/{date}")
async def get_daily_attendance(date: str):
    try:
        response = attendance_table.scan(
            FilterExpression='#date = :date',
            ExpressionAttributeNames={'#date': 'date'},
            ExpressionAttributeValues={':date': date}
        )
        return {
            'date': date,
            'total_records': len(response['Items']),
            'records': response['Items']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Handler for AWS Lambda
handler = Mangum(app) 