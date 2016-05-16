"use strict";

var tmp = require('tmp'),
    fs = require('fs'),
    fsExtra = require('fs-extra'),
    spawn = require('cross-spawn-async'),
    binBower = 'bower',
    paths, actions;

if (fs.existsSync(process.cwd() + '/node_modules/node-webui-installer/node_modules/bower/bin/bower')) {
    binBower = process.cwd() + '/node_modules/node-webui-installer/node_modules/bower/bin/bower';
} else if (fs.existsSync(process.cwd() + '/node_modules/bower/bin/bower')) {
    binBower = process.cwd() + '/node_modules/bower/bin/bower';
}

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
    var json;

    if (repository) {
        json = '{"name": "webui", "dependencies": {"webui": "' + repository + '#' + version + '"}}';
    } else {
        json = '{"name": "webui", "dependencies": {"webui": "' + version + '"}}';
    }

    return json;
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
    return settings.bowerDir === null ? defaultPath : process.cwd() + '/' + settings.bowerDir;
}

/**
 * @param {Object} settings
 * @param {String} defaultPath
 *
 * @returns {String}
 */
function bowerDirectory(settings, defaultPath) {
    var cwd = bowerCwd(settings, defaultPath),
        directory = cwd + '/bower_components',
        bowerrc;

    if (fs.existsSync(cwd + '/.bowerrc')) {
        bowerrc = JSON.parse(fs.readFileSync(cwd + '/.bowerrc').toString());

        if (typeof bowerrc.directory !== 'undefined') {
            directory = cwd + '/' + bowerrc.directory;
        }
    }

    return directory;
}

module.exports = {
    paths: paths,
    actions: actions,
    bowerCwd: bowerCwd,
    bowerDirectory: bowerDirectory,
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
            fsExtra.mkdirsSync(workPath);
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
                    fsExtra.copySync(vendorPath, vendorBackup);
                }

                fs.writeFileSync(bowerPath + '/bower.json', bowerJson(settings.repository, settings.version));

                bower = spawn(binBower, ['install'], {cwd: bowerPath, stdio: 'inherit'});

                bower.on('exit', function () {
                    var webuiFiles = bowerPath + '/bower_components/webui',
                        i, current;

                    for (i = 0; i < paths.copyDirs.length; ++i) {
                        current = workPath + '/' + paths.copyDirs[i];
                        if (fs.existsSync(current)) {
                            try {
                                fsExtra.removeSync(current);
                            } catch (e) {}
                        }

                        fsExtra.copySync(webuiFiles + '/' + paths.copyDirs[i], current);
                    }

                    if (fs.existsSync(vendorBackup)) {
                        fsExtra.copySync(vendorBackup, vendorPath);
                    }

                    vendorDownload(action, bowerCwd(settings, webuiPath));

                    try {
                        fsExtra.removeSync(path);
                    } catch (e) {}
                });
            });
        }
    }
};
