// src/components/filters/GlobalFilterBar.tsx

import React from 'react';
import styles from './GlobalFilterBar.module.css';

// ✨ 1. (แก้ไข) เหลือ Props แค่ EventType
type GlobalFilterBarProps = {
  eventType: string;
  onEventTypeChange: (value: string) => void;
};

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  eventType,
  onEventTypeChange,
}) => {
  return (
    <div className={styles.filterBarContainer}> 
      
      {/* ✨ 2. (แก้ไข) เหลือ Filter แค่อันเดียว */}
      <div className={styles.filterGroup}>
        <label htmlFor="eventType">Object Type</label>
        <select 
          id="eventType"
          value={eventType}
          onChange={(e) => onEventTypeChange(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="drone">Drone</option>
          <option value="person">Person</option>
          <option value="vehicle">Vehicle</option>
        </select>
      </div>
      
      {/* (ลบ Input ของ CamId และ TokenId ออก) */}
      
    </div>
  );
};

export default GlobalFilterBar;