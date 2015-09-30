#!/usr/bin/env node

'use strict';

var argv = require('optimist').argv;
var mlqcow = require('../lib/index.js');

console.log(argv.option);
console.log("Marklogic Query Console Offline Workspace");


if (argv.watch) {
    mlqcow.watch(function () {
        console.log('Stopped watching');
    });
    return;
}


mlqcow.generate(function (e, result) {
    if (e) {
        console.log('Error during conversion');
        console.log(e);
        return;
    }
    console.log('Workspace exported to file: ' + result);
});




process.on('error', function () {
    setTimeout(function () {
        console.log('Process died unexpectedly.');
    }, 1000);
})
