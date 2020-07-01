const Telegraf = require('telegraf');
const Stage = require('telegraf/stage')
const session = require('telegraf/session')
const BaseScene = require('telegraf/scenes/base')
// const SocksAgent = require('socks-proxy-agent');
// const User = require('./models/user.js')
global.__basedir = __dirname;
const Descriptor = require('./models/descriptor');
const Parser = require('./models/parser');

const bot = new Telegraf(process.env.TOKEN);

/* New scene creation */
// const start = new BaseScene('start');

/* Registering scenes */
const stage = new Stage();
// stage.register(start);

/* Making staging work, initializing session for personalized statistics */
bot.use(session())
bot.use(stage.middleware())

/* On /start event handler */
bot.start(ctx => {
    // ctx.scene.enter('start');
    ctx.reply('Добро пожаловать в бота!');
});

bot.on('message', ctx => {
    let message = ctx.message.text;
    let city = null;
    let currency = null;
    Descriptor.decodeMessage(message)
        .then(res => {
            city = res.city.city;
            currency = res.currency.currency;
            return Parser.getBanks(res.postFields)
        })
        .then(res => {
            let replyHeader = `👻 <b>Банки с выгодным курсом ${currency} для города ${city}:</b>\n\n`;
            let replyBody = '';
            for(let i = 0; i < 5 && i < res.length; i++){
                replyBody += '🏛 <b>' + res[i].bank + '</b>\n' + '💵 Покупка: ' +
                    res[i].buy + ', \n💶 Продажа: ' + res[i].sell + '\n\n'
            }
            replyBody ?
                ctx.replyWithHTML(replyHeader + replyBody) :
                ctx.replyWithHTML(`☹️ В городе ${city} <b>не обменивают ${currency}</b>`);

        })
        .catch(err => {
            ctx.reply(err);
        })
})

bot.launch().catch(err => {
    console.log(err);
})