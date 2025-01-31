import React, { Suspense } from 'react';

// Lazy load the ChatInterface
const ChatInterface = React.lazy(() => import('./components/chat/ChatInterface'));

const App = () => {
  console.log('Rendering App component');
  
  return (

        <ChatInterface />

  );
};

export default App;