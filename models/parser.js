const { Curl } = require('node-libcurl');
const cheerio = require('cheerio');
const Logs = require(`${__basedir}/models/logs`);
const Exception = require(`${__basedir}/exceptions/exception`);

class Parser {
    static postRequest(postFields){
        return new Promise((resolve, reject) =>{
            const postCurl = new Curl();
            postCurl.setOpt('URL', 'https://www.banki.ru/products/currency/exchange/search/');
            postCurl.setOpt('FOLLOWLOCATION', true);
            postCurl.setOpt('COOKIEFILE', `${__basedir}/cookie`);
            postCurl.setOpt('COOKIEJAR', `${__basedir}/cookie`);
            // postCurl.setOpt('HEADER', true);
            postCurl.setOpt('SSL_VERIFYHOST', false);
            postCurl.setOpt('SSL_VERIFYPEER', false);
            postCurl.setOpt('USERAGENT', `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36`);
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
                    reject(new Exception(3, 'Не удалось сделать запрос к сайту. Попробуйте позже!'));
                console.log(statusCode);
                // console.log(data);
                postCurl.close();
            });

            postCurl.on('error', postCurl.close.bind(postCurl));
            postCurl.perform();
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
                    reject(e.message);
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
                reject(e.message);
            }
        })
    }
}

module.exports = Parser;