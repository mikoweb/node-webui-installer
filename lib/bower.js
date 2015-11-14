"use strict";

var tmp = require('tmp'),
    fs = require('fs'),
    wrench = require( 'wrench'),
    spawn = require('child_process').spawn;

var paths = {
    vendor: 'webui/vendor',
    webui: 'webui',
    copyDirs: [
        'engine',
        'webui'
    ]
};

var actions = {
    install: 'install',
    update: 'update'
};

/**
 * @param {string} repository
 * @param {string} version
 */
var bowerJson = function (repository, version) {
    return '{"name": "webui", "dependencies": {"webui": "' + repository + '#' + version + '"}}';
};

/**
 * @param {string} action
 * @param {string} webuiPath
 */
var vendorDownload = function (action, webuiPath) {
    if (fs.existsSync(webuiPath)) {
        spawn('bower', [action], {cwd: webuiPath, stdio: 'inherit'});
    }
};

module.exports = {
    paths: paths,
    actions: actions,
    /**
     * @param {Object} settings
     * @param {string} action
     * @param {boolean} onlyVendor
     */
    execute: function (settings, action, onlyVendor) {
        var cwd = process.cwd(),
            workPath = cwd + '/' + settings.directory,
            webuiPath = workPath + '/' + paths.webui;

        if (!fs.existsSync(workPath)) {
            fs.mkdirSync(workPath);
        }

        if (typeof action !== 'string') {
            throw new TypeError('action is not string');
        }

        if (onlyVendor) {
            vendorDownload(action, webuiPath);
        } else {
            tmp.dir({prefix: 'webui_'}, function (err, path) {
                if (err) {
                    throw err;
                }

                var bower,
                    backupPath = path + '/backup',
                    bowerPath = path + '/bower',
                    vendorPath = workPath + '/' + paths.vendor,
                    vendorBackup = backupPath + '/vendor';

                fs.mkdirSync(backupPath);
                fs.mkdirSync(bowerPath);

                if (fs.existsSync(vendorPath)) {
                    wrench.copyDirSyncRecursive(vendorPath, vendorBackup);
                }

                fs.writeFileSync(bowerPath + '/bower.json', bowerJson(settings.repository, settings.version));

                bower = spawn('bower', ['install'], {cwd: bowerPath, stdio: 'inherit'});

                bower.on('exit', function () {
                    var webuiFiles = bowerPath + '/bower_components/webui',
                        i, current;

                    for (i = 0; i < paths.copyDirs.length; ++i) {
                        current = workPath + '/' + paths.copyDirs[i];
                        if (fs.existsSync(current)) {
                            wrench.rmdirSyncRecursive(current, true);
                        }

                        wrench.copyDirSyncRecursive(webuiFiles + '/' + paths.copyDirs[i], current);
                    }

                    if (fs.existsSync(vendorBackup)) {
                        wrench.copyDirSyncRecursive(vendorBackup, vendorPath);
                    }

                    vendorDownload(action, webuiPath);

                    wrench.rmdirSyncRecursive(path, true);
                });
            });
        }
    }
};
