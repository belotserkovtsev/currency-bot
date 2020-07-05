// const assert = require('chai').assert;
const assert = require('assert');
const AsyncLock = require('async-lock');
global.__basedir = '/Users/bmb/Documents/nodejs/currency';
global.__lock = new AsyncLock();
const Descriptor = require(`../models/descriptor`);

describe('Descriptor', () => {
    it('Should find CB mention', async () => {
        let data = await Descriptor.decodeMessageCB('цб доллар 20.03.2006');
        assert.strictEqual(data.date, "20.03.2006");
        assert.strictEqual(data.currency.currency, "USD");
    });
    it('Should find date', async () => {
        let data = await Descriptor.findDate('цб доллар 20.03.2006');
        assert.strictEqual(data, "20.03.2006");
    });
    it('Should reject if wrong date', async () => {
        await assert.rejects(Descriptor.findDate('цб доллар 20.03.20066'));
        await assert.rejects(Descriptor.findDate('цб доллар 200.03.2006'));
        await assert.rejects(Descriptor.findDate('цб доллар 20.13.2006'));
        await assert.rejects(Descriptor.findDate('цб доллар 20.12.20'));
    });
    it('Should decode regular message', async () => {
        let data = await Descriptor.decodeMessage('питерский доллар');
        assert.strictEqual(data.city.city, "Санкт-Петербург");
        assert.strictEqual(data.currency.currency, "USD");

        data = await Descriptor.decodeMessage('шла саша по самаре и оч хотела фунтов');
        assert.strictEqual(data.city.city, "Самара");
        assert.strictEqual(data.currency.currency, "GBP");
        assert.strictEqual(data.postFields, "region_url=samara&sort=buy&order=desc" +
            "&amount=1000&page=1&currency=826")
    });
})


