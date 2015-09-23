var gulp = require('gulp');
var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var fs = require('fs');

var CONF = require("./src/names.json");

var EXPORT_NAME = CONF['ws-name'] || 'WS-QCOWS';
var OUT_DIR = './QC/';
var IN_DIR = './QC/';

gulp.task('default', showHelp);
gulp.task('generate', function (callback) {
    // todo: stream
    concatXqryFiles(callback);
});

//-----
function concatXqryFiles (cb) {
    "use strict";
    
    fs.readdir(IN_DIR, function (e, files) {
	var remaining = files.length;
	var queries = [];

	files.forEach(function (f) {
	    fs.readFile(IN_DIR + f, 'utf8', function (e, data) {
		if (e) {
		    console.log('ERROR: Could not read file: ' + (IN_DIR + f));
		    process.exit();
		}
		var namepart = f.split('.')[0];
		var ext = f.split('.')[1];
		var qry = {
		    contents : [
			'    <query name="' + (CONF.names[namepart] || namepart)
			    + '" focus="false" ' +
			    'active="false" mode="xquery">',
			xmlEscape(data),
			'    </query>'
		    ].join(''),
		    name : namepart
		};

		if ((f[f.length-1] !== '~')
		    && (f[0] !== '.')
		    && (f.substring(0,5) !== 'names')
		    && (f[0] !== '#'))
		    queries.push(qry);				
		
		
		if (!--remaining) writeoutXmlFile();

		function writeoutXmlFile () {
		    queries = queries
			.sort(function (a, b) {
 			    // Sort by printed name and not read order
			    var usenameA = CONF.names[a.name] || a.name;
			    var usenameB = CONF.names[b.name] || b.name;
			    return (usenameA > usenameB)
				? 1
				: (usenameA === usenameB)
				? 0
				: -1;
			})
			.map(function (q) {
			    return q.contents;
			});
		    
		    var xml = [
			'<export>',
			'  <workspace name="' + CONF['ws-name'] + '">',
			queries.join('\n'),
			'  </workspace>',
			'</export>'
		    ].join('\n');
		    
		    var outfile = path.resolve(OUT_DIR + EXPORT_NAME + '.xml');
		    fs.writeFile(outfile, xml, 'utf8', function (e) {
			if (e) {
			    console.log(e);
			    process.exit();
			}
			cb();
		    });
		}
		function xmlEscape (xml) {
		    return xml
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
		    	.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
		    	.replace(/'/g, '&apos;');
		}
	    });
	});
    });
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
