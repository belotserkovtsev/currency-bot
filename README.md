# 👻 Currency-bot

<b>Currency bot is a telegram bot which makes currency exchange easier.</b> 

## 📟 Features

Bot is able to:

- Descript natural speech
- Log all user actions and errors
- Find banks and choose best rates in more than 35 cities
- Be easily scaled and improved
![](https://i.imgur.com/4qfNb1N.png)


## 💻 Installation
Download and install the latest version of [Node.js](https://nodejs.org/en/)

Clone this repo and install dependencies:
```bash
git clone https://github.com/belotserkovtsev/currency-bot.git
cd currency-bot
npm install
```

Insert your bot token into <b>package.json</b> to <b>npm run app</b>:

```json
"scripts": {
    "app": "TOKEN=yourToken node app.js"
  }
```
Or right into app.js:
```js
const bot = new Telegraf('token');
```

Launch your application with <b>pm2</b>, <b>node</b> or <b>npm</b>

```bash
node index.js
```

## 📱 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.