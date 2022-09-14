import React from 'react';
import './App.css';
import LogTable from './components/LogTable';
import Container from '@mui/material/Container';

function App() {
  return (
    <Container maxWidth="md">
      <LogTable />
    </Container>
  );
}

export default App;
