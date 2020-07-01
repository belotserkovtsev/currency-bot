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
                    __lock.acquire('log', () =>{
                        return Logs.log(1, message, res);
                    })
                        .catch(err => {
                            console.log(err.message);
                        })
                    // Logs.log(1, message, res);
                    currency = res;
                    return this.findCity(message);
                })
                .then(res => {
                    __lock.acquire('log', () =>{
                        return Logs.log(2, message, res);
                    })
                        .catch(err => {
                            console.log(err.message);
                        })
                    // Logs.log(2, message, res);
                    city = res;
                    return this.getPostFields(currency, city);
                })
                .then(res => {
                    __lock.acquire('log', () =>{
                        return Logs.log(3, [currency, city], res);
                    })
                        .catch(err => {
                            console.log(err.message);
                        })
                    // Logs.log(3, [currency, city], res);
                    postFields = res;
                    resolve({city: city, currency: currency, postFields: postFields});
                })
                .catch(e => {
                    // Logs.logError(e);
                    reject(e.message);
                    console.log(e.message);
                })
        })
    }

    static getPostFields(currency, city){
        return new Promise((resolve, reject) => {
            console.log(city.request);
            console.log(currency.currency);
            let regionUrl = city.request;
            let sort = 'buy';
            let order = 'desc';
            let amount = 1000;
            let page = 1;
            let cur = currency.id;
            let postField = `region_url=${regionUrl}&sort=${sort}&order=${order}&amount=${amount}` +
                `&page=${page}&currency=${cur}`;
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
            return reject(new Exception(2, "Не смог получить город"));
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
            return reject(new Exception(1, "Не смог получить валюту"));
        });
    }
}

module.exports = Descriptor;