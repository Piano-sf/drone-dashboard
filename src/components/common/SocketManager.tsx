// src/components/common/SocketManager.tsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useDetectionStore } from '../../store/detectionStore';
import type { DetectionEvent } from '../types/Detection';

// --- (Interface สำหรับข้อมูลดิบจาก Socket) ---
interface SocketDetectionData {
  cam_id: string;
  timestamp: string;
  camera: {
    id: string;
    name: string;
    location: 'defence' | 'offence';
  };
  image: {
    path: string;
  };
  objects: Array<{
    obj_id: string;
    type: string;
    lat: number;
    lng: number;
    objective: 'unknown' | 'our' | 'enemy';
    size: 'small' | 'medium' | 'large';
  }>;
}

const SOCKET_URL = "https://tesa-api.crma.dev";

export function SocketManager() {
  // --- (1. ดึง Actions ใหม่ 2 ตัวออกมา) ---
  const {
    addOffensiveDetection,
    setOffensiveStatus,
    addDefensiveDetection,
    setDefensiveStatus,
    clearOffensiveDetections, // (เพิ่ม)
    clearDefensiveDetections  // (เพิ่ม)
  } = useDetectionStore();

  useEffect(() => {
    console.log('[SocketManager] useEffect running. Connecting to:', SOCKET_URL);

    // (สร้าง Socket โดยอ่านจาก .env)
    const offensiveSocket = io(SOCKET_URL, {
      query: { 
        cam_id: import.meta.env.VITE_OFFENSIVE_CAM_ID, 
        token: import.meta.env.VITE_OFFENSIVE_TOKEN 
      }
    });
    
    const defensiveSocket = io(SOCKET_URL, {
      query: { 
        cam_id: import.meta.env.VITE_DEFENSIVE_CAM_ID, 
        token: import.meta.env.VITE_DEFENSIVE_TOKEN 
      }
    });

    // --- 🚀 จัดการ Offensive Events ---
    offensiveSocket.on('connect', () => {
      console.log('✅ [Offensive] Socket Connected. Subscribing...');
      setOffensiveStatus(true);
      offensiveSocket.emit('subscribe_camera', { 
        cam_id: import.meta.env.VITE_OFFENSIVE_CAM_ID 
      });
    });

    offensiveSocket.on('disconnect', () => {
      console.warn('⚠️ [Offensive] Socket Disconnected');
      setOffensiveStatus(false);
      
      // --- (2. สั่งล้างข้อมูลเมื่อหลุด!) ---
      clearOffensiveDetections();
    });

    offensiveSocket.on('object_detection', (data: SocketDetectionData) => { 
      console.log('📬 [Offensive] Data Received:', data);
      const formattedData: DetectionEvent = {
        cam_id: data.cam_id,
        camera: data.camera,
        timestamp: Date.parse(data.timestamp),
        image: data.image,
        objects: data.objects,
      };
      addOffensiveDetection(formattedData);
    });

    offensiveSocket.on('connect_error', (err: Error) => {
      console.error('❌ [Offensive] Connection Error:', err.message);
    });

    // --- 🚀 จัดการ Defensive Events ---
    defensiveSocket.on('connect', () => {
      console.log('✅ [Defensive] Socket Connected. Subscribing...');
      setDefensiveStatus(true);
      defensiveSocket.emit('subscribe_camera', { 
        cam_id: import.meta.env.VITE_DEFENSIVE_CAM_ID 
      });
    });

    defensiveSocket.on('disconnect', () => {
      console.warn('⚠️ [Defensive] Socket Disconnected');
      setDefensiveStatus(false);

      // --- (3. สั่งล้างข้อมูลเมื่อหลุด!) ---
      clearDefensiveDetections();
    });

    defensiveSocket.on('object_detection', (data: SocketDetectionData) => { 
      console.log('📬 [Defensive] Data Received:', data);
      const formattedData: DetectionEvent = {
        cam_id: data.cam_id,
        camera: data.camera,
        timestamp: Date.parse(data.timestamp),
        image: data.image,
        objects: data.objects,
      };
      addDefensiveDetection(formattedData);
    });

    defensiveSocket.on('connect_error', (err: Error) => {
      console.error('❌ [Defensive] Connection Error:', err.message);
    });

    // --- (Cleanup function) ---
    return () => {
      console.log('[SocketManager] Cleaning up. Unsubscribing and Disconnecting.');
      
      if (offensiveSocket.connected) {
        offensiveSocket.emit('unsubscribe_camera', { 
          cam_id: import.meta.env.VITE_OFFENSIVE_CAM_ID 
        });
      }
      if (defensiveSocket.connected) {
        defensiveSocket.emit('unsubscribe_camera', { 
          cam_id: import.meta.env.VITE_DEFENSIVE_CAM_ID 
        });
      }
      
      offensiveSocket.disconnect();
      defensiveSocket.disconnect();
    };
    
  }, [ // (4. เพิ่ม actions ใหม่ใน dependency array)
    addOffensiveDetection, setOffensiveStatus, 
    addDefensiveDetection, setDefensiveStatus,
    clearOffensiveDetections, clearDefensiveDetections
  ]);

  return null;
}