import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDetectionStore } from '../../store/detectionStore';
import type { DetectionEvent } from '../types/Detection';
import MapWrapper from '../map/MapWrapper';
import type { MapHandle } from '../map/MapWrapper';
import DetectionFeed from '../feed/DetectionFeed';
import ImageModal from '../common/ImageModal';
import { DroneListDropdown } from '../common/DroneListDropdown';
import StatsPieChart from '../common/StatsPieChart';
import styles from './DefensivePage.module.css'; // 👈 (ใช้ CSS ของตัวเอง)
import LocationDisplay from '../common/LocationDisplay';

const MARKER_TIMEOUT_MS = 15000; // (ใช้ Time-out เดียวกัน)

const DefensivePage: React.FC = () => {
  
  // --- 1. (แก้ไข) ดึงข้อมูล "Defensive" จาก Store ---
  const allDetections = useDetectionStore(state => state.defensiveDetections);
  //const isConnected = useDetectionStore(state => state.isDefensiveConnected);
  
  // --- (Logic ทั้งหมดเหมือนเดิม) ---
  const mapRef = useRef<MapHandle>(null);
  const [selectedEvent, setSelectedEvent] = useState<DetectionEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const tickInterval = setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => clearInterval(tickInterval);
  }, []);

  const handleOpenModal = (event: DetectionEvent) => setSelectedEvent(event);
  const handleCloseModal = () => setSelectedEvent(null);
  
  const handleGoToMap = () => {
    if (!selectedEvent) return;
    const firstObject = selectedEvent.objects[0];
    if (firstObject) {
      mapRef.current?.flyTo(firstObject.lng, firstObject.lat);
    }
  };

  const handleDroneSelect = (lng: number, lat: number) => {
    mapRef.current?.flyTo(lng, lat);
  };

  const filteredDetections = allDetections;
  const mapActiveDetections = useMemo(() => {
    return filteredDetections.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return (currentTime - eventTime) < MARKER_TIMEOUT_MS;
    });
  }, [filteredDetections, currentTime]);

  const total = filteredDetections.flatMap(e => e.objects).length;
  const active = mapActiveDetections.flatMap(e => e.objects).length;
  const lost = total - active;

  const totalForPercent = total === 0 ? 1 : total;
  const activePercent = Math.round((active / totalForPercent) * 100);
  const lostPercent = 100 - activePercent;
  // --- ( จบ Logic ) ---


  return (
    // --- (Layout เหมือนเดิม แต่เปลี่ยนชื่อ) ---
    <div className={styles.pageContainer}>
      
      {/* 1. คอลัมน์ซ้าย (แผนที่) */}
      <div className={styles.mapColumn}>
        
        <div className={styles.mapHeader}>
          <h3>Defensive Map</h3> {/* 👈 (แก้ไข) */}
          <LocationDisplay />
          <div className={styles.dropdownWrapper}>
            <DroneListDropdown 
              activeDetections={mapActiveDetections}
              onDroneSelect={handleDroneSelect}
            />
          </div>
        </div>
        
        <div className={styles.mapContainer}>
          <MapWrapper 
            ref={mapRef}
            mapId="defensive-map-full" // 👈 (แก้ไข)
            initialLat={14.297567}     // 👈 (แก้ไข) พิกัด Defensive
            initialLng={101.166279}     // 👈 (แก้ไข) พิกัด Defensive
            initialZoom={16}
            detections={mapActiveDetections}
            onEventClick={handleOpenModal} 
          />
        </div>
      </div>

      {/* 2. คอลัมน์ขวา (Sidebar) */}
      <div className={styles.sidebarColumn}>
        
        {/* 2.1 Stats (อยู่บน) */}
        <div className={styles.statsColumn}>
          <h3>Statistics</h3>
          <div className={styles.chartContainer}>
            <StatsPieChart active={active} lost={lost} />
          </div>
          <div className={styles.statsTexts}>
            <span>Total: {total}</span>
            <span className={styles.active}>Active: {active} ({activePercent}%)</span>
            <span className={styles.lost}>Lost: {lost} ({lostPercent}%)</span>
          </div>
        </div>
        
        {/* 2.2 Feed (อยู่ล่าง Stats) */}
        <div className={styles.feedContainer}>
          <h4>Defensive Feed</h4> {/* 👈 (แก้ไข) */}
          <DetectionFeed 
            detections={filteredDetections}
            onEventClick={handleOpenModal}
          />
        </div>
        
      </div>

      {/* 3. Modal (เหมือนเดิม) */}
      <ImageModal 
        isOpen={!!selectedEvent}
        onClose={handleCloseModal}
        event={selectedEvent}
        onGoToMap={handleGoToMap}
      />
      
    </div>
  );
};

export default DefensivePage;