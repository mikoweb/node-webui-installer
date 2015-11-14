"use strict";

var util = require('util'),
    fs = require('fs');

module.exports = {
    /**
     * @param {string} [jsonFilename]
     * @returns {Object}
     */
    getConfig: function (jsonFilename) {
        var config = require('../defaults.json'),
            myConfig, fileContent;

        if (typeof jsonFilename === 'string' && fs.existsSync(jsonFilename)) {
            fileContent = fs.readFileSync(jsonFilename);

            try {
                myConfig = JSON.parse(fileContent.toString());
            } catch (error) {
                myConfig = {};
            }

            config = util._extend(config, myConfig);
        }

        return config;
    }
};
