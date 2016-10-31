"use strict";

var chalk = require('chalk'),
    fs = require('fs'),
    extra = require('fs-extra'),
    exitError = require('../exit-error'),
    fileconcat = require('fileconcat'),
    compressor = require('node-minify');

/**
 * @param {String} directory
 * @param {Array} libs
 * @param {String} [root]
 */
module.exports = function (directory, libs, root) {
    if (directory.length === 0) {
        console.log(chalk.red('Option directory is empty!'));
        exitError.throwError(1);
    }

    root = root || process.cwd();
    directory = root + '/' + directory;
    var src = root + '/node_modules',
        requirejsRc = {paths: {}};

    /**
     * @param {String} name
     * @param {String} fileName
     */
    function concatComplete (name, fileName) {
        var path = fileName.substr(0, fileName.lastIndexOf('.'));
        requirejsRc.paths[name] = '{{path}}' + path.replace(directory, '');
        console.log(chalk.green(fileName));
    }

    process.on('exit', function () {
        try {
            extra.writeJsonSync(root + '/.requirejsrc', requirejsRc);
            console.log(chalk.green('.requirejsrc has been rebuilt.'));
        } catch (e) {
            console.log(chalk.red(e.message));
        }
    });

    extra.remove(directory, function () {
        console.log(chalk.green(directory, chalk.inverse('has been cleared.')));
        console.log(chalk.bgBlue('Copy libs...'));

        libs.forEach(function (data, libKey) {
            var name = data[0],
                files = data[1].split(','),
                sources = [],
                dist = data[2],
                options = data[3] ? data[3].split('|') : [];

            if (dist.trim().length === 0) {
                console.log(chalk.red('Dist file from libs[' + libKey + ']', chalk.inverse('is empty!')));
                exitError.throwError(1);
            }

            dist = directory + '/' + dist.trim();

            files.forEach(function (file, key) {
                if (file.trim().length === 0) {
                    console.log(chalk.red('Source file from libs[' + libKey + '][' + key +']', chalk.inverse('is empty!')));
                    exitError.throwError(1);
                }

                sources.push(src + '/' + file.trim());
            });

            var stat;
            try {
                stat = fs.statSync(sources[0]);
            } catch (e) {
                stat = false;
            }

            if (stat && sources.length === 1 && stat.isDirectory()) {
                extra.copy(sources[0], dist, function (err) {
                    if (err) {
                        console.log(chalk.red(err));
                        exitError.throwError(1);
                    } else {
                        console.log(chalk.green(dist));
                    }
                });
            } else {
                fileconcat(sources, dist, {
                    mkdirp: true
                }, function (err) {
                    if (err) {
                        console.log("\n");
                        console.log(chalk.red(err));
                        console.log(chalk.magenta('Sources:', sources.join(',')));
                        console.log(chalk.magenta('Dest:', dist));
                        console.log("\n");
                        process.exit(1);
                    }

                    if (options.indexOf('uglify') !== -1) {
                        new compressor.minify({
                            type: 'uglifyjs',
                            fileIn: dist,
                            fileOut: dist,
                            callback: function(err) {
                                if (err) {
                                    console.log("\n");
                                    console.log(chalk.red('Problem with uglify file', chalk.inverse(dist)));
                                    console.log(chalk.red(err));
                                    console.log("\n");
                                    process.exit(1);
                                } else {
                                    concatComplete(name, dist);
                                }
                            }
                        });
                    } else {
                        concatComplete(name, dist);
                    }
                });
            }
        });
    });
};
