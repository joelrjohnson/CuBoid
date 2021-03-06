var _ = require('lodash');
var fs = require('fs');

require('child_process').execSync("./node_modules/.bin/ntsc");

function run(config) {
    var Client = require('tennu').Client;
// Create the dependency management object.
    var parts = {};
    var verbose = true, debug = false;
    if (verbose) {
        var log = function (level) {
            return function () {
                var args = Array.prototype.slice.call(arguments).map(function (arg) {
                    if (typeof arg === 'object') {
                        return inspect(arg);
                    } else {
                        return String(arg);
                    }
                });
                console.log(String(Date()), level, args.join(' '));
            };
        };
        parts.Logger = {
            debug: debug ? log('debug') : function () {
            },
            info: log('info'),
            notice: log('notice'),
            warn: log('warn'),
            error: log('error'),
            crit: log('crit'),
            alert: log('alert'),
            emerg: log('emerg')
        };
    }
// Try to connect, or print why it couldn"t.
    try {
        var client = Client(config, parts);
        client.connect();
    } catch (e) {
        console.log('Error occurred creating and connecting to Tennu instance.');
        console.log();
        console.log(e.stack);
        process.exit(4);
    }
// Register hangup functions
    var onabort = function self() {
        if (!self.attemptedToQuitAlready) {
            client.quit('Bot terminated.');
            self.attemptedToQuitAlready = true;
        } else {
            process.exit(1);
        }
    };
    process.on('SIGHUP', onabort);
    process.on('SIGINT', onabort);
    process.on('SIGQUIT', onabort);
    process.on('SIGABRT', onabort);
    process.on('SIGTERM', onabort);
}

var config = JSON.parse(fs.readFileSync('./config.json', 'utf-8')),
    local = JSON.parse(fs.readFileSync('./local.json', 'utf-8'));

_.extend(config, local);

run(config);
