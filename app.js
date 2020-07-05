const Telegraf = require('telegraf');
const Extra = require('telegraf/extra')
const AsyncLock = require('async-lock');
global.__basedir = __dirname;
global.__lock = new AsyncLock();
const Parser = require('./models/parser');
const Descriptor = require('./models/descriptor.js');

const bot = new Telegraf(process.env.TOKEN);

bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username
});

/* On /start event handler */
bot.start(ctx => {
    // ctx.scene.enter('start');
    ctx.chat.type === 'private' ?
        ctx.replyWithHTML('🤖 <b>Добро пожаловать в Bank Tracker!</b> Напиши мне какую валюту ты хочешь и где. ' +
            'Например: "<b>хочу баксы в спб</b>"',
            Telegraf.Markup.keyboard([['🧭Как пользоваться', '💣Сообщить о баге']]).
            oneTime().resize().extra()) :
        ctx.replyWithHTML('🤖 <b>Добро пожаловать в Bank Tracker!</b> Напиши мне какую валюту ты хочешь и где. ' +
            'Например: "<b>хочу баксы в спб</b>"');
});

bot.hears('🧭Как пользоваться', ctx => {
    if(ctx.chat.type === 'private')
        ctx.replyWithHTML('🤖 Бот умеет искать выгодные обменные пункты более чем в 35 городах России. ' +
            'Для того, чтобы начать поиск, <b>просто напишите где и какая валюта вам нужна</b>. Например:\n' +
            '"<b>купить фунты в мск</b>" или "<b>хочу чебоксарских йен</b>". \n\nТак же бот умеет получть ' +
            'курс, установленный ЦБ РФ с 97 года по сегодняшний день - для этого напишите фразу: ' +
            '"<b>цб 20.03.2016 евро</b>" или "<b>баксы в 15.07.1999 у цб</b>"\n\n' +
            'Бота так же можно добавить в групповой чат, и он будет реагировать на сообщения пользователй ' +
            'об обмене валют');
});

bot.hears('💣Сообщить о баге', ctx => {
    if(ctx.chat.type === 'private')
        ctx.replyWithHTML('👾 <b>Сообщи</b> @belotserkovtsev что случилось');
});

bot.on('text', (ctx, next) => {
    let message = ctx.message.text;
    let currency = null;
    let date = null;
    Descriptor.decodeMessageCB(message)
        .then(res => {
            currency = res.currency;
            date = res.date;
            return Parser.getRates(res);
        })
        .then(res => {
            ctx.replyWithHTML
            (`👻 <b>Центральный банк</b> ${date} установил курс для <b>${currency.currency}</b>:\n\n 💷 ${res}`);
        })
        .catch(e => {
            console.log(e.message);
            if(e.id === 5){
                next();
            }
            else if(ctx.chat.type === 'private'){
                ctx.reply(e.message);
            }
        })
})

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
                ctx.reply(err.message);
        })
});

bot.on('message', ctx => {
    if(ctx.chat.type === 'private'){
        ctx.replyWithHTML('🔮 <b>Запускаю нейронную сеть</b>, приступаю к расшифровке...')
            .then(res => {
                setTimeout(() => {
                    return ctx.replyWithHTML('Не выходит.. <b>Пожалуйста, отправь текст</b>');
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