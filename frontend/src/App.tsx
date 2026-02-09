import { useState, useEffect } from 'react';
import { Container, Typography, AppBar, Toolbar, Box, Paper, CircularProgress } from '@mui/material';

function App() {
  const [status, setStatus] = useState<string>('Verbinde...');

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('Backend nicht erreichbar'));
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Bw-I Chatbot</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>System-Status</Typography>
          <Typography variant="body1" color={status.includes('läuft') ? 'success.main' : 'error.main'}>
            {status === 'Verbinde...' ? <CircularProgress size={20} /> : status}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;