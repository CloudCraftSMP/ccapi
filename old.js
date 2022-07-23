// This is where we import all required libraries
const Discord = require("discord.js");
var DiscordStrategy = require('passport-discord').Strategy;
const Enmap = require("enmap");
const fs = require("fs");
//const sqlite3 = require('sqlite3');
var sqlite3 = require('sqlite3');
const SQLite = require("better-sqlite3");
const Rcon = require('modern-rcon');
var http = require('http');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var phpExpress = require('php-express')({binPath: 'php'});
const path = require('path');
var Canvas = require('canvas');
const passport = require('passport');
const Strategy = passport.Strategy;
var oof = 3;
const Node = require('nodeactyl');

// This is where we put methods that we need to initalize
const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};

async function memberJoin(client, member) {
  
  const channel = member.guild.channels.find(ch => ch.id === client.channelslist.general);
	if (!channel) return;
  
	const canvas = Canvas.createCanvas(700, 250);
	const ctx = canvas.getContext('2d');

	const background = await Canvas.loadImage('./wallpaper.jpg');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);

	ctx.font = '28px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('Welcome to CloudCraft,', canvas.width / 2.5, canvas.height / 3.5);

	ctx.font = applyText(canvas, `${member.displayName}!`);
	ctx.fillStyle = '#ffffff';
	ctx.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);
  
  ctx.font = '15px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('Type c.cc if you are part of our Minecraft server.', canvas.width / 2.5, canvas.height / 1.1);

	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	const avatar = await Canvas.loadImage(member.user.displayAvatarURL);
	ctx.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png');

	channel.send(`Welcome to the server, ${member}!`, attachment);
  
}

let db = new sqlite3.Database('main.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  }
  //console.log('Connected to the main database.');
});
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use('oof', new Strategy({
    clientID: '',
    clientSecret: '',
    callbackURL: 'https://ccessentials.glitch.me/callback',
    scope: scopes
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));
// Announce remade, by CallMeCrazy
function announce(author, type, info, footer) {
  //
  switch (type) {
    case "general": var emoji = "📢"; break;
    case "maintenance": var emoji = "🔧"; break;
    case "staff": var emoji = "🔨"; break;
    case "donation": var emoji = "💵"; break;
    case "forum": var emoji = "📖"; break;
    
  }
  var annchannel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === "579006266450378754");
  
  annchannel.send(new Discord.RichEmbed()
                  .setTitle(emoji)
                  .setDescription(info)
                  .setFooter(footer)
                  .setColor([2,177,253])
              );
}


// This is where we put variables that we need to initialize
let type = null;
const swearWords = ["tds", "cola", "bored"];
const wait = require('util').promisify(setTimeout);
var scopes = ['identify', 'email', /* 'connections', (it is currently broken) */ 'guilds', 'guilds.join'];

// This is where we put config files
var User = require('./models/user');
var list = require('./request.js').Request;
const config = require("./config.json");
const channelslist = require("./channels.json");
const colours = require("./colours.json");
const invites = new SQLite('./invites.json');
const activities = require("./activities.json");
const scoresdb = new SQLite('./scores.sqlite');
const channelsdb = new SQLite('./channels.sqlite');
//const quotes = require("./quotes.json");
var dbFile = './.data/sqlite.db';
var db2 = new sqlite3.Database(dbFile);
var exists = fs.existsSync(dbFile);


