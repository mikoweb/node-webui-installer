#!/usr/bin/env node

"use strict";

var program = require('commander'),
    config = require('../lib/config.js'),
    bower = require('../lib/bower.js'),
    grunt = require('../lib/grunt.js'),
    action, settings;

program
    .version('0.1.3')
    .usage('install | update | grunt')
    .option('--only-vendor', 'Only vendor directory')
    .action(function (cmd) {
        action = cmd;
    })
    .parse(process.argv)
;

settings = config.getConfig(process.cwd() + '/webui.json');

switch (action) {
    case 'install':
        bower.execute(settings, bower.actions.install, program.onlyVendor || false);
        break;
    case 'update':
        bower.execute(settings, bower.actions.update, program.onlyVendor || false);
        break;
    case 'grunt':
        grunt.execute(settings);
        break;
    default:
        console.error('no command given!');
        process.exit(1);
}
