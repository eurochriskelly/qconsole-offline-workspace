# Marklogic qconsole-offline-workspace

Manage MarkLogic 'query console' queries offline.

## Motiviation:
- Edit in favourite editor.
- Manually reorder, rename and clean up tabs.
- Manage query console scripts offline in project repository

## Usage
### Install dependencies
    npm install
    
### Edit and define workspace    
  
  Edit xquery files and/or sjs files in folder workspaces/
  e.g.
    
    workspaces/Foo/scratch.xqy
    workspaces/Bar/file1.sjs
     etc.

  Optionally, edit *config.json* to change the default name for the workspace and  
  
### Generate and test  
    Generate a sample config file and modify as required

    mlqcow --generate-conf
    
    Generate workspace:

    mlqcow

## To Do 

The following options would be nice to have:

* Make process reversible. Generate folder from xml file and files from tabs.
* Upload to query console.
* AutoSync: Manage all workspaces offline. 
