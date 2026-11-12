// src/hooks/useSocket.ts

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
// 👈 Import Type (ตรวจสอบ path ให้ถูกต้อง)
import type { DetectionEvent } from '../components/types/Detection'; 

const SOCKET_URL = 'https://tesa-api.crma.dev';

// (Hook รับ camId และ token เป็นพารามิเตอร์)
export const useSocket = (camId: string, token: string) => { 
  const [socket, setSocket] = useState<Socket | null>(null);
  const [realtimeData, setRealtimeData] = useState<DetectionEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // (useEffect นี้จะทำงานใหม่ "ทุกครั้งที่" camId หรือ token เปลี่ยน)
  useEffect(() => {
    
    // (ถ้าไม่มี camId หรือ token... ก็ไม่ต้องทำอะไร)
    if (!camId || !token) {
      console.log('Waiting for Camera ID and Token...');
      setIsConnected(false);
      return; 
    }

    console.log(`Attempting to connect with CamID: ${camId}`);
    
    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: token // 👈 ใช้ token จากพารามิเตอร์
      }
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to socket server, subscribing...');
      setIsConnected(true);
      socketInstance.emit('subscribe_camera', { cam_id: camId }); // 👈 ใช้ camId จากพารามิเตอร์
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
      setIsConnected(false);
    });

    socketInstance.on('object_detection', (data: DetectionEvent) => {
      console.log('📡 Received object detection:', data);
      setRealtimeData(data);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection Error:', err.message);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup function
    return () => {
      if (socketInstance) {
        console.log('Cleaning up old socket connection...');
        socketInstance.emit('unsubscribe_camera', { cam_id: camId });
        socketInstance.disconnect();
      }
    };
  }, [camId, token]); // 👈 (ทำงานใหม่เมื่อค่านี้เปลี่ยน)

  return { socket, realtimeData, isConnected };
};