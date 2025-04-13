import React, { useState } from 'react';
import AttendanceForm from './components/AttendanceForm';
import AttendanceList from './components/AttendanceList';

function App() {
  const [activeTab, setActiveTab] = useState<'mark' | 'view'>('mark');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance System
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('mark')}
                className={`py-4 px-6 ${
                  activeTab === 'mark'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mark Attendance
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`py-4 px-6 ${
                  activeTab === 'view'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                View Records
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'mark' ? <AttendanceForm /> : <AttendanceList />}
      </main>
    </div>
  );
}

export default App; 