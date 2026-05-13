/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DashboardView } from './features/dashboard/DashboardView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { logger } from './lib/logger';

// Lightweight Route Logger
const RouteObserver = () => {
  const location = useLocation();
  
  useEffect(() => {
    logger.router(`Navigation to: ${location.pathname}`);
  }, [location]);

  return null;
};

// Placeholder for other pages to avoid blank screens
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-4xl font-display font-medium mb-4">{title}</h1>
    <p className="text-muted-foreground">Этот раздел находится в разработке.</p>
  </div>
);

export default function App() {
  useEffect(() => {
    logger.log('system', 'App root component mounted');
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RouteObserver />
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/goals" element={<PlaceholderView title="Мои цели" />} />
          <Route path="/analytics" element={<PlaceholderView title="Аналитика" />} />
          <Route path="/workouts" element={<PlaceholderView title="Тренировки" />} />
          <Route path="/ai-chat" element={<PlaceholderView title="ИИ Помощник" />} />
          <Route path="*" element={<DashboardView />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
