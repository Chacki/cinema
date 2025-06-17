const express = require('express');
const auth = require('../middlewares/auth');
const Reservation = require('../models/reservation');
const userModeling = require('../utils/userModeling');
const generateQR = require('../utils/generateQRCode');
const User = require('../models/user');
const Movie = require('../models/movie');
const Cinema = require('../models/cinema');
const { sendEMail } = require('../utils/mail');

const router = new express.Router();

// Create a reservation
// router.post('/reservations', auth.simple, async (req, res) => {
//   const reservation = new Reservation(req.body);
//
//   const QRCode = await generateQR(`https://elcinema.herokuapp.com/#/checkin/${reservation._id}`);
//
//   try {
//     await reservation.save();
//     res.status(201).send({ reservation, QRCode });
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

router.post('/reservations', auth.simple, async (req, res) => {
  const reservation = new Reservation(req.body);

  // генерируем QR-код-DataURI
  const QRCode = await generateQR(`https://elcinema.herokuapp.com/#/checkin/${reservation._id}`);

  try {
    // Сохраняем бронирование
    await reservation.save();

    // Подгружаем movie и cinema
    const movie = await Movie.findById(reservation.movieId);
    const cinema = await Cinema.findById(reservation.cinemaId);

    if (!movie || !cinema) {
      throw new Error('Movie or Cinema not found');
    }

    // Ищем пользователя и админов
    const user = await User.findOne({ username: reservation.username });
    if (!user) throw new Error('User not found');
    const admins = await User.find({ role: 'superadmin' });
    const adminEmails = admins.map(a => a.email).filter(Boolean);

    const base64Data = QRCode.split(';base64,').pop();
    // Формируем шаблон письма
    const mailBase = {
      from: process.env.MAIL_USER,
      html: `
        <h2>Ваша бронь подтверждена</h2>
        <p>Здравствуйте, ${user.name || user.username}!</p>
        <p>Вы успешно оформили билет:</p>
        <ul>
          <li>Фильм: ${movie.title}</li>
          <li>Кинотеатр: ${cinema.name}</li>
          <li>Дата: ${new Date(reservation.date).toLocaleDateString('ru-RU')}</li>
          <li>Время: ${reservation.startAt}</li>
          <li>Места: ${
            Array.isArray(reservation.seats)
              ? reservation.seats.map(s => `${s[0]}-${s[1]}`).join(', ')
              : reservation.seat || '–'
          }</li>
        </ul>
        <p>QR‑код для регистрации:</p>
        <img src="cid:qrCodeImage" alt="QR Code" />
        <p>Ждём вас на сеанс!</p>
      `,
      attachments: [
        {
          filename: 'qr-code.png',
          content: Buffer.from(base64Data, 'base64'),
          cid: 'qrCodeImage',
        },
      ],
    };

    // Отправляем пользователю
    await sendEMail({
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...mailBase,
      to: user.email,
      subject: `Бронь #${reservation._id} подтверждена`,
    });

    // Отправляем администраторам
    if (adminEmails.length) {
      await sendEMail({
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        ...mailBase,
        to: adminEmails.join(','),
        subject: `Новая бронь #${reservation._id}`,
      });
    }

    res.status(201).send({ reservation, QRCode });
  } catch (e) {
    console.error('Error creating reservation:', e);
    res.status(400).send({ error: e.message });
  }
});

// Get all reservations
router.get('/reservations', auth.simple, async (req, res) => {
  try {
    const reservations = await Reservation.find({});
    res.send(reservations);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get reservation by id
router.get('/reservations/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const reservation = await Reservation.findById(_id);
    return !reservation ? res.sendStatus(404) : res.send(reservation);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Get reservation checkin by id
router.get('/reservations/checkin/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const reservation = await Reservation.findById(_id);
    reservation.checkin = true;
    await reservation.save();
    return !reservation ? res.sendStatus(404) : res.send(reservation);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Update reservation by id
router.patch('/reservations/:id', auth.enhance, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'date',
    'startAt',
    'seats',
    'ticketPrice',
    'total',
    'username',
    'phone',
    'checkin',
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    const reservation = await Reservation.findById(_id);
    updates.forEach(update => (reservation[update] = req.body[update]));
    await reservation.save();
    return !reservation ? res.sendStatus(404) : res.send(reservation);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Delete reservation by id
router.delete('/reservations/:id', auth.enhance, async (req, res) => {
  const _id = req.params.id;
  try {
    const reservation = await Reservation.findByIdAndDelete(_id);
    return !reservation ? res.sendStatus(404) : res.send(reservation);
  } catch (e) {
    return res.sendStatus(400);
  }
});

// User modeling get suggested seats
router.get('/reservations/usermodeling/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const suggestedSeats = await userModeling.reservationSeatsUserModeling(username);
    res.send(suggestedSeats);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
