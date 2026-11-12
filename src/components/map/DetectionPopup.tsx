// src/components/map/DetectionPopup.tsx

import React from 'react';
import type { DetectionEvent } from '../types/Detection';
import type { DetectionObject } from '../types/Detection';
import styles from './DetectionPopup.module.css';

// --- (เพิ่ม) ฟังก์ชันดึงรูป Mockup ---
const getMockupImage = (type: string) => {
  // คุณสามารถเพิ่ม Logic หรือเปลี่ยน Path รูปได้ตามต้องการ
  if (type === 'drone') {
    return '/images/CameraDrone.jpg'; // 👈 ชี้ไปที่ Path รูปในโฟลเดอร์ /public
  }
  return '/images/CameraDrone.jpg'; // 👈 รูป default
};

type Props = {
  event: DetectionEvent;
  object: DetectionObject;
};

export const DetectionPopup: React.FC<Props> = ({ event, object }) => {
  
  const mockupImageUrl = getMockupImage(object.type);
  const locationColor = event.camera.location === 'offence' ? styles.offence : styles.defence;

  return (
    <div className={styles.popupContainer}>
      
      {/* 1. ส่วนรูปภาพ Mockup */}
      <img 
        src={mockupImageUrl} 
        alt={object.type} 
        className={styles.popupImage} 
      />
      
      {/* 2. ส่วนเนื้อหา (จาก Socket.io) */}
      <div className={styles.detailsContainer}>
        
        {/* ID */}
        <div className={styles.detailLine}>
          <span className={styles.icon}>📡</span>
          <span className={`${styles.value} ${styles.idValue}`}>{object.obj_id}</span>
        </div>
        
        {/* Type & Size */}
        <div className={styles.detailLine}>
          <span className={styles.icon}>✈️</span>
          <span className={styles.value}>{object.type} • {object.size}</span>
        </div>

        {/* Team (Location) */}
        <div className={styles.detailLine}>
          <span className={styles.icon}>🛡️</span>
          <span className={`${styles.value} ${locationColor}`}>
            {event.camera.location}
          </span>
        </div>
        
        {/* Lat/Lng */}
        <div className={styles.detailLine}>
          <span className={styles.icon}>📍</span>
          <span className={`${styles.value} ${styles.coords}`}>
            {object.lat.toFixed(5)}, {object.lng.toFixed(5)}
          </span>
        </div>

      </div>
    </div>
  );
};