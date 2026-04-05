import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import AgentSimPage from './pages/AgentSimPage';
import PMPage from './pages/PMPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220, padding: '32px 40px', maxWidth: 'calc(100vw - 220px)' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/agent-sim" element={<AgentSimPage />} />
            <Route path="/pm-artifacts" element={<PMPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
