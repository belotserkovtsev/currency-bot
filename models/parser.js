const { Curl } = require('node-libcurl');
const cheerio = require('cheerio');
const Logs = require(`${__basedir}/models/logs`);
const Exception = require(`${__basedir}/exceptions/exception`);

class Parser {
    //post request to banki.ru
    static postRequest(postFields){
        return new Promise((resolve, reject) =>{
            const postCurl = new Curl();
            postCurl.setOpt('URL',
                'https://www.banki.ru/products/currency/exchange/search/');
            postCurl.setOpt('FOLLOWLOCATION', true);
            postCurl.setOpt('COOKIEFILE', `${__basedir}/cookie`);
            postCurl.setOpt('COOKIEJAR', `${__basedir}/cookie`);
            // postCurl.setOpt('HEADER', true);
            postCurl.setOpt('SSL_VERIFYHOST', false);
            postCurl.setOpt('SSL_VERIFYPEER', false);
            postCurl.setOpt('USERAGENT',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36');
            // postCurl.setOpt('POST', true);
            postCurl.setOpt('POSTFIELDS', postFields);
            postCurl.setOpt('HTTPHEADER', [
                'Host: www.banki.ru',
                'Accept: */*',
                'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
                'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With: XMLHttpRequest',
                'Origin: https://www.banki.ru',
                'DNT: 1',
                'Connection: keep-alive'
            ]);

            postCurl.on('end',(statusCode, data, headers) => {
                if(statusCode === 200)
                    resolve({'statusCode': statusCode, 'data': data, 'headers': headers});
                else
                    reject(new Exception(3, 'Не удалось сделать запрос к Банки.ру. Попробуйте позже!'));
                // console.log(statusCode);
                // console.log(data);
                postCurl.close();
            });

            postCurl.on('error', postCurl.close.bind(postCurl));
            postCurl.perform();
        })
    }

    //get request to CB
    static getRequest(date){
        return new Promise((resolve, reject) => {
            const getCurl = new Curl();
            getCurl.setOpt('URL',
                `http://www.cbr.ru/currency_base/daily/?UniDbQuery.Posted=True&UniDbQuery.To=${date}`);
            getCurl.setOpt('FOLLOWLOCATION', true);
            getCurl.setOpt('COOKIEFILE', `${__basedir}/cookie`);
            getCurl.setOpt('COOKIEJAR', `${__basedir}/cookie`);
            getCurl.setOpt('SSL_VERIFYHOST', false);
            getCurl.setOpt('SSL_VERIFYPEER', false);
            //curl.setOpt('RETURNTRANSFER', true);
            getCurl.setOpt('USERAGENT',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36');

            getCurl.on('end', function (statusCode, data, headers) {
                getCurl.close();
                if(statusCode === 200)
                    resolve({'statusCode': statusCode, 'data': data, 'headers': headers});
                else
                    reject(new Exception(3,"Не удалось сделать запрос к ЦБ. Попробуйте позже"))
            });
            getCurl.on('error', getCurl.close.bind(getCurl));

            getCurl.perform();
        })
    }

    static getBanks(postFields){
        return new Promise((resolve, reject) => {
            this.postRequest(postFields)
                .then(res => {
                    __lock.acquire('log', () =>{
                        return Logs.log(4, postFields, res.statusCode);
                    })
                        .catch(err => {
                            console.log(err.message);
                        })
                    return this.parseHtml(res.data);
                })
                .then(res => {
                    __lock.acquire('log', () =>{
                        return Logs.log(5, 'html page', res.length + ' банков');
                    })
                        .catch(err => {
                            console.log(err.message);
                        })
                    resolve(res);
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

    static getRates(data){
        return new Promise((resolve, reject) => {
            this.getRequest(data.date)
                .then(res => {
                    __lock.acquire('log', () =>{
                        return Logs.log(8, data.date, res.statusCode);
                    })
                        .catch(err => {
                            console.log(err.message);
                        })
                    return this.parseHtmlCB(res.data, data.currency.currency);
                })
                .then(res => {
                    __lock.acquire('log', () =>{
                        return Logs.log(5, ['html', data.currency.currency], res);
                    })
                        .catch(err => {
                            console.log(err.message);
                        })
                    resolve(res);
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

    static parseHtml(page){
        return new Promise((resolve, reject) => {
            try{
                const $ = cheerio.load(page);
                let result = Array();
                let existingBanks = Array();
                $("div.exchange-calculator-rates.table-flex__row-group ")
                    .find("div.table-flex__row.item.calculator-hover-icon__container")
                    .each((index, element) => {
                    let bankName = $(element).find("div.table-flex__cell.trades-table__name > a").text();
                    let rateBuy = $(element).find("div.table-flex__rate.font-size-large.text-nowrap:nth-child(2)")
                        .attr("data-currencies-rate-buy");
                    let rateSell = $(element).find("div.table-flex__rate.font-size-large.text-nowrap:nth-child(3)")
                        .attr("data-currencies-rate-sell");
                    // console.log(bankName + ' ' + rateBuy + '; ' + rateSell);
                    if(existingBanks.indexOf(bankName) < 0) {
                        existingBanks.push(bankName);
                        result.push({bank: bankName, buy: rateBuy, sell: rateSell});
                    }
                })
                resolve(result);
            }
            catch (e) {
                reject(e);
            }
        })
    }

    static parseHtmlCB(page, currency){
        return new Promise((resolve, reject) => {
            try{
                const $ = cheerio.load(page);
                $("div.table-wrapper > div.table > table.data > tbody")
                    .find("tr")
                    .each((index, element) => {
                        $(element)
                            .find("td")
                            .each((index1, element1) => {
                                if($(element1).text() === currency){
                                    // console.log($(element).find("td:nth-child(5)").text());
                                    return resolve($(element).find("td:nth-child(5)").text());
                                }
                            })
                    })
            }
            catch (e) {
                reject(e);
            }
        })
    }
}

module.exports = Parser;