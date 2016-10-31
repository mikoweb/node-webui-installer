"use strict";

var fs = require('fs'),
    extra = require('fs-extra'),
    chalk = require('chalk'),
    rc = require('../rc'),
    exitError = require('../exit-error');

/**
 * @param {String} directory
 * @param {String} packageName
 * @param {String} publicDir
 * @param {String} [root]
 */
module.exports = function (directory, packageName, publicDir, root) {
    if (directory.length === 0) {
        console.log(chalk.red('Option directory is empty!'));
        exitError.throwError(1);
    }

    if (packageName.length === 0) {
        console.log(chalk.red('Option package is empty!'));
        exitError.throwError(1);
    }

    root = root || process.cwd();
    directory = root + '/' + directory;
    var src = root + '/node_modules/' + packageName;

    console.log(chalk.bgBlue('Copy engine directories...'));
    fs.stat(src, function(err, stats) {
        if (!err && stats.isDirectory()) {
            var config = rc.getConfig(src + '/.webuirc');

            if (publicDir) {
                var publicSrc = src + '/' + config.public;
                fs.stat(publicSrc, function(err, stats) {
                    if (err || !stats.isDirectory()) {
                        console.log(chalk.red('Not found directory ', chalk.inverse(publicSrc), "!\n"));
                        exitError.throwError(1);
                    }

                    var path = root + '/' + publicDir;
                    extra.remove(path, function () {
                        extra.copy(publicSrc, path, function (err) {
                            if (err) {
                                console.log(chalk.red(err));
                                exitError.throwError(1);
                            } else {
                                console.log(chalk.green(path));
                            }
                        });
                    });
                });
            }

            config.private.forEach(function (folder) {
                var source = src + '/' + folder;
                fs.stat(source, function(err, stats) {
                    if (err || !stats.isDirectory()) {
                        console.log(chalk.red('Not found directory ', chalk.inverse(source), "!\n"));
                        exitError.throwError(1);
                    }

                    var output = directory + '/' + folder;
                    extra.remove(output, function () {
                        extra.copy(source, output, function (err) {
                            if (err) {
                                console.log(chalk.red(err));
                                exitError.throwError(1);
                            } else {
                                console.log(chalk.green(output));
                            }
                        });
                    });
                });
            });
        } else {
            console.log(chalk.red('Not found Package ', chalk.inverse(packageName), "!\n"));
            exitError.throwError(1);
        }
    });
};
