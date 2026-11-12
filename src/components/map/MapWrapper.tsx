// src/components/map/MapWrapper.tsx

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './MapWrapper.module.css';
import { CustomMarker } from './CustomMarker'; 
import { DetectionPopup } from './DetectionPopup'; 
import type { DetectionEvent} from '../types/Detection';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// (Props... ไม่เปลี่ยนแปลง)
type MapWrapperProps = {
  mapId: string;
  initialLng?: number;
  initialLat?: number;
  initialZoom?: number;
  initialPitch?: number; 
  initialBearing?: number;
  detections: DetectionEvent[];
  onEventClick: (event: DetectionEvent) => void;
};

// --- (แก้ไข) เพิ่ม showPopupForObject ใน Handle ---
export type MapHandle = {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  showPopupForObject: (objectId: string) => void; // 👈 (เพิ่ม)
};

// (getIconForType... ไม่เปลี่ยนแปลง)
const getIconForType = (type: string) => {
  if (type === 'drone') return "healthicons:drone";
  if (type === 'person') return "mdi:account";
  return "mdi:help-circle";
};

// (MapMarker type... ไม่เปลี่ยนแปลง)
type MapMarker = {
  marker: mapboxgl.Marker;
  markerRoot: Root;
  popup: mapboxgl.Popup;
  popupRoot: Root;
};

const MapWrapper = forwardRef<MapHandle, MapWrapperProps>(({
  mapId,
  initialLng = 101.166279, 
  initialLat = 14.297567,   
  initialZoom = 16,
  initialPitch = 0,       
  initialBearing = 0,     
  detections,
  onEventClick, // 👈 นี่คือ handleOpenModal
}, ref) => {
  
  const wrapperRef = useRef<HTMLDivElement>(null); 
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markerMapRef = useRef<Map<string, MapMarker>>(new Map());

  // --- (แก้ไข) เพิ่มฟังก์ชัน showPopupForObject ---
  useImperativeHandle(ref, () => ({
    flyTo: (lng, lat, zoom = 16) => {
      mapRef.current?.flyTo({ 
        center: [lng, lat], 
        zoom: zoom, 
        pitch: initialPitch,
        bearing: initialBearing,
        essential: true 
      });
    },
    
    // 👈 (เพิ่มฟังก์ชันนี้)
    showPopupForObject: (objectId: string) => {
      const mapMarker = markerMapRef.current.get(objectId);
      if (mapMarker && mapRef.current) {
        // ปิด Pop-up อื่นๆ ที่อาจจะเปิดอยู่
        markerMapRef.current.forEach(m => m.popup.remove());
        // เปิด Pop-up ของ Marker นี้
        mapMarker.popup.addTo(mapRef.current);
      }
    }
  }), [initialPitch, initialBearing]); // (ยังคง dependencies เดิม)

  // (useEffect ที่ 1: สร้าง Map... มีการแก้ไขเล็กน้อย)
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [initialLng, initialLat], 
      zoom: initialZoom,
      pitch: initialPitch,
      bearing: initialBearing,
      trackResize: true
    });
    
    mapRef.current = map;

    map.on('load', () => {
      setIsMapLoaded(true);
      setTimeout(() => { map.resize(); }, 1); 
      // (โค้ด 3D Terrain... ไม่เปลี่ยนแปลง)
      if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', { 'type': 'raster-dem', 'url': 'mapbox://mapbox.mapbox-terrain-dem-v1C', 'tileSize': 512, 'maxzoom': 14 });
      }
      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
      map.addLayer({ 'id': 'sky', 'type': 'sky', 'paint': { 'sky-type': 'atmosphere', 'sky-atmosphere-sun': [0.0, 0.0], 'sky-atmosphere-sun-intensity': 5 }});
    });
    
    // (เพิ่ม) เมื่อคลิกที่แผนที่ ให้ปิด Pop-up ทั้งหมด
    map.on('click', () => {
      markerMapRef.current.forEach(m => m.popup.remove());
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [initialLng, initialLat, initialZoom, initialPitch, initialBearing]); 

  // (useEffect ที่ 2: อัปเดต Markers... มีการแก้ไขเล็กน้อย)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const currentMarkerMap = markerMapRef.current;
    
    const currentObjectIds = new Set<string>();
    const processedObjectIds = new Set<string>();

    detections.forEach((event) => {
      const color = event.camera.location === 'offence' ? '#E74C3C' : '#3498DB';

      event.objects.forEach((object) => {
        const objectId = object.obj_id; 
        if (processedObjectIds.has(objectId)) return; 
        processedObjectIds.add(objectId);
        currentObjectIds.add(objectId);
        const iconName = getIconForType(object.type);

        if (currentMarkerMap.has(objectId)) {
          const { marker, markerRoot, popupRoot } = currentMarkerMap.get(objectId)!;
          marker.setLngLat([object.lng, object.lat]);
          markerRoot.render(
            <CustomMarker 
              detection={event} 
              color={color} 
              iconName={iconName} 
              onMarkerClick={onEventClick} // 👈 เรียก handleOpenModal
            />
          );
          popupRoot.render(<DetectionPopup event={event} object={object} />);
        } else {
          const markerEl = document.createElement('div');
          // (เพิ่ม) สั่งให้ event click ของ Marker ไม่ลามไปถึง Map
          markerEl.addEventListener('click', (e) => e.stopPropagation()); 
          
          const markerRoot = createRoot(markerEl);
          markerRoot.render(
            <CustomMarker 
              detection={event} 
              color={color} 
              iconName={iconName} 
              onMarkerClick={onEventClick} // 👈 เรียก handleOpenModal
            />
          );
          
          const popupEl = document.createElement('div');
          const popupRoot = createRoot(popupEl);
          popupRoot.render(<DetectionPopup event={event} object={object} />);

          const popup = new mapboxgl.Popup({ 
              offset: 30,
              closeButton: false,
              className: 'custom-popup'
            })
            .setDOMContent(popupEl);

          const marker = new mapboxgl.Marker(markerEl) 
            .setLngLat([object.lng, object.lat])
            // .setPopup(popup) // 👈 (ยังคง Comment out ไว้เหมือนเดิม)
            .addTo(map);
            
          currentMarkerMap.set(objectId, { marker, markerRoot, popup, popupRoot });
        }
      });
    });

    // (ลบ Marker เก่า... ไม่เปลี่ยนแปลง)
    currentMarkerMap.forEach(({ marker, markerRoot, popupRoot }, id) => {
        if (!currentObjectIds.has(id)) {
            markerRoot.unmount(); 
            popupRoot.unmount();
            marker.remove(); 
            currentMarkerMap.delete(id); 
        }
    });
  }, [isMapLoaded, detections, onEventClick]); 

  
  // (useEffect ที่ 3: ResizeObserver... ไม่เปลี่ยนแปลง)
  useEffect(() => {
    const map = mapRef.current;
    const container = wrapperRef.current; 
    if (!map || !container) return;
    const resizeObserver = new ResizeObserver(() => { map.resize(); });
    resizeObserver.observe(container);
    return () => { resizeObserver.unobserve(container); };
  }, [isMapLoaded]);

  // (JSX Return... ไม่เปลี่ยนแปลง)
  return (
    <div 
      ref={wrapperRef} 
      id={mapId} 
      className={styles.mapContainer} 
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <div 
        ref={mapContainerRef} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
      {!isMapLoaded && (
        <div className={styles.loadingOverlay}>
          <span>Loading Map...</span>
        </div>
      )}
    </div>
  );
});

export default MapWrapper;