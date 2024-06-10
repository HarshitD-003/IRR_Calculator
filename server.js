import express from 'express';
import bodyParser from 'body-parser';
import moment from 'moment';
import cors from 'cors';


const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],// Adjust the allowed methods as needed
    allowedHeaders: ['Content-Type'], // Adjust the allowed headers as needed
}));

// XIRR calculation function
function XIRR(values, dates, guess) {
    // Calculates the resulting amount
    var irrResult = function (values, dates, rate) {
        var r = rate + 1;
        var result = values[0];
        for (var i = 1; i < values.length; i++) {
            result += values[i] / Math.pow(r, moment(dates[i]).diff(moment(dates[0]), 'days') / 365);
        }
        return result;
    }

    // Calculates the first derivation
    var irrResultDeriv = function (values, dates, rate) {
        var r = rate + 1;
        var result = 0;
        for (var i = 1; i < values.length; i++) {
            var frac = moment(dates[i]).diff(moment(dates[0]), 'days') / 365;
            result -= frac * values[i] / Math.pow(r, frac + 1);
        }
        return result;
    }

    // Check that values contains at least one positive value and one negative value
    var positive = false;
    var negative = false;
    for (var i = 0; i < values.length; i++) {
        if (values[i] > 0) positive = true;
        if (values[i] < 0) negative = true;
    }

    // Return error if values does not contain at least one positive value and one negative value
    if (!positive || !negative) return '#NUM!';

    // Initialize guess and resultRate
    var guess = (typeof guess === 'undefined') ? 0.1 : guess;
    var resultRate = guess;

    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;

    // Set maximum number of iterations
    var iterMax = 50;

    // Implement Newton's method
    var newRate, epsRate, resultValue;
    var iteration = 0;
    var contLoop = true;
    do {
        resultValue = irrResult(values, dates, resultRate);
        newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
        epsRate = Math.abs(newRate - resultRate);
        resultRate = newRate;
        contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
    } while (contLoop && (++iteration < iterMax));

    if (contLoop) return '#NUM!';

    // Return internal rate of return
    return resultRate;
}

// IRR calculation function
function CalcIRR(values, guess) {
    var irrResult = function(values, dates, rate) {
      var r = rate + 1;
      var result = values[0];
      for (var i = 1; i < values.length; i++) {
        result += values[i] / Math.pow(r, (dates[i] - dates[0]) / 365);
      }
      return result;
    }

    // Calculates the first derivation
    var irrResultDeriv = function(values, dates, rate) {
      var r = rate + 1;
      var result = 0;
      for (var i = 1; i < values.length; i++) {
        var frac = (dates[i] - dates[0]) / 365;
        result -= frac * values[i] / Math.pow(r, frac + 1);
      }
      return result;
    }
  
    // Initialize dates and check that values contains at least one positive value and one negative value
    var dates = [];
    var positive = false;
    var negative = false;
    for (var i = 0; i < values.length; i++) {
      dates[i] = (i === 0) ? 0 : dates[i - 1] + 365;
      if (values[i] > 0) positive = true;
      if (values[i] < 0) negative = true;
    }
    
    // Return error if values does not contain at least one positive value and one negative value
    if (!positive || !negative) return '#NUM!';
  
    // Initialize guess and resultRate
    var guess = (typeof guess === 'undefined') ? 0.1 : guess;
    var resultRate = guess;
    
    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;
    
    // Set maximum number of iterations
    var iterMax = 50;
  
    // Implement Newton's method
    var newRate, epsRate, resultValue;
    var iteration = 0;
    var contLoop = true;
    do {
      resultValue = irrResult(values, dates, resultRate);
      newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
      epsRate = Math.abs(newRate - resultRate);
      resultRate = newRate;
      contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
    } while(contLoop && (++iteration < iterMax));
  
    if(contLoop) return '#NUM!';
  
    // Return internal rate of return
    return resultRate;
}

//YES Function
const YES = (ebwTokenAmount,bookingAmount,startDate1,startDate2,totalAmount,intrestRate,emi,entries,finalx,rent,cashflows,dates,extraCharges) =>
    {
        intrestRate/=1200;
        //console.log(intrestRate);
        let loanBalance=(totalAmount*entries[0].pay)/100 - (ebwTokenAmount + bookingAmount);
        //console.log(loanBalance);
        let currentDate = new Date(entries[0].date);
        cashflows.push(-ebwTokenAmount, -bookingAmount);
        dates.push(new Date(startDate1), new Date(startDate2));
        entries.shift();
        const payment = -emi + rent;
        const finalDate = new Date(finalx.date);
        const extraDate = new Date(extraCharges.date);
        while (!(currentDate.getMonth() === finalDate.getMonth() && currentDate.getFullYear() === finalDate.getFullYear())) {
            const matchingEntry = entries.find(entry => {
                let entryDate = new Date(entry.date);
                return entryDate.getMonth() === currentDate.getMonth() && entryDate.getFullYear() === currentDate.getFullYear();
            });
            if (matchingEntry) {
                //console.log(loanBalance);
                loanBalance += ((matchingEntry.pay)*totalAmount)/100;
            }
            if(extraDate.getMonth() === currentDate.getMonth() && currentDate.getFullYear() === extraDate.getFullYear())
            {
                loanBalance+=extraCharges.pay;
            }
            const interestPayment = loanBalance * intrestRate;
            loanBalance += interestPayment - emi;
            cashflows.push(payment);
            dates.push(new Date(currentDate));
            currentDate.setMonth(currentDate.getMonth() + 1);
            //console.log(interestPayment);
            //console.log(loanBalance);
        }
      const finalPayment = finalx.pay - loanBalance-emi;
      cashflows.push(finalPayment);
      dates.push(new Date(finalx.date));
    }
    


