"use strict";

var tmp = require('tmp'),
    bower = require('./bower.js'),
    binGrunt = process.cwd() + '/node_modules/node-webui-installer/node_modules/grunt-cli/bin/grunt',
    fs = require('fs'),
    wrench = require('wrench'),
    spawn = require('child_process').spawn;

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

            if (fs.existsSync(bowerCwd + '/webui-grunt.json')) {
                gruntConfig = require(bowerCwd + '/webui-grunt.json');
                wrench.copyDirSyncRecursive(vendorDir, path + '/vendor');

                if (gruntConfig.copy !== undefined && Array.isArray(gruntConfig.copy)) {
                    for (i = 0; i < gruntConfig.copy.length; i++) {
                        if (typeof gruntConfig.copy[i] === 'string') {
                            gruntCopy.files.push({
                                nonull: true,
                                src: path + '/vendor/' + gruntConfig.copy[i],
                                dest: '<%= path.webui.vendor %>/' + gruntConfig.copy[i]
                            });
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
                    wrench.rmdirSyncRecursive(path, true);
                });
            }
        });
    }
};
