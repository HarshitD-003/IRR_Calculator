import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  CssBaseline, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from 'axios';

function Irr2() {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [rent, setRent] = useState("");
  const [repoRate, setRepoRate] = useState("");
  const [netInterestMargin, setNetInterestMargin] = useState("");
  const [loanTenureMonths, setLoanTenureMonths] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [saleProceeds, setSaleProceeds] = useState("");
  const [startDate, setStartDate] = useState(null);

  const [irrResult, setIrrResult] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      initial_investment: initialInvestment,
      loan_amount: loanAmount,
      emi_amount: emiAmount,
      rent: rent,
      repo_rate: repoRate,
      net_interest_margin: netInterestMargin,
      loan_tenure_months: loanTenureMonths,
      area_sqft: areaSqft,
      sale_proceeds: saleProceeds,
      start_date: startDate,
    };

      try {
        const response = await axios.post('http://localhost:3000/calculate_irr', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const data = response.data;
    
        if (data.irr === null) {
          throw new Error("Incorrect Data Entered");
        }
    
        setIrrResult(data.irr);
        setError(null); // Clear previous errors
        setOpen(true); // Open the modal
    
        console.log('IRR:', data.irr);
      } catch (error) {
        setError(error.response?.data?.error || error.message);
        setIrrResult(null); // Clear previous result
        setOpen(true); // Open the modal
        console.error('Error calculating IRR:', error);
      }
    };
    

  return (
    <>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CssBaseline />
      <Container maxWidth="md">
          <Typography variant="h4" gutterBottom component="div">
            IRR Calculation
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Initial Investment"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Loan Amount"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="EMI Amount"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Rent"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Repo Rate"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={repoRate}
                  onChange={(e) => setRepoRate(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Net Interest Margin"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={netInterestMargin}
                  onChange={(e) => setNetInterestMargin(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Loan Tenure (Months)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={loanTenureMonths}
                  onChange={(e) => setLoanTenureMonths(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Area (sqft)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Sale Proceeds"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={saleProceeds.toString(10)}
                  onChange={(e) => setSaleProceeds(parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{ textField: { variant: "outlined", fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Calculate IRR
                </Button>
              </Grid>
            </Grid>
          </form>
      </Container>
    </LocalizationProvider>
    <Dialog 
        open={open} 
        onClose={() => {setOpen(false)}}
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
        <DialogTitle>IRR Calculation Result</DialogTitle>
        <DialogContent>
          {error ? (
            <Typography sx={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</Typography>
          ) : (
            <Typography sx={{ fontWeight: 'bold' }}>IRR: {irrResult}%</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setOpen(false)}} variant="outlined" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Irr2;
