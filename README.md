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
    
    QC/Default/scratch.xqy
    QC/Default/file1.xqy
    etc.

  Optionally, edit *config.json* to change the default name for the workspace and  
  
### Generate and test  
  When ready run:

    gulp generate
    
  Import files into query console to test.
  
#### Working with folders

  To import from a subfolder other than Default and keep work separte use:

    gulp generate --folder SomeFolder

  This will move input and outpt data to the location ./QC/SomeFolder/

## To Do 

The following options would be nice to have:

* Add ```gulp watch``` option
* Add import option for exported qconsole workspace defintions

