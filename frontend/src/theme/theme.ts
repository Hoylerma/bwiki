import { createTheme } from '@mui/material/styles';

export const colors = {
  black: '#000000',
  yellow: '#ffe000',
  gray900: '#4a4a4a',
  gray700: '#7c7c7c',
  gray500: '#a8a8a8',
  gray300: '#dadada',
  gray200: '#ededed',
  gray100: '#f6f6f6'
};

export const theme = createTheme({
  palette: {
    primary: { main: colors.yellow },
    secondary: { main: colors.gray900 },
    background: {
      default: colors.gray100,
      paper: colors.gray200
    },
    text: {
      primary: colors.black,
      secondary: colors.gray700
    }
  }
});