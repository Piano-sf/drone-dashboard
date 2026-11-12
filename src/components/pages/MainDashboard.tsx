// src/components/pages/MainDashboard.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDetectionStore } from '../../store/detectionStore';
import type { DetectionEvent } from '../types/Detection';
import GlobalFilterBar from '../filters/GlobalFilterBar';
import DetectionFeed from '../feed/DetectionFeed';
import MapWrapper from '../map/MapWrapper';
import type { MapHandle } from '../map/MapWrapper'; // 👈 (MapHandle ถูก import แล้ว)
import ImageModal from '../common/ImageModal';
import styles from './MainDashboard.module.css';
import LiveClock from '../common/LiveClock'; 

const MARKER_TIMEOUT_MS = 15000; // 15 วินาที

const MainDashboard: React.FC = () => {
  
  // (Store... ไม่เปลี่ยนแปลง)
  const allOffensiveDetections = useDetectionStore(state => state.offensiveDetections);
  const allDefensiveDetections = useDetectionStore(state => state.defensiveDetections);
  const isOffensiveConnected = useDetectionStore(state => state.isOffensiveConnected);
  const isDefensiveConnected = useDetectionStore(state => state.isDefensiveConnected);
  
  // (State... ไม่เปลี่ยนแปลง)
  const [filterEventType, setFilterEventType] = useState('all');
  
  // (Ref ของ Map... ไม่เปลี่ยนแปลง)
  const offensiveMapRef = useRef<MapHandle>(null);
  const defensiveMapRef = useRef<MapHandle>(null);

  // (State Modal... ไม่เปลี่ยนแปลง)
  const [selectedEvent, setSelectedEvent] = useState<DetectionEvent | null>(null);

  // (useEffect Ticker... ไม่เปลี่ยนแปลง)
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const tickInterval = setInterval(() => { setCurrentTime(Date.now()); }, 5000); 
    return () => clearInterval(tickInterval);
  }, []);


  // --- (แก้ไข) ฟังก์ชัน Modal ---
  const handleOpenModal = (event: DetectionEvent, source: 'map' | 'feed') => {
    setSelectedEvent(event);
    
    // (เพิ่ม) ถ้าคลิกมาจาก 'feed' ให้โชว์ Pop-up บนแผนที่
    if (source === 'feed') {
      const firstObject = event.objects[0];
      if (!firstObject) return;
      
      if (event.camera.location === 'offence') {
        offensiveMapRef.current?.showPopupForObject(firstObject.obj_id);
      } else if (event.camera.location === 'defence') {
        defensiveMapRef.current?.showPopupForObject(firstObject.obj_id);
      }
    }
  };
  
  const handleCloseModal = () => {
    setSelectedEvent(null);
  };
  
  const handleGoToMap = () => {
    if (!selectedEvent) return;
    const firstObject = selectedEvent.objects[0];
    if (!firstObject) return;
    const { lat, lng } = firstObject;
    const location = selectedEvent.camera.location;
    if (location === 'offence') {
      offensiveMapRef.current?.flyTo(lng, lat, 18); // (เพิ่ม Zoom)
    } else if (location === 'defence') {
      defensiveMapRef.current?.flyTo(lng, lat, 18); // (เพิ่ม Zoom)
    }
  };

  // (useMemo... ทั้งหมดไม่เปลี่ยนแปลง)
  const filteredOffensiveDetections = useMemo(() => {
    return allOffensiveDetections.filter(event => {
      if (filterEventType === 'all') return true;
      return event.objects.some(obj => obj.type === filterEventType);
    });
  }, [allOffensiveDetections, filterEventType]);

  const filteredDefensiveDetections = useMemo(() => {
    return allDefensiveDetections.filter(event => {
      if (filterEventType === 'all') return true;
      return event.objects.some(obj => obj.type === filterEventType);
    });
  }, [allDefensiveDetections, filterEventType]);

  const mapOffensiveDetections = useMemo(() => {
    return filteredOffensiveDetections.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return (currentTime - eventTime) < MARKER_TIMEOUT_MS;
    });
  }, [filteredOffensiveDetections, currentTime]);

  const mapDefensiveDetections = useMemo(() => {
    return filteredDefensiveDetections.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return (currentTime - eventTime) < MARKER_TIMEOUT_MS;
    });
  }, [filteredDefensiveDetections, currentTime]);
  
  const offensiveTotal = mapOffensiveDetections.flatMap(e => e.objects).filter(obj => obj.type === 'drone').length;
  const defensiveTotal = mapDefensiveDetections.flatMap(e => e.objects).filter(obj => obj.type === 'drone').length;
  // -----------------------------------------------------------------

  return (
    <div className={styles.dashboardContainer}>
      
      {/* (Header Row... ไม่เปลี่ยนแปลง) */}
      <div className={styles.headerRow}>
        <div>
          <p style={{ color: isOffensiveConnected ? 'green' : 'red', margin: 0, fontSize: '0.9rem' }}>
            Offensive: {isOffensiveConnected ? 'Connected' : 'Connecting...'}
          </p>
          <p style={{ color: isDefensiveConnected ? 'green' : 'red', margin: 0, fontSize: '0.9rem' }}>
            Defensive: {isDefensiveConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
        <LiveClock />
        <GlobalFilterBar 
          eventType={filterEventType} onEventTypeChange={setFilterEventType}
        />
      </div>
      
      {/* --- Map Grid (แก้ไขการส่ง Prop) --- */}
      <div className={styles.mapGrid}>
        
        {/* Offensive Column */}
        <div className={styles.mapColumn}>
          {/* (mapHeader... ไม่เปลี่ยนแปลง) */}
          <div className={styles.mapHeader}>
            <h3>Offensive Map</h3>
            <div className={styles.statsContainer}>
              <span className={styles.statTotal}>Total: {offensiveTotal}</span>
            </div>
          </div>
          <div className={styles.mapWrapperContainer}> 
            <MapWrapper 
              ref={offensiveMapRef}
              mapId="offensive-map"
              initialLat={14.286425046137586}
              initialLng={101.1713052787928}
              initialZoom={16}
              detections={mapOffensiveDetections}
              // (แก้ไข) ส่ง lambda function เพื่อระบุ source 'map'
              onEventClick={(event) => handleOpenModal(event, 'map')} 
            />
          </div>
          <div className={styles.feedContainer}>
            <h4>Offensive Feed</h4>
            <DetectionFeed 
              detections={filteredOffensiveDetections}
              // (แก้ไข) ส่ง lambda function เพื่อระบุ source 'feed'
              onEventClick={(event) => handleOpenModal(event, 'feed')}
            />
          </div>
        </div>
        
        {/* Defensive Column */}
        <div className={styles.mapColumn}>
          {/* (mapHeader... ไม่เปลี่ยนแปลง) */}
          <div className={styles.mapHeader}>
            <h3>Defensive Map</h3>
            <div className={styles.statsContainer}>
              <span className={styles.statTotal}>Total: {defensiveTotal}</span>
            </div>
          </div>
          <div className={styles.mapWrapperContainer}>
            <MapWrapper 
              ref={defensiveMapRef}
              mapId="defensive-map"
              initialLat={14.297567}
              initialLng={101.166279}
              initialZoom={16}
              detections={mapDefensiveDetections}
              // (แก้ไข) ส่ง lambda function เพื่อระบุ source 'map'
              onEventClick={(event) => handleOpenModal(event, 'map')}
            />
          </div>
          <div className={styles.feedContainer}>
            <h4>Defensive Feed</h4>
            <DetectionFeed 
              detections={filteredDefensiveDetections}
              // (แก้ไข) ส่ง lambda function เพื่อระบุ source 'feed'
              onEventClick={(event) => handleOpenModal(event, 'feed')}
            />
          </div>
        </div>
        
      </div>

      {/* (ImageModal... ไม่เปลี่ยนแปลง) */}
      <ImageModal 
        isOpen={!!selectedEvent}
        onClose={handleCloseModal}
        event={selectedEvent}
        onGoToMap={handleGoToMap}
      />
      
    </div>
  );
};

export default MainDashboard;