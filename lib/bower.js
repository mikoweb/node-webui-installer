"use strict";

var tmp = require('tmp'),
    fs = require('fs'),
    wrench = require( 'wrench'),
    spawn = require('child_process').spawn,
    binBower = process.cwd() + '/node_modules/node-webui-installer/node_modules/bower/bin/bower',
    paths, actions;

paths = {
    vendor: 'webui/vendor',
    webui: 'webui',
    copyDirs: [
        'engine',
        'webui'
    ]
};

actions = {
    install: 'install',
    update: 'update'
};

/**
 * @param {string} repository
 * @param {string} version
 */
function bowerJson (repository, version) {
    return '{"name": "webui", "dependencies": {"webui": "' + repository + '#' + version + '"}}';
}

/**
 * @param {string} action
 * @param {string} webuiPath
 */
function vendorDownload (action, webuiPath) {
    if (fs.existsSync(webuiPath)) {
        spawn(binBower, [action], {cwd: webuiPath, stdio: 'inherit'});
    }
}

/**
 * @param {Object} settings
 * @param {String} defaultPath
 *
 * @returns {String}
 */
function bowerCwd (settings, defaultPath) {
    return settings.bowerDir === null ? defaultPath : process.cwd() + '/' . settings.bowerDir;
}

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
            wrench.mkdirSyncRecursive(workPath);
        }

        if (typeof action !== 'string') {
            throw new TypeError('action is not string');
        }

        if (onlyVendor) {
            vendorDownload(action, bowerCwd(settings, webuiPath));
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

                bower = spawn(binBower, ['install'], {cwd: bowerPath, stdio: 'inherit'});

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

                    vendorDownload(action, bowerCwd(settings, webuiPath));

                    wrench.rmdirSyncRecursive(path, true);
                });
            });
        }
    }
};
