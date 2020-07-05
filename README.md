# 👻 Currency-bot

<b>Currency bot is a telegram bot which makes currency exchange easier.</b> 

## 📟 Features

Bot is able to:

- Descript natural speech
- Log all user actions and errors
- Find banks and choose best rates in more than 35 cities
- Function in group chats
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
node app.js
```

## ⛔️ Error codes
Could be found in ./logs/errors.json
- Unable to get currency - <b>1</b>
- Unable to get city - <b>2</b>
- Response from server !== 200 - <b>3</b>
- Unable to get date - <b>4</b>
- Unable to get "ЦБ" - <b>5</b>
- Invalid date format - <b>6</b>
- Unable to send the message - <b>7</b>
- Unable to launch bot - <b>8</b>

## ✅ Action codes
Could be found in ./logs/userActions.json
- Find currency - <b>1</b>
- Find city - <b>2</b>
- Get POST fields - <b>3</b>
- POST request - <b>4</b>
- HTML parsing - <b>5</b>
- Find «ЦБ» - <b>6</b>
- Find date - <b>7</b>
- GET request - <b>8</b>

## 📱 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.