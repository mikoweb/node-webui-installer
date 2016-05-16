"use strict";

var tmp = require('tmp'),
    bower = require('./bower.js'),
    binGrunt = 'grunt',
    fs = require('fs'),
    fsExtra = require('fs-extra'),
    spawn = require('cross-spawn-async');

if (fs.existsSync(process.cwd() + '/node_modules/node-webui-installer/node_modules/grunt-cli/bin/grunt')) {
    binGrunt = process.cwd() + '/node_modules/node-webui-installer/node_modules/grunt-cli/bin/grunt';
} else if (fs.existsSync(process.cwd() + '/node_modules/grunt-cli/bin/grunt')) {
    binGrunt = process.cwd() + '/node_modules/grunt-cli/bin/grunt';
}

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
                bowerCwd = bower.bowerCwd(settings, webuiPath),
                gruntContent = fs.readFileSync(__dirname + '/../template/Gruntfile.js').toString(),
                gruntConfig, gruntCopy = {files: []}, i, grunt;

            fsExtra.mkdirsSync(path + '/vendor');

            if (fs.existsSync(bowerCwd + '/webui-grunt.json')) {
                gruntConfig = require(bowerCwd + '/webui-grunt.json');

                if (gruntConfig.copy !== undefined && Array.isArray(gruntConfig.copy)) {
                    for (i = 0; i < gruntConfig.copy.length; i++) {
                        if (typeof gruntConfig.copy[i] === 'string') {
                            gruntCopy.files.push({
                                nonull: true,
                                src: vendorDir + '/' + gruntConfig.copy[i],
                                dest: path + '/vendor/' + gruntConfig.copy[i]
                            });
                        } else if (typeof gruntConfig.copy[i] === 'object') {
                            if (typeof gruntConfig.copy[i].directory === 'string'
                                && typeof gruntConfig.copy[i].src === 'string'
                            ) {
                                gruntCopy.files.push({
                                    expand: true,
                                    cwd: vendorDir + '/' + gruntConfig.copy[i].directory + '/',
                                    src: [gruntConfig.copy[i].src],
                                    dest: path + '/vendor/' + gruntConfig.copy[i].directory + '/'
                                });
                            }
                        }
                    }
                }

                gruntContent = gruntContent
                    .replace(/\{\{path_webui_vendor\}\}/g, webuiVendor + '/')
                    .replace(/\{\{path_package_js\}\}/g, __dirname + '/../package.json')
                    .replace(/\{\{copy_webui_vendor\}\}/g, JSON.stringify(gruntCopy))
                ;

                fs.writeFileSync(__dirname + '/../Gruntfile.js', gruntContent);
                grunt = spawn(binGrunt, ['--force'], {cwd: __dirname + '/../', stdio: 'inherit'});
                grunt.on('exit', function () {
                    fs.unlinkSync(__dirname + '/../Gruntfile.js');
                    fsExtra.copySync(path + '/vendor', webuiVendor);
                    try {
                        fsExtra.removeSync(path);
                    } catch (e) {}
                });
            }
        });
    }
};
