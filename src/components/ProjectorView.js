import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ProjectorView = ({ gameState }) => {
    const currentBoardSum = gameState.answers
        .filter(ans => ans.revealed)
        .reduce((sum, ans) => sum + ans.points, 0);

    return (
        <Box sx={{ bgcolor: '#000831', height: '100vh', color: 'white', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
            <Typography variant="h3" align="center" sx={{ mb: 4, fontWeight: 'bold', fontSize: '3.5rem', textShadow: '2px 2px 8px rgba(0,0,0,0.5)', px: 4 }}>
                {gameState.activeQuestion.toUpperCase()}
            </Typography>

            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ px: 2 }}>
                {/* Drużyna A */}
                <Grid item xs={1.5} mr={10} textAlign="center">
                    <Paper sx={{ p: 1, mb: 1, border: '3px solid white', bgcolor: 'transparent', color: 'white' }}>
                        <Typography variant="h3" sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '3.5rem' }}>{gameState.teamAPoints}</Typography>
                    </Paper>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {[...Array(3)].map((_, i) => (
                            <CloseIcon key={i} sx={{ fontSize: 90, color: i < gameState.teamAStrikes ? 'red' : '#001a4d' }} />
                        ))}
                    </Box>
                </Grid>

                {/* Tablica Odpowiedzi */}
                <Grid item xs={9}>
                    <Paper elevation={24} sx={{ p: 2, bgcolor: 'black', border: '6px solid #fff', borderRadius: 3, boxShadow: '0px 0px 30px rgba(0, 116, 217, 0.5)', minWidth: '1000px' }}>
                        {gameState.answers.map((ans, i) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mb: 1, borderBottom: '2px solid #333', color: 'white' }}>
                                <Typography variant="h3" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 'bold', fontSize: '3rem' }}>
                                    {i + 1}. {ans.revealed ? ans.text.toUpperCase() : '----------------'}
                                </Typography>
                                <Typography variant="h3" sx={{ color: 'yellow', fontWeight: 'bold', fontSize: '3rem', fontFamily: 'monospace' }}>
                                    {ans.revealed ? ans.points : ''}
                                </Typography>
                            </Box>
                        ))}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, pt: 1 }}>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mr: 2, fontFamily: 'monospace' }}>SUMA:</Typography>
                            <Typography variant="h4" sx={{ color: 'yellow', fontWeight: '900', fontSize: '3rem', fontFamily: 'monospace' }}>{currentBoardSum}</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Drużyna B */}
                <Grid item xs={1.5} ml={10} textAlign="center">
                    <Paper sx={{ p: 1, mb: 1, border: '3px solid white', bgcolor: 'transparent', color: 'white' }}>
                        <Typography variant="h3" sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '3.5rem' }}>{gameState.teamBPoints}</Typography>
                    </Paper>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {[...Array(3)].map((_, i) => (
                            <CloseIcon key={i} sx={{ fontSize: 90, color: i < gameState.teamBStrikes ? 'red' : '#001a4d' }} />
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProjectorView;