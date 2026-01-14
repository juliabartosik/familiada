import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const BuzzerView = ({ socket, gameState }) => {
    const [myTeam, setMyTeam] = useState(null);

    if (!myTeam) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>TWOJA DRUŻYNA?</Typography>
                <Button variant="contained" fullWidth sx={{ mb: 2, py: 3 }} onClick={() => setMyTeam('DRUŻYNA MONIKI')}>MONIKA</Button>
                <Button variant="contained" fullWidth color="secondary" sx={{ py: 3 }} onClick={() => setMyTeam('DRUŻYNA SZYMONA')}>SZYMON</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: myTeam === 'DRUŻYNA MONIKI' ? '#1a237e' : '#4a148c' }}>
            <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>{myTeam}</Typography>
            <Button
                variant="contained" color="error" disabled={!!gameState.winner}
                sx={{ width: '80vw', height: '80vw', borderRadius: '50%', fontSize: '2.5rem' }}
                onClick={() => socket.emit('buzz', myTeam)}
            >
                {gameState.winner ? 'STOP' : 'BUZZ'}
            </Button>
        </Box>
    );
};

export default BuzzerView;