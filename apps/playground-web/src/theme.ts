import { alpha, createTheme } from '@mui/material/styles';

export const playgroundTheme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily:
      '"Sora Variable", "Sora", "Avenir Next", "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    monospaceBody: {
      fontFamily:
        '"JetBrains Mono Variable", "JetBrains Mono", "SFMono-Regular", monospace',
      fontSize: '0.95rem',
      lineHeight: 1.7,
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#7cf5d5',
    },
    secondary: {
      main: '#8ab4ff',
    },
    background: {
      default: '#07111a',
      paper: '#0e1824',
    },
    success: {
      main: '#7cf5d5',
    },
    warning: {
      main: '#fbbf24',
    },
    error: {
      main: '#ff7d7d',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          background:
            'radial-gradient(circle at top left, rgba(124, 245, 213, 0.12), transparent 24%), radial-gradient(circle at top right, rgba(138, 180, 255, 0.18), transparent 28%), linear-gradient(180deg, #07111a 0%, #09131e 100%)',
          color: theme.palette.text.primary,
        },
        '#root': {
          minHeight: '100vh',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(theme.palette.primary.main, 0.38)} transparent`,
        },
        '*::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme.palette.primary.main, 0.22),
          borderRadius: 999,
          border: `2px solid transparent`,
          backgroundClip: 'padding-box',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.38),
        },
        '::selection': {
          backgroundColor: alpha(theme.palette.primary.main, 0.35),
        },
      }),
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backdropFilter: 'blur(18px)',
          background:
            `linear-gradient(180deg, ${alpha('#132133', 0.92)} 0%, ${alpha('#0a1320', 0.96)} 100%)`,
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          boxShadow: `0 18px 70px ${alpha('#000000', 0.35)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 30%, transparent 70%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          backdropFilter: 'blur(12px)',
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'background-color 140ms ease, border-color 140ms ease, transform 140ms ease',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.2),
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            transform: 'translateX(2px)',
          },
          '&.Mui-selected': {
            borderColor: alpha(theme.palette.primary.main, 0.28),
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          },
          '&.Mui-selected:hover': {
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.black, 0.14),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: ({ theme }) => ({
          boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.18)}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: '#07111a',
        }),
      },
    },
  },
});
