// กำหนด Type Mockup สำหรับ Detection Event
// (สมมติว่า Type นี้ถูกใช้ร่วมกันใน store/hook)

export type DetectionObject = {
  obj_id: string; // ID ที่ไม่ซ้ำกันของวัตถุ
  type: 'drone' | 'person' | string;
  size: 'small' | 'medium' | 'large' | string;
  lng: number; // ลองจิจูด
  lat: number; // ละติจูด
};

export type CameraInfo = {
  id: string;
  name: string;
  location: 'offence' | 'defence' | string;
};

export type DetectionEvent = {
  event_id: string;
  timestamp: number;
  camera: CameraInfo;
  objects: DetectionObject[];
};