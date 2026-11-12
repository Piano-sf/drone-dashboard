// src/components/feed/DetectionFeed.tsx
import React from 'react';
// 👈 (Import เพิ่ม)
import type { DetectionEvent} from '../types/Detection'; 
import DetectionFeedItem from './DetectionFeedItem';
import styles from './DetectionFeed.module.css';

// 1. (เหมือนเดิม) รับ Props
interface DetectionFeedProps {
  detections: DetectionEvent[];
  onEventClick: (event: DetectionEvent) => void;
}

export const DetectionFeed: React.FC<DetectionFeedProps> = ({ detections, onEventClick }) => {
  return (
    <div className={styles.feedList}>
      
      {/* --- 2. ✨ นี่คือจุดที่แก้ไข ✨ --- */}
      {/* เราใช้ .flatMap เพื่อคลี่ "Event" และ "Objects" ออกจากกัน */}
      {detections.flatMap((event) => 
        
        // สำหรับ 1 Event ที่มี 3 Objects, มันจะสร้าง <DetectionFeedItem> 3 ชิ้น
        event.objects.map((object) => (
          
          <DetectionFeedItem
            // 3. Key: ต้องเป็น ID ของ "Object" (ลำใครลำมัน)
            key={`${event.timestamp}-${object.obj_id}`} 
            
            // 4. ส่ง Props ใหม่:
            event={event}   // 👈 ส่ง "Event" แม่ (สำหรับข้อมูลกล้อง, เวลา)
            object={object} // 👈 ส่ง "Object" ลูก (สำหรับ Type, ID)
            
            // 5. (เหมือนเดิม) เมื่อคลิก ให้ส่ง "Event" แม่ทั้งหมดไปที่ Modal
            onItemClick={() => onEventClick(event)} 
          />
        ))
      )}
      
    </div>
  );
};

export default DetectionFeed;