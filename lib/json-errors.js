"use strict";

var fs = require('fs'),
    chalk = require('chalk'),
    exitError = require('./exit-error');

/**
 * @param {String} fileName
 *
 * @return {Function}
 */
module.exports = function (fileName) {
    /**
     * @param {number} errorCount
     * @param {Object} errors
     */
    return function (errorCount, errors) {
        if (errorCount > 0) {
            console.log("\n" + chalk.red('Found', chalk.inverse(errorCount), 'errors in file',
                    chalk.inverse(fileName)) + "\n");

            errors.forEach(function (error) {
                console.log('  ' + chalk.bgBlue('parameter:') + ' ' + error.parameter);
                console.log('  ' + chalk.bgBlue('value:') + ' ' + error.value);
                console.log('  ' + chalk.red(error.message) + "\n");
            });

            exitError.throwError(1);
        }
    };
};