// This is where we make new copies of objects
const client = new Discord.Client();
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE suggestion (suggestion TEXT, discord TEXT)');
    db.run('CREATE TABLE bsuggestion (suggestion TEXT, discord TEXT)'); // CREATE TABLE giveaway (channel TEXT, prize TEXT, end TIME)
    //console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize(function() {
      //db.run('INSERT INTO suggestion (suggestion, discord) VALUES ("Find and count some sheep", "474292715996315650"), ("Climb a really tall mountain", "474292715996315650"), ("Wash the dishes", "474292715996315650")');
    });
  }
  else {
        db.serialize(function() {
      //db.run('INSERT INTO suggestion (suggestion, discord) VALUES ("Find and count some sheep", "474292715996315650"), ("Climb a really tall mountain", "474292715996315650"), ("Wash the dishes", "474292715996315650")');
    });
    //db.run('CREATE TABLE bsuggestion (suggestion TEXT, discord TEXT)');
    console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from suggestion', function(err, row) {
      if ( row ) {
        //console.log('record:', row);
      }
    });
       db.each('SELECT * from bsuggestion', function(err, row) {
      if ( row ) {
        //console.log('record:', row);
      }
    });
  }
});
app.get('/getDreams', function(request, response) {
  db.all('SELECT * from suggestion', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});
app.get('/getbDreams', function(request, response) {
  db.all('SELECT * from bsuggestion', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});
app.get('/gettickets', function(request, response) {
  db.all('SELECT * from support', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.get('/getposts', function(request, response) {
  
    db.all('SELECT * from posts', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
  
});



// disabled to protect dummy data in db


/*app.get('/insertpost', function(request, response) {
  
  db.run("INSERT INTO `posts` (id, author, likes, comments, caption) VALUES ('1', 'thedarkesword', '0', '0', 'ew nobody likes me!')");
  db.run("INSERT INTO `posts` (id, author, likes, comments, caption) VALUES ('2', 'dandabs', '2314234', '412342134123412312', 'im a chicken nugget moooo')"); // duh
  
}); // you forgot the '/api/' // oh well

app.get('/deletepost', function(request, response) {
  
  db.run("DELETE FROM `posts` WHERE id = 1");
  db.run("DELETE FROM `posts` WHERE id = 2");
  
}); */// hello dad OwO // uwU

/*app.get('/createtable', function(req, res) {
  
  db.run("CREATE TABLE `posts` ( `id` INT(255) NOT NULL , `author` VARCHAR(255) NOT NULL , `likes` INT NOT NULL , `comments` INT NOT NULL , `photo` BLOB NULL DEFAULT NULL , `caption` VARCHAR(255) NOT NULL )");
  
});*/

// This is where we make everything globally avaliable (STATIC VARIABLES AND BETTERSQLITE DATABASES ONLY!)
client.config = config;
client.invites = invites;
client.activities = activities;
client.colours = colours;
client.channelslist = channelslist;
client.User = User;
client.wait = wait;
client.channelsdb = channelsdb;
client.scoresdb = scoresdb;
client.type = type;
client.swearWords = swearWords;
client.memberJoin = memberJoin;
//client.quotes = quotes;

// This is where we set the app settings
app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'wwwroot/index.html'));
});
app.get('/about', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'wwwroot/about.html'));
});
app.get('/dashboard', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'wwwroot/dashboard.html'));
});
app.get('/suggestions', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'wwwroot/suggestions.html'));
});
app.get('/vticket', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'wwwroot/vticket.html'));
});
app.get('/bsuggestions', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'wwwroot/bsuggestions.html'));
});
app.get('/ssi/header.html', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'wwwroot/ssi/header.html'));
});
app.get('/ssi/footer.html', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'wwwroot/ssi/footer.html'));
});
app.get('/script/client.js', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'script/client.js'));
});
app.get('/script/btable.js', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'script/btable.js'));
});
app.get('/script/table.js', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'script/table.js'));
});
app.get('/script/includes.js', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'script/includes.js'));
});
app.get('/cdn/useragent', (req, res) => {
  // https://stackoverflow.com/a/22286027/10160296 //
  res.locals.ua = req.get('User-Agent');
  //console.log(res.locals.ua);
  if(res.locals.ua == "Mozilla/6.9") {
    res.send("gay")
  } else {
    //res.send('Hello World')
    res.send(res.locals.ua)
  }
})
//if (config.devmode === "true") {
  // This line of code is no longer required to make the bot work.
  //app.use(express.logger('dev'));
  // DAN PLS FIX ABOVE CODE IT PREVENTS ESSENTIALS FROM BOOTING W/ DEVMODE ON THX
