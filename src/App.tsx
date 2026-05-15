/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DashboardView } from './features/dashboard/DashboardView';
import { GoalsView } from './features/goals/GoalsView';
import { WorkoutsView } from './features/entries/WorkoutsView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { AIInsightsView } from './features/ai/AIInsightsView';
import { ProfileView } from './features/profile/ProfileView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
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
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/goals" element={<GoalsView />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/workouts" element={<WorkoutsView />} />
            <Route path="/ai-chat" element={<AIInsightsView />} />
            <Route path="*" element={<DashboardView />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
