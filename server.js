const webpush = require('web-push');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);

webpush.setVapidDetails(
  'mailto:you@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let subscriptions = [];

app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({});
});

app.post('/send', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Froglert',
    body: 'Tap to check whether frogs are okay 🐸'
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  );

  res.json(results);
});

app.listen(3000, () => console.log('Push server running on port 3000'));