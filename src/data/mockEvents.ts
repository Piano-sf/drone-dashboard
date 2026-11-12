// src/data/mockEvents.ts

import type { DetectionEvent } from '../components/types/Detection';

// สร้าง Mock Event ที่มีโครงสร้างเหมือนข้อมูลจริงจาก TESA API
const MOCK_DRONE_EVENT_OFFENSIVE: DetectionEvent = {
  cam_id: '8bfbd664-1853-45c9-a7c2-79976755ad43', // 👈 ใช้ ID เดียวกับใน useSocket
  timestamp: new Date().toISOString(),
  camera: {
    id: '8bfbd664-1853-45c9-a7c2-79976755ad43',
    name: 'UTCC-ALPHA-CAM',
    location: 'offence', // 👈 จะแสดงบน Offensive Map
  },
  image: {
    // 👈 ใส่ชื่อไฟล์ภาพที่ YOLO อาจจะสร้างขึ้นมาจริง (ถ้าไม่มี ให้ใช้ placeholder)
    path: 'sample_drone_01.jpg', 
  },
  objects: [
    {
      obj_id: 'D-888',
      type: 'drone',
      lat: 13.736000, // 👈 ตำแหน่งบนแผนที่ Offensive Map (แถวๆ UTCC)
      lng: 100.522500,
      objective: 'enemy',
      size: 'medium',
    },
    {
      obj_id: 'D-889',
      type: 'drone',
      lat: 13.737500, 
      lng: 100.524000,
      objective: 'enemy',
      size: 'small',
    },
  ],
};

const MOCK_DRONE_EVENT_DEFENSIVE: DetectionEvent = {
  cam_id: 'DEFENSE-CAM-001', 
  timestamp: new Date(Date.now() - 60000).toISOString(), // ย้อนหลังไป 1 นาที
  camera: {
    id: 'DEFENSE-CAM-001',
    name: 'UTCC-BETA-CAM',
    location: 'defence', // 👈 จะแสดงบน Defensive Map
  },
  image: {
    path: 'sample_person_01.jpg', 
  },
  objects: [
    {
      obj_id: 'P-101',
      type: 'person',
      lat: 13.735000, // 👈 ตำแหน่งบนแผนที่ Defensive Map
      lng: 100.525000,
      objective: 'unknown',
      size: 'large',
    },
  ],
};

export const initialMockEvents: DetectionEvent[] = [
  MOCK_DRONE_EVENT_OFFENSIVE,
  MOCK_DRONE_EVENT_DEFENSIVE,
];