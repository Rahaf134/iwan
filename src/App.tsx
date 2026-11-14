import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { RatingModal } from '@/components/common/RatingModal';
import { SiteLayout } from '@/components/layouts/SiteLayout';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { CatalogProvider } from '@/contexts/CatalogContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { StoreProvider } from '@/contexts/StoreContext';

import { routes } from './routes';

const App: React.FC = () => {
  const [ratingOpen, setRatingOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CatalogProvider>
          <StoreProvider>
            <ChatProvider>
              <IntersectObserver />
              <Routes>
                <Route element={<SiteLayout />}>
                  {routes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
              <RatingModal
                open={ratingOpen}
                onOpenChange={setRatingOpen}
              />
            </ChatProvider>
          </StoreProvider>
        </CatalogProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
