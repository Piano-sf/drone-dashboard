// src/components/layout/Sidebar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

type SidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void; // <<< เพิ่ม Prop นี้เข้ามา
};

const navItems = [
  { path: '/', name: 'Main Dashboard', icon: '🏠' },
  { path: '/offensive', name: 'Offensive', icon: '🎯' },
  { path: '/defensive', name: 'Defensive', icon: '🛡️' },
];

// อัปเดตตรงนี้ ให้รับ toggleSidebar
const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  return (
    <nav className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      
      {/* === ปุ่มที่เพิ่มเข้ามา === */}
      <button onClick={toggleSidebar} className={styles.toggleButton}>
        {isCollapsed ? '»' : '«'}
      </button>
      {/* ======================= */}

      <ul>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              {!isCollapsed && <span className={styles.name}>{item.name}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;