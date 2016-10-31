"use strict";

var fs = require('fs'),
    validator = require('node-validator'),
    chalk = require('chalk'),
    errors = require('./json-errors');

module.exports = {
    /**
     * @param {string} filaneme
     * @returns {Object}
     */
    getConfig: function (filaneme) {
        if (!fs.existsSync(filaneme)) {
            console.log("\n" + chalk.red('Not found file', chalk.inverse(filaneme)) + "\n");
        }

        var config = JSON.parse(fs.readFileSync(filaneme).toString());
        var check = validator.isObject()
            .withRequired('public', validator.isString())
            .withRequired('private', validator.isArray(validator.isString(), {min: 1}))
        ;

        validator.run(check, config, errors(filaneme));

        return config;
    }
};
