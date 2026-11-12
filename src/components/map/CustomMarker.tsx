// src/components/map/CustomMarker.tsx

import React from 'react';
import { Icon } from '@iconify/react';
import type { DetectionEvent } from '../types/Detection';

interface CustomMarkerProps {
  detection: DetectionEvent; // 👈 1. (เพิ่ม) ต้องรับ 'detection' เข้ามา
  color: string;
  iconName: string;
  onMarkerClick: (event: DetectionEvent) => void;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({ 
  detection, // 👈 2. (เพิ่ม) รับค่าจาก props
  color, 
  iconName, 
  onMarkerClick 
}) => {
  return (
    // 3. (เพิ่ม) ใส่ onClick ที่ <div> นอกสุด
    <div 
      className="custom-marker-container" 
      onClick={() => onMarkerClick(detection)} // 👈 4. (เพิ่ม) เรียกใช้ฟังก์ชัน
      style={{ cursor: 'pointer' }} // (เพิ่ม cursor ให้อารมณ์ปุ่ม)
    >
      {/* 1. วงที่เต้น (ลูก 1) */}
      <div 
        className="pulse-circle" 
        style={{ backgroundColor: color }} 
      />
      
      {/* 2. ไอคอนตรงกลาง (ลูก 2) */}
      <div 
        className="icon-marker" 
        style={{ borderColor: color }}
      >
        {/* 3. ไอคอน (หลาน) */}
        <Icon 
          icon={iconName} 
          style={{ color: color, fontSize: '24px' }} 
        />
      </div>
    </div>
  );
};

// (อย่าลืม export default ถ้าไฟล์ MapWrapper ใช้งาน)
export default CustomMarker;