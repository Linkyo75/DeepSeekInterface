import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ChatInterface from './components/chat/ChatInterface';
import LandingPage from './components/LandingPage';
import DocumentationPage from './components/DocumentationPage';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster position="top-center" />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;