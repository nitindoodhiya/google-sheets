const express = require('express');
const { google } = require('googleapis');

const router = express.Router();
const credentialsGCP = './configuration/credentials.json';
const mobileNumberRegex = /^[0-9]{10}$/;

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Rupi Card' });
});

router.post('/register', async (req, res, next) => {
  const { name, mobile } = req.body;
  
  if (!mobile || !name || !mobile.match(mobileNumberRegex)) {
    return res.status(400).json({
      message: 'Please provide valid mobile number and name',
    });
  }
  
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsGCP,
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const sheets = google.sheets({ version: 'v4' });

    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${process.env.GOOGLE_SHEET_NAME}!A1:B`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [[name, mobile]] },
    });
    
    return res.status(200).json({
      message: 'Thanks for registering',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Something went wrong',
      error: err,
    });
  }
});

module.exports = router;
