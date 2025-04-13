import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AttendanceRecord {
  userId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  timestamp: string;
}

interface AttendanceFormData {
  userId: string;
  status: AttendanceRecord['status'];
  notes: string;
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<AttendanceFormData>({
    userId: '',
    status: 'present',
    notes: ''
  });
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const markAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${apiUrl}/attendance`, {
        user_id: formData.userId,
        status: formData.status,
        notes: formData.notes
      });
      
      // Refresh attendance list
      fetchAttendance();
      setFormData(prev => ({ ...prev, notes: '' }));
    } catch (err) {
      setError('Failed to mark attendance. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!formData.userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<AttendanceRecord[]>(`${apiUrl}/attendance/${formData.userId}`);
      setAttendanceList(response.data);
    } catch (err) {
      setError('Failed to fetch attendance records. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.userId) {
      fetchAttendance();
    }
  }, [formData.userId]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Attendance System</h2>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4" role="alert">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={markAttendance} className="space-y-6">
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                      User ID
                    </label>
                    <input
                      type="text"
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Processing...' : 'Mark Attendance'}
                  </button>
                </form>

                {attendanceList.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Attendance History</h3>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendanceList.map((record, index) => (
                            <tr key={`${record.userId}-${record.date}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(record.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                                  record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 