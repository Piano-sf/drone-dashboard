// src/store/detectionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DetectionEvent } from '../components/types/Detection';

interface DetectionState {
  // Data State
  offensiveDetections: DetectionEvent[];
  defensiveDetections: DetectionEvent[];

  // Connection State
  isOffensiveConnected: boolean;
  isDefensiveConnected: boolean;

  // Actions (ฟังก์ชันสำหรับอัปเดต State)
  addOffensiveDetection: (detection: DetectionEvent) => void;
  addDefensiveDetection: (detection: DetectionEvent) => void;
  setOffensiveStatus: (status: boolean) => void;
  setDefensiveStatus: (status: boolean) => void;
  
  // --- (เพิ่ม) Actions สำหรับล้างข้อมูล ---
  clearOffensiveDetections: () => void;
  clearDefensiveDetections: () => void;
}

export const useDetectionStore = create<DetectionState>()(
  persist(
    (set) => ({
      // --- ค่าเริ่มต้น ---
      offensiveDetections: [],
      defensiveDetections: [],
      isOffensiveConnected: false,
      isDefensiveConnected: false,

      // --- Actions (ที่เพิ่มข้อมูล) ---
      addOffensiveDetection: (detection) =>
        set((state) => ({
          offensiveDetections: [detection, ...state.offensiveDetections],
        })),
        
      addDefensiveDetection: (detection) =>
        set((state) => ({
          defensiveDetections: [detection, ...state.defensiveDetections],
        })),

      // --- Actions (ที่ตั้งสถานะ) ---
      setOffensiveStatus: (status) => set({ isOffensiveConnected: status }),
      setDefensiveStatus: (status) => set({ isDefensiveConnected: status }),
      
      // --- (เพิ่ม) การทำงานของ Actions ใหม่ ---
      clearOffensiveDetections: () => set({ offensiveDetections: [] }),
      clearDefensiveDetections: () => set({ defensiveDetections: [] }),
    }),
    {
      name: 'drone-detection-storage', // (ชื่อ storage)
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);