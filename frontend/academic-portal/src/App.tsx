import React, { useState } from 'react';
import SyllabusList from './components/SyllabusList';
import Statistics from './components/Statistics';
import Notifications from './components/Notifications';
import { Syllabus } from './types';
import './App.css';

function App() {
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [currentPage, setCurrentPage] = useState<'list' | 'stats'>('list');
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Quản Lý Giáo Trình Học Thuật</h1>
          <div className="header-actions">
            <button
              className="btn-stats"
              onClick={() => setCurrentPage(currentPage === 'list' ? 'stats' : 'list')}
            >
              {currentPage === 'list' ? '📊 Thống kê' : '📋 Danh sách'}
            </button>
            <button
              className="btn-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔 Thông báo
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'list' ? (
          <SyllabusList onSelectSyllabus={setSelectedSyllabus} />
        ) : (
          <Statistics show={currentPage === 'stats'} />
        )}
      </main>

      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}

export default App;
