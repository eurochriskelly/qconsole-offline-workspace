#!/usr/bin/env node

var mlqcow = require('../lib/index.js');

console.log("Marklogic Query Console Offline Workspace");

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
