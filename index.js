const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

const transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: "danmazzeu9@yahoo.com",
    pass: "%448600%55Dd",
  },
});

// Middleware para interpretar os dados da URL (query string)
app.use(express.urlencoded({ extended: true })); // Habilita a interpretação de query string

app.get('/enviar_email', (req, res) => { // Mudança para app.get
  const { destinatario, assunto, mensagem } = req.query; // Dados da URL

  const mailOptions = {
    from: 'danmazzeu9@yahoo.com',
    to: destinatario, // Usa o destinatário da URL
    subject: assunto, // Usa o assunto da URL
    text: mensagem // Usa a mensagem da URL
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).json({
        mensagem: 'Erro ao enviar email',
        erro: error.message, // Include the error message
        errorDetails: error // Include the whole error object (for debugging)
      });
    } else {
      console.log('Email sent:', info.response);
      res.json({ mensagem: 'Email enviado com sucesso', info: info.response });
    }
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});