//}

app.get('/cdn/devon', (req, res) => {
  
      client.guilds.get('530700173979025428').channels.forEach(c => {
      
      if (c.name == "standby") {
        
        c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: true });
        c.overwritePermissions(c.guild.defaultRole, { VIEW_CHANNEL: true });
         
      } else if (c.parentID == client.channelslist.cattickets || c.parentID == "532611315668221986" || c.parentID == "551396663449878528" || c.parentID == "533319907698409492" || c.parentID == client.channelslist.catpersonal) {
        
        if (c.name == "announcements" || c.name == "staffteam") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.parentID == "583232681454862348") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.parentID == "533319907698409492") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.name == "banned") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.name == "hello") return;
        
      } else {
        
        c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        
      }
      
    })
  
  res.send("1");
});

app.get('/cdn/devoff', (req, res) => {
  
      client.guilds.get('530700173979025428').channels.forEach(c => {
      
      if (c.name == "standby") {
        
        c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        c.overwritePermissions(c.guild.defaultRole, { VIEW_CHANNEL: false });
         
      } else if (c.parentID == "590628965417222174" || c.parentID == "583232681454862348" || c.parentID == "532611315668221986" || c.parentID == "551396663449878528" || c.parentID == "533319907698409492" || c.parentID == "579054917918916615") {
        
        if (c.name == "announcements" || c.name == "staffteam") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: true });
        if (c.parentID == "583232681454862348") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.parentID == "533319907698409492") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.name == "banned") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.name == "hello") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.name == "hello") c.overwritePermissions(c.guild.defaultRole, { VIEW_CHANNEL: true });
        
        if (c.parentID == "590628965417222174") c.overwritePermissions(c.guild.roles.get('590628858601013280'), { VIEW_CHANNEL: true });
        if (c.parentID == "590628965417222174") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        
      } else {
        

        c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: true });
                if (c.name == "hello") c.overwritePermissions(c.guild.roles.get('594265753004277773'), { VIEW_CHANNEL: false });
        if (c.name == "hello") c.overwritePermissions(c.guild.defaultRole, { VIEW_CHANNEL: true });
        
      }
      
    })
  
  res.send("1");
});

app.get('/cdn/srv/:a', function(req, res) {
  Node.login("https://panel.cloudcraftmc.org.uk", process.env.NODEACTYL_KEY, "application").catch(err => {
    if(err) {
      console.log(err)
      //res.send("500 Internal Error")
      res.status(500);
    }
  })
  //var action = req.params.a;
  switch(req.params.a) {
    case "on":
      // turn server on
      break;
    case "off":
      //turn server off
      break;
    case "info":
      // get server info
      break;
    default:
      // ?????
      res.send("404 Not Found") // tf
  }
})

