import React from 'react';
import {Box, Typography} from '@mui/material';

const FinalBoard = ({state}) => {
  if (!state) return null;

  const sum1 = state.p1.points.filter((_, i) => state.p1.revealed[i]).reduce((a, b) => a + b, 0);
  const sum2 = state.p2.points.filter((_, i) => state.p2.revealed[i]).reduce((a, b) => a + b, 0);
  const total = sum1 + sum2;

  const cellStyle = {
    borderBottom: '2px solid #333',
    padding: '10px 20px',
    height: '70px',
    verticalAlign: 'middle',
    textTransform: 'uppercase',
    fontFamily: '"Courier New", Courier, monospace',
    fontWeight: 'bold',
    fontSize: '2.2rem',
    color: 'white'
  };

  const pointsStyle = {
    ...cellStyle,
    width: '80px',
    textAlign: 'center',
    color: 'yellow',
    backgroundColor: 'black',
  };

  const renderValue = (player, idx) => {
    const isRevealed = state[player].revealed[idx];
    const text = state[player].answers[idx];

    return (isRevealed && text && text.trim() !== "") ? text : "----------------";
  };


  return (
      <Box sx={{
        bgcolor: '#000831', height: '100vh', p: 4,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
      }}>
        <Typography variant="h2" sx={{margin: 4, fontWeight: 'bold'}}>FINAŁ</Typography>

        <table style={{
          width: '100%',
          maxWidth: '1400px',
          border: '6px solid white',
          backgroundColor: 'black',
          borderRadius: '20px',
          boxShadow: '0px 0px 30px rgba(0, 116, 217, 0.5)',
          padding: '20px',
          borderCollapse: 'separate',
          borderSpacing: 0,
          overflow: 'hidden'
        }}>
          <tbody>
          {[0, 1, 2, 3, 4].map((idx) => (
              <tr key={idx}>
                {/* GRACZ 1 */}
                <td style={{...cellStyle, textAlign: 'left'}}>
                  {renderValue('p1', idx)}
                </td>
                <td style={pointsStyle}>
                  {state.p1.pointsRevealed?.[idx] ? state.p1.points[idx] : ""}
                </td>
                {/* ŚRODEK */}
                <td style={{...cellStyle, width: '40px', border: 'none'}}/>

                {/* GRACZ 2 */}
                <td style={{...cellStyle, textAlign: 'left'}}>
                  {renderValue('p2', idx)}
                </td>
                <td style={pointsStyle}>
                  {state.p2.pointsRevealed?.[idx] ? state.p2.points[idx] : ""}
                </td>
              </tr>
          ))}

          <tr>
            <td colSpan={5} style={{padding: '20px', border: 'none'}}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 'fit-content',
                margin: '0 auto',
                p: 2,
              }}>
                <Typography variant="h4" sx={{color: 'white', fontWeight: 'bold', mr: 2, fontFamily: 'monospace'}}>
                  SUMA:
                </Typography>
                <Typography variant="h4" sx={{color: 'yellow', fontWeight: '900', fontSize: '3rem', fontFamily: 'monospace'}}>
                  {total}
                </Typography>
              </Box>
            </td>
          </tr>
          </tbody>
        </table>
      </Box>
  );
};

export default FinalBoard;