import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout'; // Layout ที่เราเพิ่งสร้าง
import MainDashboard from '../src/components/pages/MainDashboard';
import OffensivePage from '../src/components/pages/OffensivePage';
import DefensivePage from '../src/components/pages/DefensivePage';
import { SocketManager } from './components/common/SocketManager';

function App() {
  return (
    <BrowserRouter>
      <SocketManager />
      <Layout> {/* Layout จะคลุมทุกหน้า */}
        <Routes>
          {/* กำหนดว่า path ไหนจะไปหน้าไหน */}
          <Route path="/" element={<MainDashboard />} />
          <Route path="/offensive" element={<OffensivePage />} />
          <Route path="/defensive" element={<DefensivePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;