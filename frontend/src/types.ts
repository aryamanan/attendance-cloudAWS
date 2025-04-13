export interface AttendanceRecord {
    user_id: string;
    date: string;
    status: string;
    notes?: string;
    timestamp?: string;
}

export interface DailyAttendance {
    date: string;
    total_records: number;
    records: AttendanceRecord[];
} 