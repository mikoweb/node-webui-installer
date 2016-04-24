"use strict";

var tmp = require('tmp'),
    bower = require('./bower.js'),
    binGrunt = process.cwd() + '/node_modules/node-webui-installer/node_modules/grunt-cli/bin/grunt',
    fs = require('fs'),
    wrench = require('wrench');

module.exports = {
    /**
     * @param {Object} settings
     */
    execute: function (settings) {
        var cwd = process.cwd(),
            workPath = cwd + '/' + settings.directory,
            webuiPath = workPath + '/' + bower.paths.webui,
            webuiVendor = workPath + '/' + bower.paths.vendor;

        tmp.dir({prefix: 'webui_grunt_'}, function (err, path) {
            if (err) {
                throw err;
            }

            var vendorDir = bower.bowerDirectory(settings, webuiPath),
                gruntContent = fs.readFileSync('../template/Gruntfile.js').toString();

            wrench.copyDirSyncRecursive(vendorDir, path);
            gruntContent = gruntContent.replace(/\{\{path_webui_vendor\}\}/g, webuiVendor);
            console.log(gruntContent);
        });
    }
};
