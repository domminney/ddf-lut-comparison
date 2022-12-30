//generate json file with content of all cube files in luts folder and subfolders

var fs = require('fs');
var path = require('path');

var luts = [];
var lutsPath = path.join(__dirname, 'public/LUTs');

function getLuts(dir) {
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getLuts(name);
        }   
        else {
            if (path.extname(name) == '.cube') {
               
        
                luts.push(name.split('/Users/dave/Documents/VS Code/NodeJS/luttest/public')[1])
                
            }
        }
    }
}

getLuts(lutsPath);

var json = JSON.stringify(luts);

fs.writeFile('public/luts.json', json, 'utf8', function(err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('LUTs JSON file generated');
    }
}   
);
