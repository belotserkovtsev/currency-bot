const assert = require('assert');
const AsyncLock = require('async-lock');
global.__basedir = '/Users/bmb/Documents/nodejs/currency';
global.__lock = new AsyncLock();
const Logs = require('../models/logs');
const Exception = require('../exceptions/exception');

describe('Logs', () => {
    it('Should log action', async () => {
        let data = await Logs.log(0, 'Test input', 'Test output');
        assert.ok(data);
    });
    it('Should log error', async () => {
        let data = await Logs.logError(new Exception(0, 'Test exception'))
        assert.ok(data);
    });
})