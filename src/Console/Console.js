let shellcraft = require('shellcraft'),
    path = require('path'),
    process = require('process');

let Console = function () {
    let options = {
        version: '0.1.0',
        prompt: 'bot>',
        promptFixed: true,
        autocomplete: true
    };

    const commands = ['Advisor', 'Market'];
    for (const f in commands) {
        shellcraft.registerExtension(path.join(__dirname, commands[f] + '.js'), function (err) {
            if(err) {
                Logger.error(err);
            }
        });
    }

    shellcraft.begin(options, function (err, results) {
        if (err) {
            Logger.error(err);
        }
    });
};

module.exports = Console;
