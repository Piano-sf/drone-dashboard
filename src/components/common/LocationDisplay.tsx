// src/components/common/LocationDisplay.tsx
import React from 'react';
import styles from './LocationDisplay.module.css';

const LocationDisplay: React.FC = () => {
  return (
    <div className={styles.locationContainer}>
      <span className={styles.icon}>📍</span>
      {/* (คุณสามารถเปลี่ยนข้อความเป็น Dynamic ได้ในอนาคต) */}
      <span className={styles.text}>Rongrian Nai Roi Phra Chunlachom Klao</span>
    </div>
  );
};
export default LocationDisplay;