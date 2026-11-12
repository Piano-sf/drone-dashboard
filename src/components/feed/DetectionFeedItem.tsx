// src/components/feed/DetectionFeedItem.tsx

import React, { useState, useEffect } from 'react'; // 👈 1. Import useState/useEffect
import type { DetectionEvent } from '../types/Detection'; 
import styles from './DetectionFeedItem.module.css';


// 2. URL ของ API และรูปสำรอง
const API_BASE_URL = 'https://tesa-api.crma.dev';
const placeholderUrl = 'https://via.placeholder.com/60';

// (ฟังก์ชันช่วย) จัดการ Timestamp ให้อ่านง่าย
const formatTimestamp = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

// 3. กำหนด Props ที่จะรับ
interface FeedItemProps {
  event: DetectionEvent;
  onItemClick: (event: DetectionEvent) => void;
}

export const DetectionFeedItem: React.FC<FeedItemProps> = ({ event, onItemClick }) => {
  
  // 4. สร้าง State เพื่อเก็บ URL ของรูปภาพ
  const [imageUrl, setImageUrl] = useState(placeholderUrl); // (เริ่มด้วยรูปสำรอง)

  // 5. สร้าง useEffect เพื่อ "fetch" รูปภาพ
  useEffect(() => {
    // ถ้า event นี้ไม่มีรูป ก็ไม่ต้องทำอะไร (ใช้ placeholder ต่อไป)
    if (!event.image || !event.image.path) {
      setImageUrl(placeholderUrl);
      return;
    }

    // ประกอบร่าง URL จริง
    const url = `${API_BASE_URL}${event.image.path}`;
    
    // (ตัวแปรสำหรับ cleanup)
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            // 6. ✨ อ่าน Token จาก .env ✨
            'x-camera-token': event.camera.location === 'offence'
              ? import.meta.env.VITE_OFFENSIVE_TOKEN
              : import.meta.env.VITE_DEFENSIVE_TOKEN,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob(); // แปลงข้อมูลเป็น Blob
        objectUrl = URL.createObjectURL(blob); // สร้าง URL ชั่วคราว (blob:...)
        setImageUrl(objectUrl); // 👈 7. ตั้งค่า src ของ <img> เป็น URL ใหม่
        
      } catch (error) {
        console.error('Error fetching image:', url, error);
        setImageUrl(placeholderUrl); // (ถ้าพัง ก็ใช้รูปสำรอง)
      }
    };

    fetchImage();

    // 8. Cleanup: คืน Memory เมื่อ Component ถูกทำลาย
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
    
  }, [event.image, event.cam_id, event.camera.location]); // (ให้ useEffect ทำงานใหม่เมื่อ event เปลี่ยน)


  // 9. ดึงข้อมูลจาก "Event" (เหมือนเดิม)
  const objectCount = event.objects.length;
  const firstObject = event.objects[0];

  return (
    // 10. (สำคัญ) เพิ่ม onClick ที่นี่
    <div className={styles.feedItem} onClick={() => onItemClick(event)}>
      
      {/* 1. Thumbnail (ใช้ State ใหม่) */}
      <img 
        src={imageUrl} // 👈 11. ใช้ imageUrl จาก State
        alt={firstObject ? firstObject.type : 'detection'} 
        className={styles.thumbnail} 
        // (เราไม่ต้องใช้ onError แล้ว เพราะเราจัดการใน useEffect หมดแล้ว)
      />
      
      {/* 2. ข้อมูลหลัก (เหมือนเดิม) */}
      <div className={styles.itemInfo}>
        <span className={styles.type}>
          {firstObject ? firstObject.type.toUpperCase() : 'OBJECT'} ({objectCount})
        </span>
        <span className={styles.details}>
          Cam: {event.camera.name}
        </span>
      </div>
      
      {/* 3. เวลา (เหมือนเดิม) */}
      <div className={styles.itemMeta}>
        <span className={styles.timestamp}>{formatTimestamp(event.timestamp)}</span>
      </div>
    </div>
  );
};

export default DetectionFeedItem;