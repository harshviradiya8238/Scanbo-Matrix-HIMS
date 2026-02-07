'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  Stack,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function HomePage() {
  const theme = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignIn = () => {
    // Handle sign in logic here
    console.log('Sign in:', { email, password });
    // Redirect to dashboard after successful login
    window.location.href = '/dashboard';
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSignIn();
    }
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{
          backgroundColor: theme.palette.primary.light,
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }} color="primary.main">
            Scanbo HIMS
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 2,
            }}
          >
            <Stack spacing={3}>
              <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 600 }}>
                Sign In
              </Typography>

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                required
                autoComplete="email"
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                fullWidth
                required
                autoComplete="current-password"
              />

              <Button
                variant="contained"
                onClick={handleSignIn}
                size="large"
                fullWidth
                sx={{
                  mt: 2,
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
