global.Logger = require('bitbot/Logger');

const Bot = require('./src/Bot');
const Console = require('bitbot/Console/Console');

let config = require('./config');
let bot = new Bot(config);
global.bot = bot;
bot.start();

if (process.stdin.isTTY) {
    let c = new Console();
}
