"use strict";

var program = require('commander'),
    chalk = require('chalk'),
    exitError = require('./exit-error');

module.exports = {
    /**
     * @param {Object} options
     */
    start: function (options) {
        program
            .version('1.0.0');

        program
            .command('install [version]')
            .action(function(version) {
                var npm = require('./action/install')(options.package, version || options.version);

                npm.on('close', function () {
                    require('./action/copy-engine')(options.directory, options.package, options.publicDir);
                });
            });

        program
            .command('copy-engine')
            .action(function() {
                require('./action/copy-engine')(options.directory, options.package, options.publicDir);
            });

        program
            .command('copy-libs')
            .action(function() {
                var directory = options.libDir ? options.libDir : options.directory + '/webui/vendor';
                require('./action/copy-libs')(directory, options.libs);
            });

        program
            .command('*')
            .action(function(action) {
                console.log("\n  " + chalk.red('Not found Command ', chalk.inverse(action), '!'));
                program.help();
                exitError.throwError(1);
            });

        program.parse(process.argv);
    }
};
