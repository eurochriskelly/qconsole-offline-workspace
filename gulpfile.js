var gulp = require('gulp');
var through = require('through2');
var gutil = require('gulp-util');
var mlqcow = require('./lib/index');
var PluginError = gutil.PluginError;

var OUT_DIR = './QC/';
var IN_DIR = './QC/';
var CONF, EXPORT_NAME;
// todo: review config format. convert to tab array

gulp.task('default', showHelp);
gulp.task('generate', generate);

//-----
function generate () {
    mlqcow.setup({
        outDir : OUT_DIR,
        inDir : IN_DIR
    });
    mlqcow.generate()
}
function showHelp (cb) {
    console.log([
	'',
	'gulp TASK',
	'USAGE:',
	'  generate    : creates something.xml for import',
	''
    ].join('\n'));
    cb();
}
