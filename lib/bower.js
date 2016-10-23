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
    install: ['install', '--production'],
    update: ['update',  '--production']
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
 * @param {Array|string} action
 * @param {string} webuiPath
 */
function vendorDownload (action, webuiPath) {
    if (fs.existsSync(webuiPath)) {
        spawn(binBower, Array.isArray(action) ? action : [action], {cwd: webuiPath, stdio: 'inherit'});
    }
}

/**
 * @param {Object} settings
 *
 * @returns {String}
 */
function bowerCwd (settings) {
    return settings.bowerDir === null ? process.cwd() : process.cwd() + '/' + settings.bowerDir;
}

/**
 * @param {Object} settings
 *
 * @returns {String}
 */
function bowerDirectory (settings) {
    var cwd = bowerCwd(settings),
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

/**
 * @param {Object} settings
 *
 * @returns {String}
 */
function vendorDirectory (settings) {
    var cwd = process.cwd(), dir;

    if (settings.vendorDir === null) {
        dir = cwd + '/' + settings.directory + '/' + paths.vendor;
    } else {
        dir = cwd + '/' + settings.vendorDir;
    }

    return dir;
}

module.exports = {
    paths: paths,
    actions: actions,
    bowerCwd: bowerCwd,
    bowerDirectory: bowerDirectory,
    vendorDirectory: vendorDirectory,
    /**
     * @param {Object} settings
     * @param {string} action
     * @param {boolean} onlyVendor
     */
    execute: function (settings, action, onlyVendor) {
        var cwd = process.cwd(),
            workPath = cwd + '/' + settings.directory;

        if (!fs.existsSync(workPath)) {
            fsExtra.mkdirsSync(workPath);
        }

        if (onlyVendor) {
            vendorDownload(action, bowerCwd(settings));
        } else {
            tmp.dir({prefix: 'webui_'}, function (err, path) {
                if (err) {
                    throw err;
                }

                var bower,
                    backupPath = path + '/backup',
                    bowerPath = path + '/bower',
                    vendorPath = vendorDirectory(settings),
                    vendorBackup = backupPath + '/vendor';

                fs.mkdirSync(backupPath);
                fs.mkdirSync(bowerPath);

                if (fs.existsSync(vendorPath)) {
                    fsExtra.copySync(vendorPath, vendorBackup);
                }

                fs.writeFileSync(bowerPath + '/bower.json', bowerJson(settings.repository, settings.version));

                bower = spawn(binBower, ['install', '--production'], {cwd: bowerPath, stdio: 'inherit'});

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

                    if (typeof settings.publicDir === 'string' && settings.publicDir.length 
                        && fs.existsSync(webuiFiles + '/public')
                    ) {
                        fsExtra.copySync(webuiFiles + '/public', cwd + '/' + settings.publicDir);
                    }

                    if (fs.existsSync(vendorBackup)) {
                        fsExtra.copySync(vendorBackup, vendorPath);
                    }

                    vendorDownload(action, bowerCwd(settings));

                    try {
                        fsExtra.removeSync(path);
                    } catch (e) {}
                });
            });
        }
    }
};