app.get('/cdn/message/:u/:t/:c/:e/:f', function(req, res){
  
  var author = client.users.get(req.params.u),
      type = req.params.t,
      content = req.params.c,
      extra = req.params.e,
      footer = req.params.f;
  var guild = client.guilds.get(client.channelslist.guild),
      logs = guild.channels.get("533601718366371875"),
      announcements = guild.channels.get("590628402977833008"),
      general = guild.channels.get("590629050708525096"),
      staff = guild.channels.get("533320157947363330"),
      staffrole = guild.roles.get('id', '532628782809350185');
  let embed = "";
  
  switch(type) {
    case "general":
      var emoji = "📣";
      embed = new Discord.RichEmbed()
        .setColor('#f9ef57')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("**[** @everyone **]**", embed);
      //announcements.send(embed);
      break;
      
    case "maintainance":
      var emoji = "🚧";
      embed = new Discord.RichEmbed()
        .setColor('#020202')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("**[** <@&541205782205825027> **]**", embed);
      //announcements.send(embed);
      break;
      
    case "event":
      var emoji = "😇";
      embed = new Discord.RichEmbed()
        .setColor('#f9ef57')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("**[** <@&590628858601013280> **]**", embed);
      break;
      
    case "staff":
      var emoji = "🏢";
      embed = new Discord.RichEmbed()
        .setColor('#f9ef57')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("<@&532628782809350185>", embed);
      break;
      
    case "donation":
      var emoji = "🏦";
      embed = new Discord.RichEmbed()
        .setColor('#f9ef57')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("**[** <@&541205782205825027> **]**", embed);
      break;
      
    case "addteam":
      var emoji = "👋";
      embed = new Discord.RichEmbed()
        .setColor('#bdff77')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("**[** <@&541205782205825027> **]**", embed);
      break;
      
    case "resign":
      var emoji = "😔";
      embed = new Discord.RichEmbed()
        .setColor('#f95757')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("**[** @everyone **]**", embed);
      break;
      
    case "game":
      var emoji = "🎮";
      embed = new Discord.RichEmbed()
        .setColor('#a12283')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("**[** <@&582510458116767765> **]**", embed);
      break;
    
    case "test":
      var emoji = "😂👌";
      embed = new Discord.RichEmbed()
        .setColor('#00000')
        .setTitle(emoji)
        .setDescription(content)
        .setFooter(footer, author.avatarURL)
        .setTimestamp();
      announcements.send("**[** `@`everyone **]**", embed);
      break;
      
    default:
      res.send("Error.");
      break;
  }
  
});

app.get('/api/log/:u/:t', function(req, res){
  
  var author = client.users.get(req.params.u),
      type = req.params.t
  var guild = client.guilds.get(client.channelslist.guild),
      logs = guild.channels.get("533601718366371875"),
      announcements = guild.channels.get("531475126747791390"),
      general = guild.channels.get("531566263990878208"),
      staff = guild.channels.get("533320157947363330"),
      staffrole = guild.roles.get('id', '532628782809350185');
  let embed = "";
  
  switch(type) {
    case "login":
      embed = new Discord.RichEmbed()
        .setColor('#43B581')
        .setTitle("User " + author.tag + " logged in to the web dashboard.")
        //.setFooter(author.avatarURL)
        .setFooter("User ID: " + author.id) // setFotter/setTotter
        .setThumbnail(author.avatarURL)
        //.setTimestamp();
      logs.send(embed);
      //author.send(embed); // oh yeah, we can do that for real
      author.send(new Discord.RichEmbed()
                      //.setTitle("mrbean says hi")
                      .setTitle("You've loggen into the web dashboard as " + author.tag)
                      .setDescription("Not you? Contact Dan or CallMeCrazy to deauthorise your account.") // check doscord
                      .setColor([2,177,253])
               );
      //logs.send(embed);
      break;
      
    default:
      res.send("Error.");
      break;
  }
  
});

app.use('/api/discord', require('./wwwroot/api/discord'));
app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});
app.get('/request', function(req, res){
    // run your request.js script
    // when index.html makes the ajax call to www.yoursite.com/request, this runs
    // you can also require your request.js as a module (above) and call on that:
    res.send(list.getList()); // try res.json() if getList() returns an object or array
});

app.get('/api/suggestionremove/:s', function(req, res){
  
  console.log("reet " + req.params.s);
      db.run(`DELETE FROM suggestion WHERE suggestion = ?;`, [req.params.s], function(err) {
    if (err) {
      return console.log(err.message);
    }
      });
  
    res.send("oof yas");
});

app.get('/api/bsuggestionremove/:s', function(req, res){
  
  console.log("breet " + req.params.s);
      db.run(`DELETE FROM bsuggestion WHERE suggestion = ?;`, [req.params.s], function(err) {
    if (err) {
      return console.log(err.message);
    }
      });
  
    res.send("oof yas 2");
});

