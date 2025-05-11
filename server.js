const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

webpush.setVapidDetails(
  'mailto:your@email.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscriptions = [];

app.post('/subscribe', (req, res) => {
  const newSub = req.body;

  subscriptions = subscriptions.filter(sub => sub.endpoint !== newSub.endpoint);

  subscriptions.push(newSub);
  console.log('[SUBSCRIBED]', newSub.endpoint);
  res.status(201).json({ message: 'Subscribed' });
});

app.post('/send', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Froglert',
    body: 'Ayo, new frog just dropped! 🐸',
    icon: 'images/icon-192.png'
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('[ERROR]', err.statusCode, err.body);

        if (err.statusCode === 410 || err.statusCode === 404) {
          console.warn('[UNSUBSCRIBED]', sub.endpoint);
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      })
    )
  );

  res.json({ message: 'Notifications attempted', results });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
