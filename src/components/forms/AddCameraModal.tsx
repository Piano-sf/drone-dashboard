import React, { useState } from 'react';
import styles from './AddCameraModal.module.css';
import type { Detection } from '../types/Detection';

type AddCameraModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newDetection: Detection) => void; // ส่ง object Detection กลับไป
};

const AddCameraModal: React.FC<AddCameraModalProps> = ({ isOpen, onClose, onSubmit }) => {
  // State สำหรับเก็บค่าในฟอร์ม
  const [cameraId, setCameraId] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [lat, setLat] = useState(17.9284);
  const [lng, setLng] = useState(102.7891);
  const [context, setContext] = useState<'offensive' | 'defensive'>('defensive');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraId || !tokenId) {
      alert("Please fill in Camera ID and Token ID"); // (ชั่วคราว)
      return;
    }

    // จำลองการสร้าง "Detection Event" ใหม่จากฟอร์ม
    const newMockDetection: Detection = {
      id: `evt_cam_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      camera_id: cameraId,
      token_id: tokenId,
      lat: Number(lat),
      lng: Number(lng),
      confidence: 0.95,
      type: "approach",
      thumbnail_url: `https://placehold.co/60x60/${context === 'offensive' ? 'E74C3C' : '3498DB'}/FFFFFF?text=NEW`,
      image_url: `https://placehold.co/600x400/${context === 'offensive' ? 'E74C3C' : '3498DB'}/FFFFFF?text=${cameraId}`,
      bbox: [50, 50, 150, 150],
      context: context,
    };

    onSubmit(newMockDetection); // ส่งข้อมูลกลับไปที่ MainDashboard
    
    // เคลียร์ฟอร์ม
    setCameraId('');
    setTokenId('');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h3>Add New Camera / Token</h3>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="camId">Camera ID*</label>
            <input 
              type="text" 
              id="camId" 
              value={cameraId} 
              onChange={(e) => setCameraId(e.target.value)} 
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="tokenId">Token ID*</label>
            <input 
              type="text" 
              id="tokenId" 
              value={tokenId} 
              onChange={(e) => setTokenId(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="lat">Latitude</label>
              <input 
                type="number" 
                id="lat" 
                value={lat} 
                onChange={(e) => setLat(Number(e.target.value))} 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lng">Longitude</label>
              <input 
                type="number" 
                id="lng" 
                value={lng} 
                onChange={(e) => setLng(Number(e.target.value))} 
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Context (Show on map)</label>
            <div className={styles.radioGroup}>
              <label>
                <input 
                  type="radio" 
                  value="defensive" 
                  checked={context === 'defensive'} 
                  onChange={() => setContext('defensive')} 
                /> Defensive (Map B)
              </label>
              <label>
                <input 
                  type="radio" 
                  value="offensive" 
                  checked={context === 'offensive'} 
                  onChange={() => setContext('offensive')} 
                /> Offensive (Map A)
              </label>
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>Save (Mock Event)</button>
        </form>
      </div>
    </div>
  );
};

export default AddCameraModal;