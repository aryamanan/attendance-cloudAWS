import json
import os
import boto3
from datetime import datetime
from typing import Dict, Any

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['ATTENDANCE_TABLE'])

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler function for the attendance system
    """
    http_method = event['httpMethod']
    
    try:
        if http_method == 'POST':
            return mark_attendance(event)
        elif http_method == 'GET':
            return get_attendance(event)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Unsupported HTTP method'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

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
        
        return {
            'statusCode': 200,
            'body': json.dumps(item)
        }
    except KeyError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': f'Missing required field: {str(e)}'})
        }

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
        
        return {
            'statusCode': 200,
            'body': json.dumps(response['Items'])
        }
    except KeyError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': f'Missing required parameter: {str(e)}'})
        } 