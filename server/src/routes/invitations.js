const express = require('express');
const auth = require('../middlewares/auth');
const { sendEMail } = require('../utils/mail');

const router = new express.Router();

const createMailOptions = (data) => {
  const { to, host, movie, date, time, cinema, image, seat } = data;

  const htmlContent = `
               <h1><strong>Приглашение в кино</strong></h1>
                <p>Привет! Вас пригласил(а) ${host}</p>
                <p>Название фильма: ${movie}</p>
                <p>Дата: ${date}</p>
                <p>Время: ${time}</p>
                <p>Название кинотеатра: ${cinema}</p>
                <p>Место в зале: ${seat}</p>
                <img src="${image}" alt="Изображение кинотеатра" />
                <br/>
              `;
  return {
    from: process.env.MAIL_USER,
    to,
    subject: 'Кинотеатр + Приглашение',
    html: htmlContent,
  };
};

// Send Invitation Emails
router.post('/invitations', auth.simple, async (req, res) => {
  const invitations = req.body;
  const promises = invitations.map(invitation => {
    const mailOptions = createMailOptions(invitation);
    return sendEMail(mailOptions)
      .then(() => ({
        success: true,
        msg: `The Invitation to ${mailOptions.to} was sent!`,
      }))
      .catch((exception) => ({ success: false, msg: exception }));
  });

  Promise.all(promises).then(result => res.status(201).json(result));
});
module.exports = router;
