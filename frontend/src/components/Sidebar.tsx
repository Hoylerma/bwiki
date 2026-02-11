import { Box, List, ListItem, ListItemButton, ListItemText, Button, IconButton, Divider, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import type { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  startNewConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  status: string;
  open: boolean;
  onClose: () => void;
}

function Sidebar({ conversations, currentConversationId, startNewConversation, selectConversation, deleteConversation, status }: SidebarProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, backgroundColor: '#000000', color: '#f6f6f6' }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={startNewConversation}
        sx={{ mb: 2, backgroundColor: '#ffe000', color: '#000000', '&:hover': { backgroundColor: '#ffe000' } }}
        fullWidth
      >
        Neuer Chat
      </Button>

      <Divider sx={{ mb: 2, backgroundColor: '#4a4a4a' }} />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.7 }}>Konversationen</Typography>
        <List>
          {conversations.map((conv) => (
            <ListItem
              key={conv.id}
              disablePadding
              secondaryAction={
                <IconButton edge="end" onClick={() => deleteConversation(conv.id)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton
                selected={currentConversationId === conv.id}
                onClick={() => selectConversation(conv.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': { backgroundColor: 'rgba(74,144,226,0.3)' }
                }}
              >
                <ChatIcon fontSize="small" sx={{ mr: 1 }} />
                <ListItemText primary={conv.title} primaryTypographyProps={{ fontSize: '0.9rem', noWrap: true }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />

      <Typography variant="caption" sx={{ textAlign: 'center', color: '#a8a8a8' }}>
        Status: {status}
      </Typography>
    </Box>
  );
}

export default Sidebar;
