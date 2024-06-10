import React, { useState } from 'react';
import { Grid, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CalculateIcon from '@mui/icons-material/Calculate';
import axios from 'axios';

const Irr3 = () => {
  const [ebwTokenAmount, setEbwTokenAmount] = useState('');
  const [bookingAmount, setBookingAmount] = useState('');
  const [startDate1, setStartDate1] = useState(new Date());
  const [startDate2, setStartDate2] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState('');
  const [intrestRate, setIntrestRate] = useState('');
  const [emi, setEmi] = useState('');
  const [rent, setRent] = useState('');
  const [radioValue, setRadioValue] = useState('');
  const [ModalText, setModalText] = useState('');
  const [extraCharges, setExtraCharges] = useState({ date: new Date(), pay: 0 });

  const [xirrResult, setXirrResult] = useState('')
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const [entries, setEntries] = useState([{ date: new Date(), pay: 0 }]);
  const [finalx, setFinalX] = useState({ date: new Date(), pay: 0 });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const totalPay = entries.reduce((sum, entry) => sum + entry.pay, 0);
    let newEntries = [...entries];
    try {
      if (radioValue === 'yes') {
        if (totalPay !== 100) {
          throw new Error('Error: The sum of all entries must equal 100');
        }
        if (parseFloat(ebwTokenAmount) + parseFloat(bookingAmount) > (entries[0].pay * parseFloat(totalAmount)) / parseFloat(100)) {
          throw new Error('Error: EBW Token amount + Booking Amount must be less than or equal to first Installment');
        }
      } else if (radioValue === 'partial') {
        if (totalPay > 100 || totalPay < 1) {
          throw new Error('Error: The sum of all entries must be greater than 0 and less than or equal to 100');
        }
        if (parseFloat(ebwTokenAmount) + parseFloat(bookingAmount) > (entries[0].pay * parseFloat(totalAmount)) / parseFloat(100)) {
          throw new Error('Error: EBW Token amount + Booking Amount must be less than or equal to first Installment');
        }
        const lastDate = entries.reduce((max, entry) => (new Date(entry.date) > new Date(max.date) ? entry : max)).date;

        const totalPayPercentage = totalPay;
        const remainingAmount = 100 - (totalPayPercentage + 5);

        const quarters = [];
        let currentDate = new Date(lastDate);

        // Calculate quarters from the last date in entries until the possession date
        while (currentDate < finalx.date) {
          const nextQuarter = new Date(currentDate.setMonth(currentDate.getMonth() + 3));
          if (nextQuarter < finalx.date) {
            quarters.push(nextQuarter);
          }
          currentDate = nextQuarter;
        }
        if (quarters.length > 1) {
          const equalQuarterlyPay = remainingAmount / (quarters.length - 1);
          quarters.forEach((quarterDate, index) => {
            if (index < quarters.length - 1) {
              newEntries.push({ date: quarterDate, pay: equalQuarterlyPay });
            } else {
              // Add the remaining 5% for the last quarter
              const fivePercentOfTotal = 0.05 * totalAmount;
              newEntries.push({ date: quarterDate, pay: parseFloat(5) });
            }
          });

        }
        else if (quarters.length == 1) {
          newEntries.push({ date: new Date(quarters[0].getDate()), pay: remainingAmount });
        }
        else {
          newEntries.push({ date: new Date(finalx.date), pay: remainingAmount });
        }
      }
      else {
        let ebwBookingTotal = (parseFloat(ebwTokenAmount) + parseFloat(bookingAmount)) * parseFloat(100) / parseFloat(totalAmount);
        let currentDate = startDate2;
        // Check if EBW Token amount + Booking Amount is less than 10% of total Amount
        if (ebwBookingTotal < parseFloat(10)) {
          const remainingAmount = parseFloat(10) - ebwBookingTotal;
          const currentDate = new Date(startDate2);
          newEntries.push({ date: currentDate, pay: remainingAmount });
          ebwBookingTotal = 10;
        }

        const remainingAmountAfterBooking = 100 - ebwBookingTotal;
        const possessionDate = finalx.date;
        const quarters = [];

        // Calculate quarters between start date and possession date
        while (currentDate < possessionDate) {
          const nextQuarter = new Date(currentDate.setMonth(currentDate.getMonth() + 3));
          if (nextQuarter < possessionDate) {
            quarters.push(nextQuarter);
          }
          currentDate = nextQuarter;
        }

        if (remainingAmountAfterBooking <= parseFloat(90)) {
          if (quarters.length > 1) {
            const equalQuarterlyPay = parseFloat(85) / (quarters.length - 1);
            quarters.forEach((quarterDate, index) => {
              if (index < quarters.length - 1) {
                newEntries.push({ date: quarterDate, pay: equalQuarterlyPay });
              } else {
                // Add the remaining 5% for the last quarter
                newEntries.push({ date: quarterDate, pay: parseFloat(5) });
              }

            });
          }
          else if (quarters.length == 1) {
            newEntries.push({ date: new Date(quarters[0].getDate()), pay: remainingAmount });
          }
          else {
            newEntries.push({ date: new Date(finalx.date), pay: remainingAmount });
          }
        } else {
          const remainingPayPercentage = remainingAmountAfterBooking / totalAmount - 0.05;
          const equalQuarterlyPay = (remainingPayPercentage * totalCost) / (quarters.length - 1);
          if (quarters.length > 1) {
            quarters.forEach(quarterDate => {
              if (index < quarters.length - 1) {
                newEntries.push({ date: quarterDate, pay: equalQuarterlyPay });
              } else {
                // Add the remaining 5% for the last quarter
                const fivePercentOfTotal = 0.05 * totalAmount;
                newEntries.push({ date: quarterDate, pay: parseFloat(5) });
              }
            });
          }
          else if (quarters.length == 1) {
            newEntries.push({ date: new Date(quarters[0].getDate()), pay: remainingAmount });
          }
          else {
            newEntries.push({ date: new Date(finalx.date), pay: remainingAmount });
          }
        }
      }
    }
    catch (error) {
      setModalText(error);
    }

    const formData = {
      ebwTokenAmount,
      bookingAmount,
      startDate1,
      startDate2,
      totalAmount,
      intrestRate,
      emi,
      rent,
      newEntries,
      finalx,
      extraCharges,
    };
    try {
      console.log(formData);
      const response = await axios.post('http://localhost:3000/uc_calculate_irr', formData, {

        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate XIRR');
      }
      const data = response.data;
      if (data.irr === null) {
        throw new Error("Incorrect Data Entered");
      }
      setXirrResult(data.irr);
      setError(null); // Clear previous errors
      setOpen(true); // Open the modal
      console.log('XIRR:', data.irr);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
      setXirrResult(null); // Clear previous result
      setOpen(true); // Open the modal
      console.error('Error calculating XIRR:', error);
    }
  };

  const addEntry = () => {
    setEntries([...entries, { date: new Date(), pay: 0 }]);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleDateChange = (index, date) => {
    const updatedEntries = entries.map((entry, i) => (i === index ? { ...entry, date } : entry));
    setEntries(updatedEntries);
  };

  const handlePayChange = (index, pay) => {
    const updatedEntries = entries.map((entry, i) => (i === index ? { ...entry, pay: parseFloat(pay) } : entry));
    setEntries(updatedEntries);
  };

  const handleFinalDateChange = (date) => {
    setFinalX({ ...finalx, date });
  };

  const handleFinalValueChange = (event) => {
    setFinalX({ ...finalx, pay: parseFloat(event.target.value) });
  };

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
  };

  return (
    <Box p={4}
      sx={{
        bgcolor: '#f5f5f5',
        borderRadius: '16px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, textAlign: 'center', color: '#333' }}
      >
        IRR Calculator
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="EBW Token amount"
            type="number"
            variant="outlined"
            fullWidth
            required
            value={ebwTokenAmount}
            onChange={(e) => setEbwTokenAmount(parseInt(e.target.value))}
            sx={{ bgcolor: 'white', borderRadius: '8px' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date of E-Booking"
              views={['year', 'month']}
              value={startDate1}
              onChange={(date) => setStartDate1(date)}
              slotProps={{
                textField: {
                  variant: "outlined", fullWidth: true, required: true,
                  sx: { bgcolor: 'white', borderRadius: '8px' }
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Booking Amount"
            type="number"
            variant="outlined"
            fullWidth
            required
            value={bookingAmount}
            onChange={(e) => setBookingAmount(parseInt(e.target.value))}
            sx={{ bgcolor: 'white', borderRadius: '8px' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              label="Date of Booking"
              value={startDate2}
              onChange={(date) => setStartDate2(date)}
              slotProps={{
                textField: {
                  variant: "outlined", fullWidth: true, required: true,
                  sx: { bgcolor: 'white', borderRadius: '8px' }
                }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Extra Charges"
            type="number"
            variant="outlined"
            fullWidth
            required
            value={extraCharges.pay.toString(10)}
            onChange={(e) => setExtraCharges({ ...extraCharges, pay: parseInt(e.target.value, 10) })}
            sx={{ bgcolor: 'white', borderRadius: '8px' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              label="Date of Payment"
              value={extraCharges.date}
              onChange={(e) => setExtraCharges({ ...extraCharges, date: e })}
              slotProps={{ textField: { variant: "outlined", fullWidth: true, required: true, sx: { bgcolor: 'white', borderRadius: '8px' } } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Total Cost"
            type="number"
            variant="outlined"
            fullWidth
            required
            value={totalAmount}
            onChange={(e) => setTotalAmount(parseInt(e.target.value))}
            sx={{ bgcolor: 'white', borderRadius: '8px' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Interest Rate"
            type="number"
            variant="outlined"
            fullWidth
            required
            value={intrestRate}
            onChange={(e) => setIntrestRate(parseFloat(e.target.value))}
            sx={{ bgcolor: 'white', borderRadius: '8px' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="EMI"
            type="number"
            variant="outlined"
            fullWidth
            required
            value={emi}
            onChange={(e) => setEmi(parseInt(e.target.value))}
            sx={{ bgcolor: 'white', borderRadius: '8px' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Rent"
            type="number"
            variant="outlined"
            fullWidth
            required
            value={rent}
            onChange={(e) => setRent(parseInt(e.target.value))}
            sx={{ bgcolor: 'white', borderRadius: '8px' }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Do you know the details of your complete payment plan?</FormLabel>
            <RadioGroup row value={radioValue} onChange={handleRadioChange}>
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="partial" control={<Radio />} label="I know Partial Details" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {(radioValue === 'yes' || radioValue === 'partial') && (
          <Grid item xs={12}>
            {entries.map((entry, index) => (
              <div key={index} style={{ marginTop: "2rem", alignItems: "center", justifyContent: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Date"
                    views={['year', 'month']}
                    value={entry.date}
                    onChange={(date) => handleDateChange(index, date)}
                    slotProps={{ textField: { fullWidth: false, sx: { bgcolor: 'white', borderRadius: '8px' } } }}
                  />
                </LocalizationProvider>
                <TextField
                  label="Pay"
                  type="number"
                  value={entry.pay.toString(10)}
                  onChange={(e) => handlePayChange(index, e.target.value)}
                  style={{ marginLeft: '1rem' }}
                  sx={{ bgcolor: 'white', borderRadius: '8px' }}
                />
                <Button style={{ marginLeft: "1.5rem", marginTop: "0.15rem", width: "20%" }} variant="contained" color='error' startIcon={<RemoveIcon />} onClick={() => removeEntry(index)}>Remove</Button>
              </div>
            ))}
            <div style={{ alignItems: "center", justifyContent: "center", marginTop: "2rem" }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker label="Date of Exit" views={['year', 'month']} value={finalx.date} onChange={handleFinalDateChange} slotProps={{ textField: { fullWidth: false, sx: { bgcolor: 'white', borderRadius: '8px' } } }} />
              </LocalizationProvider>
              <TextField label="Sale Proceeds" type="number" value={finalx.pay.toString(10)} onChange={handleFinalValueChange} style={{ marginLeft: '1rem' }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1.5rem", gap: "2rem" }}>
              <Button variant="contained" color='secondary' startIcon={<AddIcon />} onClick={addEntry}>Add Entry</Button>
              <Button variant="contained" color='success' startIcon={<CalculateIcon />} onClick={handleSubmit}>Calculate</Button>
            </div>
          </Grid>
        )}

        {radioValue === 'no' && (
          <Grid item xs={12}>
            <div style={{ alignItems: "center", justifyContent: "center", marginTop: "2rem" }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker label="Date of Exit" views={['year', 'month']} value={finalx.date} onChange={handleFinalDateChange} slotProps={{ textField: { fullWidth: false, sx: { bgcolor: 'white', borderRadius: '8px' } } }} />
              </LocalizationProvider>
              <TextField label="Sale Proceeds" type="number" value={finalx.pay.toString(10)} onChange={handleFinalValueChange} style={{ marginLeft: '1rem' }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1.5rem", gap: "2rem" }}>
              <Button variant="contained" color='success' startIcon={<CalculateIcon />} onClick={handleSubmit}>Calculate</Button>
            </div>
          </Grid>
        )}
      </Grid>
      <Dialog
        open={open}
        onClose={() => { setOpen(false) }}
        sx={{
          '& .MuiDialog-paper': {
            backgroundImage: 'linear-gradient(to top, #a8edea 0%, #fed6e3 100%)',
            padding: '10%',
            borderRadius: '10%',
            textAlign: 'center',
          },
          '&.MuiButton-outlined': {
            border: '2px solid #333', // Custom border color
          }
        }}
      >
        <DialogTitle>XIRR Calculation Result</DialogTitle>
        <DialogContent>
          {error ? (
            <Typography sx={{ color: 'red', fontWeight: 'bold' }}>Error: {ModalText}</Typography>
          ) : (
            <Typography sx={{ fontWeight: 'bold' }}>XIRR: {xirrResult}%</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false) }} variant="outlined" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Irr3;
