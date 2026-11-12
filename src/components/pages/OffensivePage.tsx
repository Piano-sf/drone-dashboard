// src/components/pages/OffensivePage.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDetectionStore } from '../../store/detectionStore';
import type { DetectionEvent } from '../types/Detection';
import MapWrapper from '../map/MapWrapper';
import type { MapHandle } from '../map/MapWrapper';
import DetectionFeed from '../feed/DetectionFeed';
import ImageModal from '../common/ImageModal';
import { DroneListDropdown } from '../common/DroneListDropdown'; // (Import)
import StatsPieChart from '../common/StatsPieChart';
import styles from './OffensivePage.module.css'; // (ใช้ CSS เดิม)
import LocationDisplay from '../common/LocationDisplay.tsx';

const MARKER_TIMEOUT_MS = 15000; 

const OffensivePage: React.FC = () => {
  
  // --- ( Logic ทั้งหมดเหมือนเดิม ไม่ต้องแก้ ) ---
  const allDetections = useDetectionStore(state => state.offensiveDetections);
  //const isConnected = useDetectionStore(state => state.isOffensiveConnected);
  
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
    mapRef.current?.flyTo(lng, lat, 18);
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
    // --- ✨ (แก้ไข) Layout ใหม่ทั้งหมด ✨ ---
    <div className={styles.pageContainer}>
      
      {/* 1. คอลัมน์ซ้าย (แผนที่) */}
      <div className={styles.mapColumn}>
        
        {/* 1.1 (แก้ไข) Header ของ Map (ย้าย Dropdown มาไว้ที่นี่) */}
        <div className={styles.mapHeader}>
          <h3>Offensive Map</h3>
          <LocationDisplay />
          <div className={styles.dropdownWrapper}>
            <DroneListDropdown 
              activeDetections={mapActiveDetections}
              onDroneSelect={handleDroneSelect}
            />
          </div>
        </div>
        
        {/* 1.2 (แก้ไข) Map Container (ขยายเต็มพื้นที่ที่เหลือ) */}
        <div className={styles.mapContainer}>
          <MapWrapper 
            ref={mapRef}
            mapId="offensive-map-full"
            initialLat={14.286425}
            initialLng={101.171305}
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
        
        {/* 2.2 (แก้ไข) Feed (ย้ายมาอยู่ล่าง Stats) */}
        <div className={styles.feedContainer}>
          <h4>Offensive Feed</h4>
          <DetectionFeed 
            detections={filteredDetections}
            onEventClick={handleOpenModal}
          />
        </div>
        
        {/* (listContainer ถูกลบไปแล้ว เพราะ Dropdown ย้ายที่) */}
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

export default OffensivePage;