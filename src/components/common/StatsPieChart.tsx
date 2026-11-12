// src/components/common/StatsPieChart.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2'; // 👈 1. (แก้ไข) เปลี่ยนจาก Doughnut
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

// ลงทะเบียน components ที่จำเป็นของ Chart.js
ChartJS.register(ArcElement, Tooltip);

interface ChartProps {
  active: number;
  lost: number;
}

export const StatsPieChart: React.FC<ChartProps> = ({ active, lost }) => {

  const data = {
    labels: ['Active', 'Lost'],
    datasets: [
      {
        label: 'Detections',
        data: [active, lost],
        backgroundColor: [
          '#28a745', // สีเขียว (Active)
          '#dc3545', // สีแดง (Lost)
        ],
        borderColor: [ // (สีขอบ)
          '#28a745',
          '#dc3545',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    
    // 👈 2. (ลบ) cutout: '70%', (เพื่อทำให้เป็นพายทึบ)
    
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  // ป้องกันการ render กราฟถ้าไม่มีข้อมูล
  if (active === 0 && lost === 0) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        backgroundColor: '#3a4b63'
      }} />
    );
  }

  // 👈 3. (แก้ไข)
  return <Pie data={data} options={options} />; 
};

export default StatsPieChart;