app.use(bodyParser.json());

//Route 1
app.post('/calculate_xirr', (req, res) => {
    try {
        const { cashflows, dates } = req.body;

        // Convert dates to Date objects using Moment.js
        const dateObjects = dates.map(dateString => moment(dateString).toDate());

        // Calculate XIRR
        var xirr = XIRR(cashflows, dateObjects, 0.1);

        res.json({
            xirr: parseFloat((xirr * 100).toFixed(2)),
            cashflows: cashflows,
        });
    } catch (error) {
        res.status(400).json({ error: error.toString() });
    }
});

//Route 2
app.post('/calculate_irr', (req, res) => {
    try {
        const {
            initial_investment,
            loan_amount,
            emi_amount,
            rent,
            repo_rate,
            net_interest_margin,
            loan_tenure_months,
            area_sqft,
            sale_proceeds,
            start_date,
        } = req.body;
        //console.log(req.body)
        const totalInterestRate = (repo_rate + net_interest_margin) / 100;
        const monthlyInterestRate = totalInterestRate / 12;
        const totalInvestment = initial_investment + loan_amount;
        const startDate = new Date(start_date);
        const startMonth = startDate.getMonth() + 1;
        var cashflows = [];

        // Calculate cash flows for first year
        let loanBalance = loan_amount;
        let monthsProcessed = 0;
        const firstYearMonths = Math.min(12 - startMonth + 1, loan_tenure_months);
        for (let month = startMonth; month < startMonth + firstYearMonths; month++) {
            const interestPayment = loanBalance * monthlyInterestRate;
            const principalPayment = emi_amount - interestPayment;
            loanBalance -= principalPayment;
            monthsProcessed++;
        }
        cashflows.push(-initial_investment - firstYearMonths * emi_amount + rent * firstYearMonths);

        // Calculate cash flows for remaining years
        const remainingMonths = loan_tenure_months - monthsProcessed;
        const fullYears = Math.floor(remainingMonths / 12);
        for (let year = 0; year < fullYears; year++) {
            const monthlyCashflows = [];

            for (let month = 1; month <= 12; month++) {
                const interestPayment = loanBalance * monthlyInterestRate;
                const principalPayment = emi_amount - interestPayment;
                loanBalance -= principalPayment;
                monthlyCashflows.push(-emi_amount);
            }

            const totalCashflow = monthlyCashflows.reduce((acc, val) => acc + val, 0);
            cashflows.push(totalCashflow + rent * 12);
        }   


        // Calculate cash flow for last year
        const lastPartialYearMonths = remainingMonths % 12;
        for (let month = 0; month <= lastPartialYearMonths; month++) {
            const interestPayment = loanBalance * monthlyInterestRate;
            const principalPayment = emi_amount - interestPayment;
            loanBalance -= principalPayment; // Update remaining loan balance for the month
        }
        const emiTillEnd = -emi_amount * lastPartialYearMonths;
        cashflows.push(sale_proceeds + emiTillEnd - loanBalance + rent * lastPartialYearMonths); // Calculate cash flow for last year
        //console.log(emiTillStartMonth);
        //console.log(loanBalance);
        cashflows = cashflows.filter(val => !isNaN(val) && isFinite(val));
        console.log(cashflows);
        //const irr = finance.IRR(cashflows);
        var irr = CalcIRR(cashflows, 0.1);
        if(irr=='#NUM')throw new Error("At least one positive and one negative cashflow required");
        const costPerSqft = totalInvestment / area_sqft;

        res.json({
            irr: parseFloat((irr * 100).toFixed(2)),
            cost_per_sqft: parseFloat(costPerSqft.toFixed(2)),
            cashflows_yearly: cashflows,
        });
    } catch (error) {
        res.status(400).json({ error: error.toString() });
    }
});

//Route 3
app.post('/uc_calculate_irr', (req, res) => {
    try {
      const {
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
      } = req.body;
      let cashflows=[],dates=[];
      console.log(newEntries);
      YES(ebwTokenAmount,bookingAmount,startDate1,startDate2,totalAmount,intrestRate,emi,newEntries,finalx,rent,cashflows,dates,extraCharges);
      
      console.log(cashflows);
      console.log(dates);
  
      // Calculate IRR
      const irr = XIRR(cashflows,dates,0.1);
  
      res.json({
        irr: parseFloat((irr * 100).toFixed(2)),
        cashflows_yearly: cashflows,
      });
    } catch (error) {
      res.status(400).json({ error: error.toString() });
    }
  });
  


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});