// src/components/common/ImageModal.tsx

import React, { useState, useEffect } from 'react'; // 👈 (Import hooks)
import type { DetectionEvent } from '../types/Detection';
import styles from './ImageModal.module.css';

const API_BASE_URL = 'https://tesa-api.crma.dev';
const placeholderUrl = 'https://via.placeholder.com/800x600'; // (รูปสำรองใหญ่ขึ้น)

// (ฟังก์ชันช่วย) จัดการ Timestamp ให้อ่านง่าย
const formatTimestamp = (isoString: string) => {
  try {
    return new Date(isoString).toLocaleString('en-US', { // (ใช้อังกฤษจะได้ format สวย)
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  } catch {
    return 'Invalid Date';
  }
};

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: DetectionEvent | null;
  onGoToMap: () => void; // 👈 1. (เพิ่ม) รับฟังก์ชันใหม่
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, event, onGoToMap }) => {
  
  // 👈 2. (เพิ่ม) State & Effect สำหรับ Fetch รูปภาพ
  const [imageUrl, setImageUrl] = useState(placeholderUrl);

  useEffect(() => {
    // ถ้ารูปไม่พร้อม หรือ Modal ไม่ได้เปิด ก็ไม่ต้องทำอะไร
    if (!isOpen || !event || !event.image || !event.image.path) {
      setImageUrl(placeholderUrl);
      return;
    }

    const url = `${API_BASE_URL}${event.image.path}`; // (ใช้ Path ที่แก้แล้ว)
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      try {
        // อ่าน Token จาก .env
        const token = event.camera.location === 'offence'
          ? import.meta.env.VITE_OFFENSIVE_TOKEN
          : import.meta.env.VITE_DEFENSIVE_TOKEN;

        const response = await fetch(url, {
          headers: { 'x-camera-token': token }
        });

        if (!response.ok) throw new Error('Failed to fetch modal image');

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch (error) {
        console.error('Error fetching modal image:', url, error);
        setImageUrl(placeholderUrl);
      }
    };

    fetchImage();

    // Cleanup
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, event]); // (ให้รันใหม่ทุกครั้งที่ Modal เปิด หรือ Event เปลี่ยน)

  // 👈 3. (เพิ่ม) ฟังก์ชันที่เรียกเมื่อกดปุ่ม
  const handleGoToMapClick = () => {
    onGoToMap(); // เรียกฟังก์ชันที่แม่ส่งมา
    onClose();   // สั่งปิด Modal
  };

  if (!isOpen || !event) {
    return null;
  }
  
  const firstObject = event.objects[0];

  return (
    // Backdrop (พื้นหลังมืดๆ)
    <div className={styles.backdrop} onClick={onClose}>
      
      {/* ตัว Modal (หยุดการ "ทะลุ" ของ click) */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        
        <div className={styles.modalContent}>
          
          {/* 4.1. ฝั่งรูปภาพ (ซ้าย) */}
          <div className={styles.imageContainer}>
            {/* 👈 4. (แก้ไข) ใช้ State 'imageUrl' */}
            <img src={imageUrl} alt={firstObject?.type || 'detection'} />
            {/* (เรายังวาด BBox ไม่ได้ เพราะขาดข้อมูล) */}
          </div>
          
          {/* 4.2. ฝั่งข้อมูล (ขวา) */}
          <div className={styles.detailsContainer}>
            <h3>Event Details</h3>
            
            <div className={styles.detailItem}>
              <span>Timestamp:</span>
              <p>{formatTimestamp(event.timestamp)}</p>
            </div>
            
            <div className={styles.detailItem}>
              <span>Event ID:</span>
              <p>{firstObject?.obj_id || 'N/A'}</p>
            </div>

            <div className={styles.detailItem}>
              <span>Camera Name:</span>
              <p>{event.camera.name}</p>
            </div>
            
            <div className={styles.detailItem}>
              <span>Type:</span>
              <p>{firstObject?.type.toUpperCase() || 'N/A'}</p>
            </div>

            <div className={styles.detailItem}>
              <span>Objective:</span>
              <p>{firstObject?.objective || 'N/A'}</p>
            </div>

            <div className={styles.detailItem}>
              <span>Location (Lat/Lng):</span>
              <p>{firstObject ? `${firstObject.lat.toFixed(6)}, ${firstObject.lng.toFixed(6)}` : 'N/A'}</p>
            </div>
            
            {/* ปุ่มตามดีไซน์ */}
            <div className={styles.buttonGroup}>
              {/* 👈 5. (แก้ไข) เปิดใช้งานปุ่ม และใส่ onClick */}
              <button 
                className={styles.buttonPrimary} 
                onClick={handleGoToMapClick}
              >
                Go to Map
              </button>
              <button className={styles.buttonSecondary} disabled>Download</button>
              <button className={styles.buttonSecondary} disabled>Share</button>
              <button className={styles.buttonSecondary} disabled>Hide BBox</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;