app.get("/api/resign/:r/:g/:d", function(req, res) {
  
  const reason = req.params.r;
  const goodbye = req.params.g;
  const member = client.guilds.get(client.channelslist.guild).members.get(req.params.d);
  console.log(req.params.d);
  const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.name === "notifications");
  const staff = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.name === "cloudcraft-general");

  // EMBED HERE TO 'channel'
  // title something like 'Resignation from <user's tag>'
  // body is goodbye
  
  // send the same embed to staff, but add another section on to display the reason that they resigned.
  channel.send(new Discord.RichEmbed() // i wrote a new api for the resign thing a while ago but it isnt integrated in the site yet
                 .setTitle("👋 " + member.tag + " has resigned.")
                 .setDescription(goodbye)
                 // making a very blind guess here, i recommend optimising/tweaking this embed
                 //.setFooter(reason)
              );
  staff.send(new Discord.RichEmbed()
                 .setTitle("👋 " + member.tag + " has resigned.")
                 .setDescription(goodbye)
                 // making a very blind guess here, i recommend optimising/tweaking this embed
                 .setFooter("Reason: ```" + reason + "```.")
              );
  
    //let db = new sqlite3.Database('auth.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  //if (err) {
  //  console.error(err.message);
  //} else {
  //console.log('Connected to the auth database.');
//db.run(`CREATE TABLE IF NOT EXISTS "staffAuth2" ("discord" TEXT,"minecraft" TEXT,"rank"	TEXT);`);
   // db.run(`DELETE FROM staffAuth2 WHERE discord = ?;`, [member.id], function(err) {
   // if (err) {
   //   return console.log(err.message);
   // }
    // get the last insert id
    //console.log(`A row has been deleted with rowid ${this.lastID}`);
  //});
  //}
//});
  
}); 
app.get("/api/mannounce/:d/:c", function(req, res) {
  
  const member = client.fetchUser(req.params.d);
  console.log(req.params.c);
  const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.name === "announcements");
  var dchannel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === "579031211339415581");
                                                      const embed2 = {
                                                        "content": "@everyone",
                                                            "title": "CloudCraft Official Discord",
                                                            "url": "https://cloudcraftmc.org.uk",
                                                            "color": 30207,
                                                            "timestamp": Math.floor(Date.now() / 1000),
                                                            "footer": {
                                                                "icon_url": client.user.displayAvatarURL,
                                                                "text": "CloudCraft Essentials"
                                                            },
                                                            "author": {
                                                                "name": member.username,
                                                                "icon_url": member.displayAvatarURL
                                                            },
                                                            "fields": [
                                                                {
                                                                    "name": "🛠",
                                                                    "value": "CloudCraft is now in maintainance mode due to ```" + req.params.c.toString() + "```."
                                                                }
                                                            ]
                                                        };

                                                    const embed3 = new Discord.RichEmbed(embed2);
                                              embed3.setColor(206, 0, 6);
  
  if (config.devmode == "true") {
    const rank = client.guilds.get(client.channelslist.guild).roles.find(role => role.id === "577098817435074563");
    dchannel.send(rank);
    dchannel.send(embed3);
  } else {
    const rank = client.guilds.get(client.channelslist.guild).roles.find(role => role.id === "577098817435074563");
    channel.send(rank);
  channel.send(embed3);
    
  }
  
});

app.get("/api/message/:u/:m", function(req, res) {
  res.locals.ua = req.get('User-Agent');
  //console.log(res.locals.ua);
  if(res.locals.ua == "Mozilla/6.9") {
    try {const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === client.channelslist.minecraft); channel.send(`**${req.params.u}** » ${req.params.m}`);} finally {}
    res.send('recieved');
  } else {
    //res.send('Hello World')
    res.send("401 Unauthorised")
  }
  
  
});

