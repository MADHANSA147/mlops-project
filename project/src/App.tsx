import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import FakeNewsDetection from '@/pages/FakeNewsDetection';
import TrendAnalysis from '@/pages/TrendAnalysis';
import TrendDetails from '@/pages/TrendDetails';
import ModelHealth from '@/pages/ModelHealth';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/detection" element={<FakeNewsDetection />} />
          <Route path="/trends" element={<TrendAnalysis />} />
          <Route path="/trends/:id" element={<TrendDetails />} />
          <Route path="/model-health" element={<ModelHealth />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
