import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { PoliticianProfile } from './components/PoliticianProfile';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/politico/:id" element={<PoliticianProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
