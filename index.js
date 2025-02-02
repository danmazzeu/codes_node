const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const email = 'danmazzeu9@gmail.com';
const password = "fpgq mbja jnkv ejws";
const ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: email,
    pass: password,
  },
});

app.use(express.urlencoded({ extended: true }));

// Usage 
// https://codesnode-production.up.railway.app/sendmail?message=segredo

app.get('/sendmail', (req, res) => {
  const { to, subject, message } = req.query;

  const encryptedMessage = encrypt(message);

  const mailOptions = {
    from: email,
    to: email,
    subject: subject || 'Mensagem Criptografada',
    text: encryptedMessage
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).json({
        message: 'Error sending email',
        erro: error.message,
        errorDetails: error
      });
    } else {
      console.log('Email sent:', info.response);
      res.json({ message: 'Email sent successfully', info: info.response, encryptedMessage });
    }
  });
});

// Usage 
// https://codesnode-production.up.railway.app/decrypt?message=chave:mensagem_criptografada

app.get('/decrypt', (req, res) => {
  const { message } = req.query;
  try {
        if (!message) {
            return res.status(400).send("Message parameter is missing")
        }
        const decryptedMessage = decrypt(message);
        res.send(`Decrypted message: ${decryptedMessage}`);

  } catch (error) {
        console.error("Error decrypting:", error);
        res.status(500).send("Decryption failed.  Incorrect message format or key.");
  }
});


app.listen(3000, () => {
  console.log('Server on port 3000');
});