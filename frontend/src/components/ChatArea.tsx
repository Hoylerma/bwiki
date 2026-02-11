import { Box, TextField, Button, Paper, Typography, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import type { Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  loading: boolean;
  error: string;
  input: string;
  onInputChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function ChatArea({ messages, loading, error, input, onInputChange, onSend, messagesEndRef }: ChatAreaProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 3,
        width: '100%'
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            minHeight: '400px'
          }}>
            <Typography variant="h5" color="text.secondary">
              Starte eine neue Konversation
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                  width: '100%'
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: msg.sender === 'user' ? '#ffe000' : '#ededed',
                    color: '#000000'
                  }}
                >
                  <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.text}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Paper sx={{ p: 2, backgroundColor: '#ededed' }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}
            {error && (
              <Typography color="error" sx={{ textAlign: 'center', my: 2 }}>
                {error}
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      <Box
        component="form"
        onSubmit={onSend}
        sx={{
          p: 2,
          backgroundColor: '#f6f6f6',
          borderTop: '1px solid #dadada',
          flexShrink: 0
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Schreibe eine Nachricht..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={loading}
            sx={{ backgroundColor: '#ffffff' }}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={loading || !input.trim()}
            sx={{ 
              backgroundColor: '#ffe000',
              color: '#000000',
              minWidth: '120px',
              whiteSpace: 'nowrap',
              '&:hover': { backgroundColor: '#ffe000' }
            }}
          >
            SENDEN
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default ChatArea;
