import { useState } from 'react';
import GameContainer from './components/GameContainer';
import { audioManager } from './utils/audio';
import './assets/styles/main.css';

function App() {
  const [isMuted, setIsMuted] = useState(audioManager.isMutedState());

  const toggleAudio = () => {
    const newMuteState = audioManager.toggleMute();
    setIsMuted(newMuteState);
  };

  return (
    <>
      <GameContainer />

      {/* Audio Toggle Button */}
      <button
        onClick={toggleAudio}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid #00FFFF',
          color: '#00FFFF',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Monaco, Courier New, monospace',
          fontSize: '16px',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
        }}
      >
        {isMuted ? '🔇 UNMUTE' : '🔊 MUTE'}
      </button>
    </>
  );
}

export default App;
