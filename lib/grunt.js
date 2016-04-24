"use strict";

var tmp = require('tmp'),
    bower = require('./bower.js'),
    binGrunt = process.cwd() + '/node_modules/node-webui-installer/node_modules/grunt-cli/bin/grunt';

module.exports = {
    /**
     * @param {Object} settings
     */
    execute: function (settings) {
        var cwd = process.cwd(),
            workPath = cwd + '/' + settings.directory,
            webuiPath = workPath + '/' + bower.paths.webui;

        tmp.dir({prefix: 'webui_'}, function (err, path) {
            if (err) {
                throw err;
            }

            console.log(bower.bowerDirectory(settings, webuiPath));
        });
    }
};
