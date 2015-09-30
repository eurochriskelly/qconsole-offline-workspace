var path = require('path');
var fs = require('fs');
var os = require('os');

var libMlqcow = function () {
    "use strict";
    
    var OUT_DIR = path.resolve(process.cwd()) + "/";
    var IN_DIR = path.resolve(process.cwd()) + "/";
    var CONF = {};
    var EXPORT_NAME = 'ws';

    return {
        init : init,
        generate : generate,
        watch : watch
    };

    function init (spec) {
        OUT_DIR = spec.outDir || OUT_DIR;
        IN_DIR = spec.inDir || IN_DIR;
    }
    function watch (callback) {
        console.log('Watching')

        setTimeout(function () {
            callback();
        }, 3000);
    }
    function generate (callback) {
        var foundFolder;
        
        process.argv.forEach(function (a, i) {
	        if (a === '--folder') {
	            try {
		            foundFolder = true;
		            setFolders(process.argv[i+1]);
	            }
	            catch (e) {
		            console.log('Make sure the folder and mlqcow.json exist!');
		            console.log(e);
		            process.exit();
	            }
	        }
        });

        try {
            CONF = require(path.resolve(IN_DIR + "mlqcow.json"));
	        EXPORT_NAME = CONF['ws-name'] || 'WS-QCOWS';
        }
        catch (e) {
            console.log(e);
            console.log('Make sure mlqcow.json exists in directory!');
            console.log(path.resolve(IN_DIR + "mlqcow.json"));
            process.exit();
        }
        
        _concatXqryFiles(callback);
    }
    function _concatXqryFiles (cb) {
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

		            var parts = f.split('.');
		            var ext = parts.length == 1 ? '' : parts[parts.length-1];
		            var namepart = parts[0];
		            if (parts.length > 1) {
		                parts.pop();
		                namepart= parts.join('.');
		            }

		            var qry = {
		                contents : [
			                '    <query name="' + (CONF.names[namepart] || namepart) + '" '
			                    + 'focus="false" ' 
			                    + getContentSource (namepart) 
			                    + getTabMode (ext)
			                    + ' active="false">',
			                xmlEscape(data),
			                '    </query>'
		                ].join(''),
		                name : namepart
		            };

		            // ignore temp files, xml files and mlqcow config file
		            if ((f[f.length-1] !== '~')
		                && (f[0] !== '.')
		                && (f.substring(0,6) !== 'mlqcow')
		                && (f[0] !== '#')
		                && ext !== 'xml'
                        && ext !== 'log'
                       )
		                queries.push(qry);				

		            if (!--remaining) writeoutXmlFile();
		            
		            function getTabMode (ext) {
		                if (!ext) return '';
		                var type='xquery';
		                switch (ext) {
		                case 'sparql':type = 'sparql';break;
		                case 'sql':type = 'sql';break;
		                case 'sjs':type = 'javascript';break;
		                case 'js':type = 'javascript';break;
		                case 'xqy':type = 'xquery';break;
		                case 'xquery':type = 'xquery';break;
		                default : type = 'xquery';break;
		                }
		                var ret = ' mode="' + type + '"';
		                return ret;
		            }
		            function getContentSource (n) {
		                if (CONF.sources && CONF.sources[n]) {
			                var ret = ' content-source="as:' + CONF.sources[n] + ':"';
			                return ret;
		                }
		                return ' content-source="' + CONF['default-source'] + '" ' || ' ';
		            }
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
			                    n			});

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
			                    process.exit();2
			                }
			                cb(null, EXPORT_NAME + '.xml');
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
}();

module.exports = libMlqcow;