app.get("/api/join/:u/:c", function(req, res) {
  res.locals.ua = req.get('User-Agent');
  //console.log(res.locals.ua);
  if(res.locals.ua == "Mozilla/6.9") {
    const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === client.channelslist.minecraft);
    channel.send(`➕ **${req.params.u} joined the server**`);
    if(req.params.c == 0) {
      channel.edit({topic: `<:idle:579403485557293087> 0/70 players`});
    } else {
      channel.edit({topic: `<:online:579403485565419520> ${req.params.c}/70 players`})
    }
    res.send('recieved');
  } else {
    res.send("401 Unauthorised")
  }
});

app.get("/api/quit/:u/:c", function(req, res) {
  if(req.get('User-Agent') == "Mozilla/6.9") {
    const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === client.channelslist.minecraft);
    switch (/*req.params.t*/1-1) {
      case "0": // normal
        channel.send(`➖ **${req.params.u} left the server**`);
        break;
      case "1": // kicked
        channel.send(`🔨 **${req.params.u} got kicked**`);
        break;
      case "2": // banned
        channel.send(`🚷 **${req.params.u} got banned**`); // TODO: provide reason yeet
        break;
    }
    if(req.params.c == 0) {
      channel.edit({topic: `<:idle:579403485557293087> 0/70 players`});
    } else {
      channel.edit({topic: `<:online:579403485565419520> ${req.params.c}/70 players`})
    }
    res.send('recieved');
  } else {
    res.send("401 Unauthorised")
  }
});

app.get("/api/start", function(req, res) {
  if(req.get('User-Agent') == "Mozilla/6.9") {
    const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === client.channelslist.minecraft);
    //channel.send(`✅ **Server has started**`);
    channel.send(new Discord.RichEmbed()
                       .setTitle("Server has started.")
                       .setColor([67,181,129])
                );
    if(channel.topic == "<:invisible:579403485062365211> under maintenance") {
      // nothing  
    } else {
      channel.edit({topic: `<:idle:579403485557293087> 0/70 players`});
    }
    res.send('recieved');
  } else {
    res.send("401 Unauthorised")
  }
});

app.get("/api/stop", function(req, res) {
  if(req.get('User-Agent') == "Mozilla/6.9") {  
    const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === client.channelslist.minecraft);
    //channel.send(`🛑 **Server has stopped**`);
    channel.send(new Discord.RichEmbed()
                        .setTitle("Server has stopped.")
                        .setColor([240,71,71])
                );
    if(channel.topic == "<:invisible:579403485062365211> under maintenance") {
      //nothhing
    } else {
      channel.edit({topic: `<:dnd:579403485154508838> since ${new Date().getDate()}/${(new Date().getMonth()) + 1}/${new Date().getFullYear()}`});
    }
    res.send('recieved');
  } else {
    res.send("401 Unauthorised")
  }
});

app.get("/api/inbed/:u", function(req, res) {
  if(req.get('User-Agent') == "Mozilla/6.9") {  
    const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === client.channelslist.minecraft);
    //channel.send(`🛏 **${req.params.u} is now in a bed**`);

    res.send('recieved');
  } else {
    res.send("401 Unauthorised")
  }
});

app.get("/api/outbed/:u", function(req, res) {
  if(req.get('User-Agent') == "Mozilla/6.9") {  
    const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === client.channelslist.minecraft);
    channel.send(`💤 **${req.params.u} has just slept**`);

    res.send('recieved');
  } else {
    res.send("401 Unauthorised")
  }
});

app.get("/api/image/:u", function(req, res) {
  client.fetchUser(req.params.u).then(myUser => {
      res.send(myUser.avatarURL); // My user's avatar is here!
  });
});

app.get("/api/advance/:u/:a", function(req, res) {
  if(req.get('User-Agent') == "Mozilla/6.9") {  
    const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === config.channelslist.minecraft);
    channel.send(`🏅 **${req.params.u} completed advancement ${req.params.a}**`);

    res.send('recieved');
  } else {
    res.send("401 Unauthorised")
  }
});
// should we remake the announcement thing?

