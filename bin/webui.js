#!/usr/bin/env node

"use strict";

var cmd = require('../lib/command'),
    config = require('../lib/config.js'),
    exitError = require('../lib/exit-error'),
    chalk = require('chalk');

try {
    cmd.start(config.getConfig(process.cwd() + '/webui.json'));
} catch (e) {
    if (exitError.validError(e)) {
        console.log("\n");
        console.log(chalk.red('Exit code:', chalk.inverse(e.code)));
        console.log(chalk.red('Message:', chalk.inverse(e.message)));
        console.log("\n");
        process.exit(e.code);
    } else {
        throw e;
    }
}
