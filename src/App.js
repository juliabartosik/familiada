import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Container, Typography, Button } from '@mui/material';

import ProjectorView from './components/ProjectorView';
import HostView from './components/HostView';
import BuzzerView from './components/BuzzerView';
import FinalBoard from './components/FinalBoard';

const socket = io('http://localhost:3001');

function App() {
  const [role, setRole] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [finalState, setFinalState] = useState(null);

  useEffect(() => {
    socket.on('update', (state) => {
      setGameState(state);
      setFinalState(state.finalState);

      if (state.lastAction === 'reveal') new Audio('/sounds/correct.mp3').play().catch(() => { });
      if (state.lastAction === 'strikeA' || state.lastAction === 'strikeB') new Audio('/sounds/wrong.mp3').play().catch(() => { });
      if (state.lastAction === 'buzz') new Audio('/sounds/buzzer.mp3').play().catch(() => { });
    });
  }, []);

  if (!role) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h3" gutterBottom>FAMILIADA</Typography>
        <Button variant="contained" onClick={() => setRole('board')} sx={{ m: 1 }}>Projektor</Button>
        <Button variant="contained" color="secondary" onClick={() => setRole('host')} sx={{ m: 1 }}>Host</Button>
        <Button variant="contained" color="error" onClick={() => setRole('buzzer')} sx={{ m: 1 }}>Buzzer</Button>
      </Container>
    );
  }

  if (!gameState) return <Typography align="center" sx={{ mt: 5 }}>Łączenie z serwerem...</Typography>;

  if (role === 'board') {
    return finalState?.active
      ? <FinalBoard state={finalState} />
      : <ProjectorView gameState={gameState} />;
  }

  if (role === 'host') {
    return <HostView
      socket={socket}
      gameState={gameState}
      finalState={finalState}
    />;
  }

  if (role === 'buzzer') {
    return <BuzzerView socket={socket} gameState={gameState} />;
  }

  return null;
}

export default App;