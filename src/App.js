import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Box, Button, Typography, Paper, Grid, Container } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const socket = io('http://localhost:3001');

function App() {
  const [role, setRole] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [myTeam, setMyTeam] = useState(null);

  useEffect(() => {
    socket.on('update', (state) => {
      setGameState(state);
      if (state.lastAction === 'reveal') new Audio('/sounds/correct.mp3').play().catch(() => { });
      if (state.lastAction === 'strikeA' || state.lastAction === 'strikeB') new Audio('/sounds/wrong.mp3').play().catch(() => { });
      if (state.lastAction === 'buzz') new Audio('/sounds/buzzer.mp3').play().catch(() => { });
    });
  }, []);

  if (!role) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h3" gutterBottom>FAMILIADA - WYBIERZ ROLĘ</Typography>
        <Button variant="contained" onClick={() => setRole('board')} sx={{ m: 2 }}>Projektor</Button>
        <Button variant="contained" onClick={() => setRole('host')} sx={{ m: 2 }} color="secondary">Host</Button>
        <Button variant="contained" onClick={() => setRole('buzzer')} sx={{ m: 2 }} color="error">Buzzer (Telefon)</Button>
      </Container>
    );
  }

  if (!gameState) return <Typography>Łączenie z serwerem...</Typography>;

  const currentBoardSum = gameState.answers
    .filter(ans => ans.revealed)
    .reduce((sum, ans) => sum + ans.points, 0);

  // --- WIDOK PROJEKTORA ---
  if (role === 'board') {
    return (
      <Box sx={{
        bgcolor: '#000831',
        height: '100vh',
        color: 'white',
        p: 2, // Mniejszy padding zewnętrzny
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden' // Zapobiega paskom przewijania
      }}>
        {/* Pytanie - nieco mniejsze, by nie zajmowało pół ekranu */}
        <Typography variant="h3" align="center" sx={{
          mb: 4,
          fontWeight: 'bold',
          fontSize: '3.5rem', // Zmniejszone z 4.5
          textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
          px: 4
        }}>
          {gameState.activeQuestion.toUpperCase()}
        </Typography>

        <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ px: 2 }}>
          {/* Lewa strona: Punkty i Iksy - zmniejszony xs do 1.5 i usunięty mr */}
          <Grid item xs={1.5} mr={10} textAlign="center">
            <Paper sx={{ p: 1, mb: 1, border: '3px solid white', bgcolor: 'transparent', color: 'white' }}>
              <Typography variant="h3" sx={{ fontSize: '3.5rem', fontWeight: 'bold' }}>
                {gameState.teamAPoints}
              </Typography>
            </Paper>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {[...Array(3)].map((_, i) => (
                <CloseIcon key={i} sx={{ fontSize: 90, color: i < gameState.teamAStrikes ? 'red' : '#001a4d' }} />
              ))}
            </Box>
          </Grid>

          {/* TABLICA - Ustawiona na xs={9} dla szerokości, bez sztywnego width: 80% */}
          <Grid item xs={9}>
            <Paper elevation={24} sx={{
              p: 2,
              bgcolor: 'black',
              border: '6px solid #fff',
              borderRadius: 3,
              boxShadow: '0px 0px 30px rgba(0, 116, 217, 0.5)',
              minWidth: '1000px'
            }}>
              {gameState.answers.map((ans, i) => (
                <Box key={i} sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2, // Zmniejszony padding wewnętrzny
                  mb: 1,
                  borderBottom: '2px solid #333',
                  color: 'white',
                  bgcolor: 'transparent',
                  transition: 'all 0.4s ease'
                }}>
                  <Typography variant="h3" sx={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontWeight: 'bold',
                    fontSize: '2.rem' // Zmniejszone z 3.5
                  }}>
                    {i + 1}. {ans.revealed ? ans.text.toUpperCase() : '----------------'}
                  </Typography>
                  <Typography variant="h3" sx={{
                    color: 'yellow',
                    fontWeight: 'bold',
                    fontSize: '2.5rem',
                    fontFamily: 'monospace',
                  }}>
                    {ans.revealed ? ans.points : ''}
                  </Typography>
                </Box>
              ))}

              {/* Suma punktów wewnątrz czarnej tablicy na dole */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 1 }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mr: 2, fontFamily: 'monospace', alignContent: 'center' }}>SUMA:</Typography>
                <Typography variant="h4" sx={{ color: 'yellow', fontWeight: '900', fontSize: '3.0rem', fontFamily: 'monospace', alignContent: 'center' }}>
                  {currentBoardSum}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Prawa strona: Punkty i Iksy */}
          <Grid item xs={1.5} ml={10} textAlign="center">
            <Paper sx={{ p: 1, mb: 1, border: '3px solid white', bgcolor: 'transparent', color: 'white' }}>
              <Typography variant="h3" sx={{ fontSize: '3.5rem', fontWeight: 'bold' }}>
                {gameState.teamBPoints}
              </Typography>
            </Paper>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {[...Array(3)].map((_, i) => (
                <CloseIcon key={i} sx={{ fontSize: 90, color: i < gameState.teamBStrikes ? 'red' : '#001a4d' }} />
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Kto odpowiada - mniejszy box na dole */}
        <Box sx={{ height: '80px', mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {gameState.winner && (
            <Typography variant="h4" sx={{
              color: 'yellow',
              fontWeight: 'bold',
              px: 4, py: 1,
              borderRadius: 4,
              border: '3px solid yellow',
              bgcolor: 'rgba(255,0,0,0.5)',
              animation: 'blink 0.5s infinite'
            }}>
              ODPOWIADA: {gameState.winner}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // --- WIDOK HOSTA---
  if (role === 'host') {
    return (
      // TYLKO DO CENTROWANIA
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#101020',
          p: 2,
        }}
      >
        {/* WŁAŚCIWY PANEL HOSTA */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '1100px',
            bgcolor: '#000831',
            color: 'white',
            borderRadius: 3,
            p: 2,
            boxShadow: '0 0 30px rgba(0,0,0,0.6)',
          }}
        >
          {/* RESET BUZZERA */}
          <Button
            variant="outlined"
            fullWidth
            onClick={() => socket.emit('admin-action', { type: 'reset-buzzer' })}
            sx={{
              py: 1,
              fontWeight: 'bold',
              color: 'white',
              borderColor: 'white',
              mb: 1
            }}
          >
            RESET BUZZERA (Aktualnie: {gameState.winner || 'Nikt'})
          </Button>

          {/* GŁÓWNY OBSZAR: LEWA + ŚRODEK + PRAWA */}
          <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, overflow: 'hidden' }}>
            {/* LEWA: BŁĄD MONIKI */}
            <Paper sx={{
              flex: '0 0 15%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid red',
              p: 1,
            }}>
              <Typography variant="h3" sx={{ fontWeight: '900', color: 'red' }}>
                {gameState.teamAStrikes}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={() => socket.emit('admin-action', { type: 'strikeA' })}
                sx={{ mt: 1, py: 1, fontSize: '0.8rem' }}
              >
                BŁĄD<br />MONIKI
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => socket.emit('admin-action', { type: 'resetStrikeA' })}
                sx={{ mt: 1, fontSize: '0.6rem', color: 'orange', borderColor: 'orange' }}
              >
                RESET BŁĘDU
              </Button>
            </Paper>

            {/* ŚRODEK: PYTANIE + ODPOWIEDZI */}
            <Paper sx={{
              flex: '1 1 70%',
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              border: '3px solid white',
              borderRadius: 2,
              overflowY: 'auto',
            }}>
              <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
                {gameState.activeQuestion.toUpperCase()}
              </Typography>

              {gameState.answers.map((ans, i) => (
                <Button
                  key={i}
                  variant={ans.revealed ? "outlined" : "contained"}
                  fullWidth
                  color={ans.revealed ? "inherit" : "primary"}
                  sx={{
                    mb: 1,
                    py: 1,
                    justifyContent: 'space-between',
                    opacity: ans.revealed ? 0.5 : 1,
                    fontWeight: 'bold'
                  }}
                  onClick={() => socket.emit('admin-action', { type: 'reveal', index: i })}
                >
                  <Typography sx={{ textAlign: 'left' }}>{i + 1}. {ans.text.toUpperCase()}</Typography>
                  <Typography sx={{ fontWeight: '900' }}>{ans.points}</Typography>
                </Button>
              ))}
            </Paper>

            {/* PRAWA: BŁĄD SZYMONA */}
            <Paper sx={{
              flex: '0 0 15%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid red',
              p: 1,
            }}>
              <Typography variant="h3" sx={{ fontWeight: '900', color: 'red' }}>
                {gameState.teamBStrikes}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={() => socket.emit('admin-action', { type: 'strikeB' })}
                sx={{ mt: 1, py: 1, fontSize: '0.8rem' }}
              >
                BŁĄD<br />SZYMONA
              </Button>
              {/* NOWY PRZYCISK RESETU DLA SZYMONA */}
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => socket.emit('admin-action', { type: 'resetStrikeB' })}
                sx={{ mt: 1, fontSize: '0.6rem', color: 'orange', borderColor: 'orange' }}
              >
                RESET BŁĘDU
              </Button>
            </Paper>
          </Box>

          {/* DOLNA SEKCJA: PRZYZNAWANIE PUNKTÓW */}
          <Paper sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            mt: 2,
            border: '3px solid green',
            borderRadius: 2,
          }}>
            <Button
              variant="contained"
              color="success"
              disabled={gameState.lastAction === 'points-assigned'}
              onClick={() => socket.emit('admin-action', { type: 'addPointsA' })}
              sx={{ flex: 1, mx: 1, py: 2, fontWeight: 'bold' }}
            >
              DLA MONIKI
            </Button>

            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography sx={{ color: '#ccc', fontSize: '0.8rem', mb: 0.5 }}>SUMA</Typography>
              <Typography sx={{ fontWeight: '900', fontSize: '1.5rem', color: 'black' }}>
                {currentBoardSum}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="success"
              disabled={gameState.lastAction === 'points-assigned'}
              onClick={() => socket.emit('admin-action', { type: 'addPointsB' })}
              sx={{ flex: 1, mx: 1, py: 2, fontWeight: 'bold' }}
            >
              DLA SZYMONA
            </Button>
          </Paper>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => socket.emit('admin-action', { type: 'next-question' })}
            sx={{
              mt: 2,
              py: 1,
              fontWeight: 'bold',
              color: 'white',
              borderColor: 'white',
            }}
          >
            ➡ NASTĘPNE PYTANIE
          </Button>

        </Box>
      </Box>
    );
  }

  // --- WIDOK BUZZERA ---
  if (role === 'buzzer') {

    // Jeśli gracz jeszcze nie wybrał drużyny
    if (!myTeam) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>DO KTÓREJ DRÓŻYNY NALEŻYSZ?</Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 2, py: 3, fontSize: '1.5rem' }}
            onClick={() => setMyTeam('DRUŻYNA MONIKI')}
          >
            DRUŻYNA MONIKI
          </Button>
          <Button
            variant="contained"
            fullWidth
            color="secondary"
            sx={{ py: 3, fontSize: '1.5rem' }}
            onClick={() => setMyTeam('DRUŻYNA SZYMONA')}
          >
            DRUŻYNA SZYMONA
          </Button>
        </Box>
      );
    }

    // Jeśli drużyna jest już wybrana, wyświetlamy wielki przycisk
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: myTeam === 'DRUŻYNA MONIKI' ? '#1a237e' : '#4a148c'
      }}>
        <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>{myTeam}</Typography>
        <Button
          variant="contained"
          color="error"
          disabled={!!gameState.winner}
          sx={{
            width: '80vw',
            height: '80vw',
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: '50%',
            fontSize: '3rem',
            boxShadow: '0 10px 0 #800',
            '&:active': { boxShadow: '0 2px 0 #800', transform: 'translateY(8px)' }
          }}
          onClick={() => socket.emit('buzz', myTeam)}
        >
          {gameState.winner ? 'STOP' : 'KLIKNIJ MNIE'}
        </Button>
      </Box>
    );
  }
}

export default App;