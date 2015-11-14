#!/usr/bin/env node

"use strict";

var program = require('commander'),
    config = require('../lib/config.js'),
    bower = require('../lib/bower.js'),
    action, settings;

program
    .version('0.0.1')
    .usage('install | update')
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
    default:
        console.error('no command given!');
        process.exit(1);
}
