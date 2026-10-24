import React from 'react';
import Navbar from './components/Navbar';
import TaskManager from './components/TaskManager';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="app-main">
        <TaskManager />
      </main>
    </div>
  );
}

export default App;
