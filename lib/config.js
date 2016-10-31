"use strict";

var util = require('util'),
    fs = require('fs'),
    validator = require('node-validator'),
    chalk = require('chalk'),
    errors = require('./json-errors');

module.exports = {
    /**
     * @param {string} [fileName]
     * @returns {Object}
     */
    getConfig: function (fileName) {
        var config = require('../defaults.json'),
            myConfig, fileContent;

        if (typeof fileName === 'string' && fs.existsSync(fileName)) {
            fileContent = fs.readFileSync(fileName);
            myConfig = JSON.parse(fileContent.toString());
            config = util._extend(config, myConfig);
        }

        var check = validator.isObject()
            .withRequired('package', validator.isString())
            .withOptional('version', validator.isString())
            .withRequired('directory', validator.isString())
            .withOptional('publicDir', validator.isString())
            .withOptional('libDir', validator.isString())
            .withRequired('libs', validator.isArray(validator.isArray(validator.isString(), {min: 3})))
        ;

        validator.run(check, config, errors(fileName));

        return config;
    }
};
