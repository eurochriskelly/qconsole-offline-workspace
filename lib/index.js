var path = require('path');
var fs = require('fs');
var clc = require('cli-color');
var os = require('os');

var libMlqcow = function () {
    "use strict";
    
    var EXPORT_NAME = '';

    return {
        generate : generate,
        watch : watch
    };

    function watch (callback) {
        console.log('Watching');
        setTimeout(function () {
            callback();
        }, 3000);
    }
    
    function generate (callback) {
        const CONF = require(path.resolve("./mlqcow.json"));
        _processArgs(() => {
            var remaining = CONF.length;
            CONF.forEach((c) => {
                try {
                    EXPORT_NAME = CONF['workspace'] || 'WS-QCOWS';
                }
                catch (e) {
                    if (e.code === 'MODULE_NOT_FOUND') {
                        console.log('Make sure mlqcow.json exists in directory!');
                        process.exit();
                    }
                }
                _concatXqryFiles(c, (e, ws) => {
                    if (ws) {
                        console.log('Workspace exported to file: ' + clc.green(ws));
                    }
                    if (!--remaining) callback();
                });
            });
        });
    }
    
    function _processArgs (callback) {
        var remaining = process.argv.length;
        process.argv.forEach(function (a, i) {
            try {
                switch (a) {
                    case '--gen-config':
                        _genConfig(() => {
                            process.exit();
                        });
                    default :
                        break;
                }
                if (!--remaining) callback();
            }
            catch (e) {
                console.log('Make sure the folder and mlqcow.json exist!');
                console.log('  use --gen-config to generate sample.');
                console.log(e);
                process.exit();
            }

        });
    }

    function _concatXqryFiles (conf, cb) {
        const in_dir = path.resolve(conf.source);
        const out_path = path.resolve(conf.source) + '.xml';

        fs.readdir(in_dir, function (e, files) {
            if (e) {
                console.log('ERROR: reading folder: ' + in_dir);
                console.log('Check folder exists and contains data!');
                process.exit();
            }
            var remaining = files.length;
            var queries = [];

            if (!files.length) return cb();
            
            files.forEach(function (f) {
                fs.readFile(path.resolve(in_dir, f), 'utf8', function (e, data) {
                    if (e) {
                        console.log('ERROR: Could not read file: ' + path.resolve(in_dir, f));
                        process.exit();
                    }

                    var parts = f.split('.');
                    var ext = parts.length == 1 ? '' : parts[parts.length-1];
                    var namepart = parts[0];
                    if (parts.length > 1) {
                        parts.pop();
                        namepart= parts.join('.');
                    }

                    const tabMode = getTabMode (ext);
                    if (tabMode) {
                        var qry = {
                            contents : [
                                '    <query name="' + (conf.tabs[namepart] || namepart) + '" '
                                    + 'focus="false" '
                                    + getContentSource (namepart)
                                    + tabMode
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
                    }
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
                        default : type = null;break;
                        }
                        var ret = type ? ' mode="' + type + '"' : null;
                        return ret;
                    }
                    function getContentSource (n) {
                        if (conf.source && conf.source[n]) {
                            var ret = ' content-source="as:' + conf.source[n] + ':"';
                            return ret;
                        }
                        return conf['default-source']
                            ? ' content-source="' + conf['default-source'] + '" '
                            : ' ';
                    }
                    function writeoutXmlFile () {
                        queries = queries
                            .sort(function (a, b) {
                                // Sort by printed name and not read order
                                var usenameA = conf.tabs[a.name] || a.name;
                                var usenameB = conf.tabs[b.name] || b.name;
                                return (usenameA > usenameB)
                                    ? 1
                                    : (usenameA === usenameB)
                                    ? 0
                                    : -1;
                            })
                            .map(q => q.contents);

                        var xml = [
                            '<export>',
                            '  <workspace name="' + conf['workspace'] + '">',
                            queries.join('\n'),
                            '  </workspace>',
                            '</export>'
                        ].join('\n');

                        var outfile = path.resolve(out_path);
                        fs.writeFile(outfile, xml, 'utf8', function (e) {
                            if (e) {
                                console.log(e);
                                process.exit();
                            }
                            cb(null, out_path);
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
    function _genConfig (cb) {
        var sample = `[
            {
                "workspace" : "Workspace1",
                "source" : "Workspaces/WS1",
                "tabs" : {
                    "abc" : "1 : HELLO"
                }
            },
            {
                "workspace" : "Another",
                "source" : "Workspaces/WS2",
                "tabs" : {
                    "def" : "1 : Testing"
                }
            }
        ]`;
        fs.writeFile('./mlqcow.json', sample, 'utf8', cb);
    }
}();

module.exports = libMlqcow;
