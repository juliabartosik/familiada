import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Grid, TextField } from '@mui/material';
import { FINAL_QUESTIONS_LIST } from '../questions/questions';

const HostView = ({ socket, gameState, finalState }) => {
    const [localInput, setLocalInput] = useState("");
    const currentBoardSum = gameState.answers
        .filter(ans => ans.revealed)
        .reduce((sum, ans) => sum + ans.points, 0);

    // LOGIKA FINAŁU WIDOKU HOSTA
    if (finalState?.active) {
        const curPlayer = finalState.currentPlayer;
        const playerObj = curPlayer === 1 ? finalState.p1 : finalState.p2;
        const qIndex = playerObj.answers.length;

        const renderPlayerControls = (playerNum) => {
            const pData = playerNum === 1 ? finalState.p1 : finalState.p2;
            return (
                <Grid container spacing={1} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ borderBottom: '1px solid white', mb: 1 }}>
                            GRACZ {playerNum}
                        </Typography>
                    </Grid>
                    {[0, 1, 2, 3, 4].map(i => (
                        <Grid item xs={12} key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            {/* Numer pytania */}
                            <Box sx={{ width: '30px', display: 'flex', alignItems: 'center' }}>
                                <Typography>{i + 1}.</Typography>
                            </Box>

                            {/* Przycisk Odkrywania Odpowiedzi */}
                            <Button
                                variant={pData.revealed[i] ? "outlined" : "contained"}
                                fullWidth
                                color="primary"
                                size="small"
                                onClick={() => socket.emit('final-action', {
                                    type: 'reveal-ans', // Nowy typ akcji
                                    player: playerNum,
                                    index: i
                                })}
                            >
                                {pData.revealed[i] ? pData.answers[i] || "---" : `ODKRYJ ODP ${i + 1}`}
                            </Button>

                            {/* Przycisk Odkrywania Punktów */}
                            <Button
                                variant={pData.pointsRevealed?.[i] ? "outlined" : "contained"}
                                sx={{ minWidth: '100px' }}
                                color="warning"
                                size="small"
                                onClick={() => socket.emit('final-action', {
                                    type: 'reveal-pts', // Nowy typ akcji
                                    player: playerNum,
                                    index: i
                                })}
                            >
                                {pData.pointsRevealed?.[i] ? pData.points[i] : "PKT"}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            );
        };

        return (
            <Box sx={{ p: 3, bgcolor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">FINAŁ - PANEL STEROWANIA</Typography>
                    <Button variant="contained" color="error" onClick={() => socket.emit('final-action', { type: 'switch-player' })}>
                        PRZEŁĄCZ NA GRACZA {curPlayer === 1 ? '2' : '1'}
                    </Button>
                </Box>

                {/* Pole wpisywania odpowiedzi */}
                {qIndex < 5 ? (
                    <Paper
                        key={qIndex} // Dodanie tego klucza wymusi na React przeładowanie sekcji przy zmianie numeru pytania
                        sx={{ p: 3, mb: 4, bgcolor: '#333', border: '2px solid yellow' }}
                    >
                        <Typography variant="h5">PYTANIE {qIndex + 1} DLA GRACZA {curPlayer}:</Typography>
                        <Typography variant="h4">{FINAL_QUESTIONS_LIST[qIndex]?.q}</Typography>
                        <TextField
                            autoFocus
                            fullWidth
                            variant="filled"
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="Wpisz odpowiedź i naciśnij Enter"
                            sx={{ bgcolor: 'white', mt: 2, borderRadius: 1 }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && localInput.trim() !== "") {
                                    socket.emit('final-action', {
                                        type: 'submit-ans',
                                        player: curPlayer,
                                        val: localInput
                                    });
                                    setLocalInput("");
                                }
                            }}
                        />
                    </Paper>
                ) : (
                    <Paper sx={{ p: 3, mb: 4, bgcolor: '#1b331b', color: 'white', textAlign: 'center' }}>
                        <Typography variant="h5" color="lightgreen">KONIEC PYTAŃ DLA GRACZA {curPlayer}</Typography>
                        <Typography>Teraz możesz odkrywać odpowiedzi na tablicy.</Typography>
                    </Paper>
                )}

                {/* Sekcja przycisków do odkrywania */}
                <Grid container spacing={4}>
                    <Grid item xs={6}>
                        {renderPlayerControls(1)}
                    </Grid>
                    <Grid item xs={6}>
                        {renderPlayerControls(2)}
                    </Grid>
                </Grid>
            </Box>
        );
    }
    // STANDARDOWY WIDOK HOSTA
    return (
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
                    maxWidth: '90vh',
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

                <Button variant="contained" color="warning" fullWidth sx={{ mt: 5 }} onClick={() => socket.emit('final-action', { type: 'start-final' })}>
                    URUCHOM TRYB FINAŁOWY
                </Button>
            </Box>
        </Box>
    );
};

export default HostView;