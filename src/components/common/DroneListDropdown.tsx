// src/components/common/DroneListDropdown.tsx

import React, { useMemo } from 'react';
import type { DetectionEvent, DetectedObject } from '../types/Detection';
import styles from './DroneListDropdown.module.css';

interface DroneListProps {
  // รับ Detections ที่ "Active" (ที่ยังไม่หมดเวลา)
  activeDetections: DetectionEvent[]; 
  onDroneSelect: (lng: number, lat: number) => void;
}

export const DroneListDropdown: React.FC<DroneListProps> = ({ activeDetections, onDroneSelect }) => {

  // 1. "คลี่" และ "กรอง" Detections ให้เหลือแต่ Drone ที่ไม่ซ้ำกัน
  const uniqueDrones = useMemo(() => {
    const droneMap = new Map<string, DetectedObject>();

    // วนลูป Detections ทั้งหมด
    activeDetections.forEach(event => {
      event.objects.forEach(obj => {
        // เอาเฉพาะ Type 'drone' และตัวที่ยังไม่เคยเพิ่ม
        if (obj.type === 'drone' && !droneMap.has(obj.obj_id)) {
          droneMap.set(obj.obj_id, obj);
        }
      });
    });

    // แปลง Map กลับเป็น Array
    return Array.from(droneMap.values());
  }, [activeDetections]); // (คำนวณใหม่เมื่อ Detections เปลี่ยน)

  // 2. Handler เมื่อมีการ "เลือก" Dropdown
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const selectedDrone = uniqueDrones.find(d => d.obj_id === selectedId);
    
    if (selectedDrone) {
      // ส่งพิกัดกลับไปให้ Page แม่ (OffensivePage)
      onDroneSelect(selectedDrone.lng, selectedDrone.lat);
    }
  };

  return (
    <div className={styles.dropdownContainer}>
      <select className={styles.dropdown} onChange={handleChange}>
        <option value="">DroneList ({uniqueDrones.length})</option>
        {uniqueDrones.map(drone => (
          <option key={drone.obj_id} value={drone.obj_id}>
            {drone.obj_id} (Obj: {drone.objective})
          </option>
        ))}
      </select>
    </div>
  );
};