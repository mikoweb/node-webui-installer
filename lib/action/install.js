"use strict";

var spawn = require('cross-spawn');

/**
 * @param {String} name
 * @param {String} [version]
 * @param {String} [cwd]
 */
module.exports = function (name, version, cwd) {
    var pack = name;

    if (version) {
        pack += '@' + version;
    }

    return spawn('npm', ['install', pack, '--save', '--production'],
        {cwd: cwd || process.cwd(), stdio: 'inherit'});
};
