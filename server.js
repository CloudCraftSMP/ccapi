const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://64e2b0aa1ac1486b86f8ee37da421a95@sentry.io/1537237' });

const Discord = require("discord.js");
const client = new Discord.Client();

const express = require('express');
const app = express();

const config = require('./config.json');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.redirect('http://cloudcraftmc.org.uk');
});

app.use(function(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'You need a token, get one at [URL]' });
  }
  next();
});

app.get('/discord/members', function(req, res) {
  console.log(`Serving ${req.originalUrl} to ${req.ip}`);

  var o = {};
  var key = "members";
  o[key] = [];

  client.guilds.get(config.channels.guild).members.forEach(m => {
    var data = {
      "id": m.id, 
      "bot": m.user.bot,
      "since": m.joinedTimestamp,
      //"horniness": 0,
      "name": m.displayName,
      "color": m.displayHexColor,
      "avatar": m.user.displayAvatarURL,
      "status": m.user.presence.status
    }

    o[key].push(data)

  });

  res.send(JSON.stringify(o));

});

app.post('/', (req, res) => {
  return res.send('hehe that tickles~!');
});

app.put('/', (req, res) => {
  //return res.send('hehe that tickles~!');
  return res.send('HNGHHHHHHHHHHHH~~');
});

app.delete('/', (req, res) => {
  //return res.send('hehe that tickles~!');
  return res.redirect('https://www.reddit.com/r/copypasta/comments/5t42j3/');
});
/*app.view('/', (req,res) => {
  return res.send('HNGHHHHHHHHHHHH~~');
})*/

client.on('ready', () => {
  client.user.setStatus('dnd');
  client.user.setActivity('API requests.', { type: 'LISTENING' });
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

client.login(config.tokens.api);§