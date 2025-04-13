import json
import os
import boto3
from datetime import datetime
from typing import Dict, Any

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['ATTENDANCE_TABLE'])

def create_response(status_code: int, body: Any) -> Dict[str, Any]:
    """Create a response with CORS headers"""
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Origin,Accept',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler function for the attendance system
    """
    # Handle OPTIONS requests for CORS
    if event['httpMethod'] == 'OPTIONS':
        return create_response(200, {'message': 'CORS preflight handled'})
    
    try:
        if event['httpMethod'] == 'POST':
            return mark_attendance(event)
        elif event['httpMethod'] == 'GET':
            return get_attendance(event)
        else:
            return create_response(400, {'error': 'Unsupported HTTP method'})
    except Exception as e:
        return create_response(500, {'error': str(e)})

def mark_attendance(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle attendance marking
    """
    try:
        body = json.loads(event['body'])
        user_id = body['user_id']
        status = body['status']
        notes = body.get('notes')
        
        # Create attendance record
        timestamp = datetime.utcnow().isoformat()
        date = timestamp.split('T')[0]
        
        item = {
            'userId': user_id,
            'date': date,
            'status': status,
            'timestamp': timestamp
        }
        if notes:
            item['notes'] = notes
            
        # Save to DynamoDB
        table.put_item(Item=item)
        
        return create_response(200, item)
    except KeyError as e:
        return create_response(400, {'error': f'Missing required field: {str(e)}'})

def get_attendance(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle attendance retrieval
    """
    try:
        user_id = event['pathParameters']['userId']
        query_params = event.get('queryStringParameters', {}) or {}
        
        # Build query parameters
        key_condition = 'userId = :uid'
        expr_values = {':uid': user_id}
        
        if 'startDate' in query_params and 'endDate' in query_params:
            key_condition += ' AND #date BETWEEN :start AND :end'
            expr_values[':start'] = query_params['startDate']
            expr_values[':end'] = query_params['endDate']
            
        # Query DynamoDB
        response = table.query(
            KeyConditionExpression=key_condition,
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames={'#date': 'date'} if 'startDate' in query_params else {}
        )
        
        return create_response(200, response['Items'])
    except KeyError as e:
        return create_response(400, {'error': f'Missing required parameter: {str(e)}'}) 