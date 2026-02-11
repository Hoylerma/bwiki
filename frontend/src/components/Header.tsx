import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
  onToggleSidebar: () => void;
}

function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#000000' }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onToggleSidebar} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: '#ffe000' }}>
          Bw-I Chatbot - Intelligente Hilfe
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
