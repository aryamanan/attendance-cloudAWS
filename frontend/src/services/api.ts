import { AttendanceRecord, DailyAttendance } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = {
    async markAttendance(record: Omit<AttendanceRecord, 'timestamp'>): Promise<AttendanceRecord> {
        const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark attendance');
        }
        
        return response.json();
    },

    async getUserAttendance(userId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
        let url = `${API_URL}/attendance/${userId}`;
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch user attendance');
        }
        
        return response.json();
    },

    async getDailyAttendance(date: string): Promise<DailyAttendance> {
        const response = await fetch(`${API_URL}/attendance/status/${date}`);
        if (!response.ok) {
            throw new Error('Failed to fetch daily attendance');
        }
        
        return response.json();
    },
}; 