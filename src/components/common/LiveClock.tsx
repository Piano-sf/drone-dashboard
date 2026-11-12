// src/components/common/LiveClock.tsx

import React, { useState, useEffect } from 'react';
import styles from './LiveClock.module.css';

const LiveClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // ตั้งค่า Interval ให้ทำงานทุก 1 วินาที
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup function: หยุด Interval เมื่อ Component ถูกถอด
    return () => {
      clearInterval(timerId);
    };
  }, []); // [] หมายถึงให้ Effect นี้ทำงานแค่ครั้งเดียวตอนเริ่ม

  // ดึง Time Zone (เช่น "Asia/Bangkok")
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ');

  // จัดรูปแบบเวลา (เช่น "14:30:55")
  const formattedTime = currentTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // ใช้ระบบ 24 ชั่วโมง
  });

  return (
    <div className={styles.clockContainer}>
      <div className={styles.time}>{formattedTime}</div>
      <div className={styles.timezone}>{timeZone}</div>
    </div>
  );
};

export default LiveClock;