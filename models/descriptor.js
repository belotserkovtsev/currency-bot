const fs = require('fs');
const Logs = require(`${__basedir}/models/logs`);
const Exception = require(`${__basedir}/exceptions/exception`);

class Descriptor {
    static cities = JSON.parse(fs.readFileSync(`${__basedir}/dictionaries/cities.json`)).cities;
    static currencies = JSON.parse(fs.readFileSync(`${__basedir}/dictionaries/currencies.json`)).currencies;

    static decodeMessage(message){
        return new Promise((resolve, reject) => {
            let city = null;
            let currency = null;
            let postFields = null;

            this.findCurrency(message)
                .then(res => {
                    Logs.log(1, message, res);
                    currency = res;
                    return this.findCity(message);
                })
                .then(res => {
                    Logs.log(2, message, res);
                    city = res;
                    return this.getPostFields(currency, city);
                })
                .then(res => {
                    Logs.log(3, [currency, city], res);
                    postFields = res;
                    resolve({city: city, currency: currency, postFields: postFields});
                })
                .catch(e => {
                    __lock.acquire('error', () =>{
                        return Logs.logError(e);
                    })
                        .catch(err => {
                            console.log(err.message);
                        })
                    reject(e);
                })
        })
    }

    static decodeMessageCB(message){
        return new Promise((resolve, reject) => {
            let currency = null;
            if(message.toLowerCase().split(' ').
            find((element, index, array) => {return element === 'цб';})){
                this.findCurrency(message)
                    .then(res => {
                        Logs.log(1, message, res);
                        currency = res;
                        return this.findDate(message)
                    })
                    .then(res => {
                        Logs.log(7, message, res);
                        resolve({date:res, currency:currency});
                    })
                    .catch(e => {
                        __lock.acquire('error', () =>{
                            return Logs.logError(e);
                        })
                            .catch(err => {
                                console.log(err.message);
                            })
                        reject(e);
                    })
            }
            else{
                reject(new Exception(5, "Не смог найти ЦБ"));
            }

        })
    }

    static getPostFields(currency, city){
        return new Promise((resolve, reject) => {
            let regionUrl = city.request;
            let sort = 'buy';
            let order = 'desc';
            let amount = 1000;
            let page = 1;
            let cur = currency.id;
            let postField = `region_url=${regionUrl}&sort=${sort}&order=${order}&amount=${amount}` +
                `&page=${page}&currency=${cur}`;
            // console.log(postField);
            return resolve(postField);
        })
    }

    static findCity(message){
        return new Promise((resolve, reject) => {
            let words = message.split(' ');
            loop:
            for(let i = 0; i < this.cities.length; i++){
                for(let j = 0; j < this.cities[i].keys.length; j++){
                    for (let k = 0; k < words.length; k++){
                        if(words[k].toLowerCase().startsWith(this.cities[i].keys[j])){
                            resolve(this.cities[i]);
                            break loop;
                        }
                    }
                }
            }
            return reject(new Exception(2, "Не смог получить город", message));
            // return reject(new Error('Не нашел город'));
        });
    }

    static findCurrency(message){
        return new Promise((resolve, reject) => {
            let words = message.split(' ');
            loop:
                for(let i = 0; i < this.currencies.length; i++){
                    for(let j = 0; j < this.currencies[i].keys.length; j++){
                        for (let k = 0; k < words.length; k++){
                            if(this.currencies[i].keys[j] === words[k].toLowerCase()){
                                resolve(this.currencies[i]);
                                break loop;
                            }
                        }
                    }
                }
            // return reject(new Error('Не нашел валюту'));
            return reject(new Exception(1, "Не смог получить валюту", message));
        });
    }

    static findDate(message){
        return new Promise((resolve, reject) => {
            let words = message.split(' ');
            words.forEach(i => {
                if(i.match(/[0-9]{2}\.[0-9]{2}\.[0-9]{4}/)){
                    let date = i.split('.');
                    if(date[0] > 31 || date[1] > 12 || date[2] > 2020 || date[2] < 1992)
                        return reject(new Exception(6, "Неверный формат даты", message));
                    resolve(i);
                }
            });
            reject(new Exception(4, "Не смог получить дату", message));
        })
    }
}

module.exports = Descriptor;