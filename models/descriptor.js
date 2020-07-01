const fs = require('fs');

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
                    currency = res;
                    return this.findCity(message);
                })
                .then(res => {
                    city = res;
                    return this.getPostFields(currency, city);
                })
                .then(res => {
                    postFields = res;
                    resolve({city: city, currency: currency, postFields: postFields});
                })
                .catch(e => {
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
            return reject(new Error('Не нашел город'));
        });
    }

    static findCurrency(message){
        return new Promise((resolve, reject) => {
            let words = message.split(' ');
            loop:
                for(let i = 0; i < this.currencies.length; i++){
                    for(let j = 0; j < this.currencies[i].keys.length; j++){
                        for (let k = 0; k < words.length; k++){
                            if(this.currencies[i].keys[j].toLowerCase() === words[k]){
                                resolve(this.currencies[i]);
                                break loop;
                            }
                        }
                    }
                }
            return reject(new Error('Не нашел валюту'));
        });
    }
}

module.exports = Descriptor;