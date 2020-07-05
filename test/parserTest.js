const assert = require('assert');
const AsyncLock = require('async-lock');
global.__basedir = '/Users/bmb/Documents/nodejs/currency';
global.__lock = new AsyncLock();
const Parser = require('../models/parser');

describe('Parser', () => {
    it('Should get banki.ru page', async () => {
        let data = await Parser.postRequest('region_url=samara&sort=buy&order=desc' +
            '&amount=1000&page=1&currency=826');
        assert.strictEqual(data.statusCode, 200);
        assert.ok(data.data.length > 0);
    });
    it('POST should reject if wrong data passed', async () => {
        await assert.rejects(Parser.postRequest());
        await assert.rejects(Parser.postRequest('test'));
    });
    it('Should get CB page', async () => {
        let data = await Parser.getRequest('20.03.2006');
        assert.strictEqual(data.statusCode, 200);
        assert.ok(data.data.length > 0);
    });
    it('Should parse banki.ru html', async () => {
        let page = await Parser.postRequest('region_url=samara&sort=buy&order=desc' +
            '&amount=1000&page=1&currency=826');
        let data = await Parser.parseHtml(page.data)
        assert.ok(Array.isArray(data));
    });
    it('Should parse CB html', async () => {
        let page = await Parser.getRequest('20.03.2006');
        let currency = "USD";
        let data = await Parser.parseHtmlCB(page.data, currency);
        assert.ok(data);
    });
})