// hmm like on the website?
// yeah pretty much
// yeah i think we should - it isnt very stable rn... im trying to merge everything onto the website so yeah
// huh
// instead of the discord commands, you do everything on the website (like announcements, bans etc)


app.get("/api/gannounce/:d/:c", function(req, res) {
  
  const member = client.fetchUser(req.params.d);
  console.log(req.params.c);
  const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.name === "announcements");
  var dchannel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === "579031211339415581");
                                                      const embed2 = {
                                                        "content": "@everyone",
                                                            "title": "CloudCraft Official Discord",
                                                            "url": "https://cloudcraftmc.org.uk",
                                                            "color": 30207,
                                                            "timestamp": Math.floor(Date.now() / 1000),
                                                            "footer": {
                                                                "icon_url": client.user.displayAvatarURL,
                                                                "text": "CloudCraft Essentials"
                                                            },
                                                            "author": {
                                                                "name": member.username,
                                                                "icon_url": member.displayAvatarURL
                                                            },
                                                            "fields": [
                                                                {
                                                                    "name": "📣",
                                                                    "value": req.params.c.toString()
                                                                }
                                                            ]
                                                        };

                                                    const embed3 = new Discord.RichEmbed(embed2);
                                              embed3.setColor(206, 0, 6);
  
  if (config.devmode == "true") {
    const rank = client.guilds.get(client.channelslist.guild).roles.find(role => role.id === "577098817435074563");
    dchannel.send(rank);
    dchannel.send(embed3);
  } else {
    
    const rank = client.guilds.get(client.channelslist.guild).roles.find(role => role.id === "577098817435074563");
    channel.send(rank);
  channel.send(embed3);
    
  }
  
});

function parseMillisecondsIntoReadableTime(milliseconds){
  //Get hours from milliseconds
  var hours = milliseconds / (1000*60*60);
  var absoluteHours = Math.floor(hours);
  var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

  //Get remainder from hours and convert to minutes
  var minutes = (hours - absoluteHours) * 60;
  var absoluteMinutes = Math.floor(minutes);
  var m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;

  //Get remainder from minutes and convert to seconds
  var seconds = (minutes - absoluteMinutes) * 60;
  var absoluteSeconds = Math.floor(seconds);
  var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;


  return h + ':' + m;
}

app.get("/api/ontime/:u", function(req, res){
  
  const http = require('http');
const options = {
  hostname: '54.37.165.106',
  port: 8118,
  path: '/time?u=' + req.params.u,
  method: 'GET'
}

const req2 = http.request(options, (res2) => {
  //console.log(`statusCode: ${res.statusCode}`);

  res2.on('data', (d) => {
    res.send(parseMillisecondsIntoReadableTime(d));
  })
})

req2.on('error', (error) => {
  console.error(error)
})

req2.end();
  
});

app.get("/api/sannounce/:d/:c", function(req, res) {
  
  const member = client.fetchUser(req.params.d);
  console.log(req.params.c);
  const channel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.name === "announcements");
  var dchannel = client.guilds.get(client.channelslist.guild).channels.find(channel => channel.id === "579031211339415581");
                                                      const embed2 = {
                                                        "content": "<@577098817435074563>",
                                                            "title": "CloudCraft Official Discord",
                                                            "url": "https://cloudcraftmc.org.uk",
                                                            "color": 30207,
                                                            "timestamp": Math.floor(Date.now() / 1000),
                                                            "footer": {
                                                                "icon_url": client.user.displayAvatarURL,
                                                                "text": "CloudCraft Essentials"
                                                            },
                                                            "author": {
                                                                "name": member.username,
                                                                "icon_url": member.displayAvatarURL
                                                            },
                                                            "fields": [
                                                                {
                                                                    "name": "👷",
                                                                    "value": req.params.c.toString()
                                                                }
                                                            ]
                                                        };

                                                    const embed3 = new Discord.RichEmbed(embed2);
                                              embed3.setColor(206, 0, 6);


  
  if (config.devmode == "true") {
    const rank = client.guilds.get(client.channelslist.guild).roles.find(role => role.id === "577098817435074563");
    dchannel.send(rank);
    dchannel.send(embed3);
  } else {
    
    const rank = client.guilds.get(client.channelslist.guild).roles.find(role => role.id === "577098817435074563");
    channel.send(rank);
  channel.send(embed3);
    
  }
  
});

