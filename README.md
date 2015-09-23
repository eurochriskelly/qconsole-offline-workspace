# qconsole-offline-workspace

Converts offline *xquery* and related files to a MarkLogic query console workflow in XML format. 

Intended to enable offline editing in you favourite editor.

## Usage
### Install dependencies

    npm install -g gulp
    npm install
    
### Edit and define workspace    
  
  Edit xquery files and/or sjs files in folder QC/
  e.g.
    
    QC/scratch.xqy
    QC/file1.xqy
    etc.
 
  Optionally, edit *config.json* to change the default name for the workspace and  
  
### Generate and test  
  When ready run:

    gulp generate
    
  Import files into query console to test.
  
  
## To Do 

The following options would be nice to have:

* Add ```gulp watch``` option
* Allow heirarchy of files
* Add import option for exported qconsole workspace defintions
* Allow paths to be defined in config.json file for input and output files
* Enable working with multiple input folders
