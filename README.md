# 🚀 Currency-bot

<b>Currency bot is a telegram bot which makes currency exchange easier.</b> 



## 💻 Installation
Download and install the latest version of [Node.js](https://nodejs.org/en/)

Clone this repo, install dependencies and create some files:
```bash
git clone https://github.com/belotserkovtsev/currency-bot.git
cd currency-bot
npm install
```

Add proxy and insert your bot token:

```js
const socksAgent = new SocksAgent({
    socksHost: "8.8.8.8",
    socksPort: "888",
    socksUsername: 'username', //on need
    socksPassword: 'password' //on need
});
```
```js
const bot = new Telegraf('token', {
    telegram: { agent: socksAgent }
});
```

Launch your application with <b>pm2</b> or <b>node</b>

```bash
node index.js
```

## 📱 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.