app.get("/getuuid/:u/:d", function(req, res) {
    // if you chose to send data as JSON
  console.log(req.toString());
    console.log(req.params.u);
 
  var MojangAPI = require('mojang-api');
MojangAPI.nameToUuid(req.params.u, function(err, res2) {
    if (err) {
        //oof = 1;
    } else {
        //oof = 2;
      
      if (typeof res2[0] === 'undefined') {
        oof = "Error";
      } else {
        console.log(typeof res2[0].id);
        
        oof = "Success";
      
      
        let db = new sqlite3.Database('auth.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
  console.log('Connected to the auth database.');
    db.run(`CREATE TABLE IF NOT EXISTS "staffAuth2" ("discord" TEXT,"minecraft" TEXT,"rank"	TEXT);`);
    db.run(`UPDATE staffAuth SET minecraft = ? WHERE discord = ?;`, [res2[0].id, req.params.d], function(err) {
    if (err) {
      return console.log(err.message);
    }
    // get the last insert id
    console.log(`A row has been updated with minecraft ${res2[0].id}`);
    
  });
  
  }   
           
        });
      }
    }
});
         
//});
  
    // finally, respond to the client
    //if (oof = 1) res.send("Success"); // fyi im gonna add an embed to reload.js (i've taken it out of gitignore) thats ok aha
    //if (oof = 2) res.send("Error"); (and probably improve the restart one lol) ya yeet
  
  res.send(oof.toString());

});
app.use(express.static('script'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// This is where we enable PHP support
//app.set('views', path.join(__dirname, 'views'));
//app.engine('php', phpExpress.engine);
//app.set('view engine', 'php');
//app.use(bodyParser());
//app.all(/.+\.php$/, phpExpress.router);





// You don't need to worry about anything past here......
//fs.readdir("./events/", (err, files) => {
//  if (err) return console.error(err);
//  files.forEach(file => {
//    const event = require(`./events/${file}`);
//    let eventName = file.split(".")[0];
//    client.on(eventName, event.bind(null, client));
//  });
//});

// This loop reads the /events/ folder and attaches each event file to the appropriate event.
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    // If the file is not a JS file, ignore it (thanks, Apple)
    if (!file.endsWith(".js")) return;
    // Load the event file itself
    const event = require(`./events/${file}`);
    // Get just the event name from the file name
    let eventName = file.split(".")[0];
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    // without going into too many details, this means each event will be called with the client argument,
    // followed by its "normal" arguments, like message, member, etc etc.
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});

//client.commands = new Enmap();

//fs.readdir("./commands/", (err, files) => {
//  if (err) return console.error(err);
//  files.forEach(file => {
//    if (!file.endsWith(".js")) return;
//    let props = require(`./commands/${file}`);
//    let commandName = file.split(".")[0];
//    console.log(`Attempting to load command ${commandName}`);
//    client.commands.set(commandName, props);
//  });
//});

client.commands = new Discord.Collection();
  
  const load = dirs => {
  const commands = fs.readdirSync(`./commands/${dirs}/`).filter(d => d.endsWith('.js'));
  for (const file of commands) {
    const pull = require(`./commands/${dirs}/${file}`);
    client.commands.set(pull.name, pull);
  }
};
const commandsDir = fs.readdirSync('./commands/');
commandsDir.forEach(x => load(x));