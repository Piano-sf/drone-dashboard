// src/components/layout/Layout.tsx

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ฟังก์ชันสำหรับสลับค่า state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={styles.appContainer}>
      {/* ส่งฟังก์ชันและ state ไปให้ Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={toggleSidebar} // <<< ส่งฟังก์ชันนี้
      />
      <main className={styles.contentArea}>
        {children}
      </main>
    </div>
  );
};

export default Layout;