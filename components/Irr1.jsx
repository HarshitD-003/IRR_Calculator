import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CalculateIcon from '@mui/icons-material/Calculate';
import axios from 'axios';


function Irr1() {
  const [entries, setEntries] = useState([{ date: new Date(), pay: parseInt(0) }]);
  const [final, setFinal] = useState({ date: new Date(), value: parseInt(0) });
  const [xirrResult, setXirrResult] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const addEntry = () => {
    const newEntry = { date: new Date(), pay: 0 };
    setEntries([...entries, newEntry]);
    console.log("Added entry", newEntry);
  };

  const removeEntry = (index) => {
    const updatedEntries = [...entries];
    updatedEntries.splice(index, 1);
    setEntries(updatedEntries);
    console.log("Removed entry at index", index);
  };

  const handleDateChange = (index, date) => {
    const updatedEntries = [...entries];
    updatedEntries[index].date = date;
    setEntries(updatedEntries);
    console.log(entries);
  };

  const handlePayChange = (index, pay) => {
    const updatedEntries = [...entries];
    updatedEntries[index].pay = parseInt(pay, 10);
    setEntries(updatedEntries);
    console.log(entries);
  };

  const handleFinalDateChange = (datex) => {
    setFinal({ ...final, date:datex });
    console.log(final);
  };

  const handleFinalValueChange = (event) => {
    const valuex = parseInt(event.target.value, 10);
    setFinal({ ...final, value:valuex });
    console.log(final);
  };

  const calcRes = async () => {
    try {
        const payArrayValues = entries.map(entry => entry.pay);
        const dateArray = entries.map(entry => entry.date);

        const cashflows = payArrayValues.map(value => -value).concat(final.value);
        const dates = dateArray.concat(final.date);

        console.log(cashflows);
        console.log(dates);

        const response = await axios.post('http://127.0.0.1:3000/calculate_xirr', {
            cashflows,
            dates,
        },{
          headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'https://xirr-calculator.vercel.app',
                }
         });

        const data = response.data;

        if (data.xirr === null) {
            throw new Error("Incorrect Data Entered");
        }

        setXirrResult(data.xirr);
        setError(null); // Clear previous errors
        setOpen(true); // Open the modal

        console.log('XIRR:', data.xirr);
    } catch (error) {
        setError(error.response?.data?.error || error.message);
        setXirrResult(null); // Clear previous result
        setOpen(true); // Open the modal
        console.error('Error calculating XIRR:', error);
    }
};


  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {entries.map((entry, index) => (
        <div key={index} style={{display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "11%", marginTop: "2rem"}}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={entry.date}
              onChange={(date) => handleDateChange(index, date)}
              slotProps={{ textField: { fullWidth: false } }}
            />
          </LocalizationProvider>
          <TextField
            label="Pay"
            type="number"
            value={entry.pay.toString(10)}
            onChange={(e) => handlePayChange(index, e.target.value)}
            style={{ marginLeft: '16px' }}
          />
          <Button style={{marginLeft: "1.5rem", marginTop: "0.15rem", width:"10%"}} variant="contained" color='error' startIcon={<RemoveIcon />} onClick={() => removeEntry(index)}>Remove</Button>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2rem" }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker label="Date of Sale" value={final.date} onChange={handleFinalDateChange} slotProps={{ textField: { fullWidth: false } }} />
        </LocalizationProvider>
        <TextField label="Sale Proceeds" type="number" value={final.value.toString(10)} onChange={handleFinalValueChange} style={{ marginLeft: '16px' }} />
      </div>

      <div style={{display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1.5rem", gap: "2rem"}}>
        <Button variant="contained" color='secondary' startIcon={<AddIcon />} onClick={addEntry}>Add Entry</Button>
        <Button variant="contained" color='success' startIcon={<CalculateIcon />} onClick={calcRes}>Calculate</Button>
      </div>

      <Dialog 
        open={open} 
        onClose={handleClose}
        sx={{
          '& .MuiDialog-paper': {
            backgroundImage: 'linear-gradient(to top, #a8edea 0%, #fed6e3 100%)',
            padding: '10%',
            borderRadius: '10%',
            textAlign: 'center',
          },
          '&.MuiButton-outlined':{
            border: '2px solid #333', // Custom border color
          }
        }}
      >
        <DialogTitle>XIRR Calculation Result</DialogTitle>
        <DialogContent>
          {error ? (
            <Typography sx={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</Typography>
          ) : (
            <Typography sx={{ fontWeight: 'bold' }}>XIRR: {xirrResult}%</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Irr1;
