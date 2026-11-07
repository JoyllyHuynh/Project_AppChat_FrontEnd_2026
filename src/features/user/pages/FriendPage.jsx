import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';
import { FriendSubSidebar } from '../components/FriendSubSidebar';
import FriendList from '../components/FriendList';
import FriendRequests from '../components/FriendRequests';

export const FriendPage = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("webchat_theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("webchat_theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar theme={theme} onToggleTheme={handleToggleTheme} />
      <FriendSubSidebar />
      
      <Routes>
        <Route path="/" element={<Navigate to="list" replace />} />
        <Route path="list" element={<FriendList />} />
        <Route path="requests" element={<FriendRequests />} />
        <Route path="groups" element={
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', color: '#6b7280' }}>
            <h2>Danh sách nhóm và cộng đồng</h2>
          </div>
        } />
        <Route path="invites" element={
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', color: '#6b7280' }}>
            <h2>Lời mời vào nhóm và cộng đồng</h2>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default FriendPage;