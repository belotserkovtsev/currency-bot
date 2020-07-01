const Telegraf = require('telegraf');
const Extra = require('telegraf/extra')
const AsyncLock = require('async-lock');
global.__basedir = __dirname;
global.__lock = new AsyncLock();
const Descriptor = require('./models/descriptor');
const Parser = require('./models/parser');

const bot = new Telegraf(process.env.TOKEN);

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username
});

/* On /start event handler */
bot.start(ctx => {
    // ctx.scene.enter('start');
    ctx.replyWithHTML('🤖 <b>Добро пожаловать в Bank Tracker!</b> Напиши мне какую валюту ты хочешь и где. ' +
        'Например: "<b>хочу баксы в спб</b>"');
});

bot.on('text', ctx => {
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
                ctx.chat.type !== 'private' ?
                    ctx.replyWithHTML(replyHeader + replyBody, Extra.inReplyTo(ctx.message.message_id)) :
                    ctx.replyWithHTML(replyHeader + replyBody) :
                ctx.chat.type !== 'private' ?
                    ctx.replyWithHTML(`☹️ В городе ${city} <b>не обменивают ${currency}</b>`,
                        Extra.inReplyTo(ctx.message.message_id)) :
                    ctx.replyWithHTML(`☹️ В городе ${city} <b>не обменивают ${currency}</b>`);

        })
        .catch(err => {
            if(ctx.chat.type === 'private')
                ctx.reply(err);
        })
});

bot.on('message', ctx => {
    if(ctx.chat.type === 'private'){
        ctx.replyWithHTML('🔮 <b>Запускаю нейронную сеть</b>, приступаю к расшифровке...')
            .then(res => {
                setTimeout(() => {
                    return ctx.replyWithHTML('😄 Шучу. <b>Пожалуйста, отправь текст</b>');
                }, 3000)
            })
            .catch(err => {
                console.log(err);
            })
    }
})

bot.launch()
    .catch(err => {
    console.log(err);
})