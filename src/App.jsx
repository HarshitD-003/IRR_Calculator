import React, { useState } from 'react';
import './App.css'
import { Tabs, Tab, Box, Typography, CssBaseline } from '@mui/material';
import Irr1 from '../components/Irr1';
import Irr2 from '../components/Irr2';
import Irr3 from '../components/Irr3';
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [value, setValue] = useState(2);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
    <CssBaseline />
      <Box sx={{ width: '100%' }}>
        <Tabs value={value} onChange={handleChange} aria-label="IRR Calculation Tabs">
          <Tab label="IRR Calculation 1" />
          <Tab label="IRR Calculation 2" />
          <Tab label="IRR Calculation 3" />
          {/* Add more tabs as needed */}
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Irr1 />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Irr2 />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Irr3 />
      </TabPanel>
      {/* Add more TabPanel components as needed */}
    </div>
  );
}

export default App;