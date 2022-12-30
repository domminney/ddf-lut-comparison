var image

var luts=[]

var pickedLuts=[]

var imageSrc='/tapfs_1.3.1.T.jpg';


async function app() {

    //clear body

    document.querySelectorAll('body')[0].innerHTML = ''


    if (luts.length == 0 && pickedLuts.length == 0) {

        //load luts array from luts.json asynchronously

        const response = await fetch('luts.json');
        const json = await response.json();
        luts = json;
        console.log(luts)

        //randomly sort luts array

        luts.sort(function (a, b) { return 0.5 - Math.random() });

        
    }

    if (luts.length==0 && pickedLuts.length>0) {

        luts=pickedLuts
        pickedLuts=[]

        if (luts.length>1 && luts.length%2==1) {
            
            luts.push(luts[luts.length-1])
           
        }

    }

    if (luts.length==1) {
        //write lut name to body

        document.querySelectorAll('body')[0].innerHTML = "<h1>"+ luts[0]+ "</h1>"

        return

    }

    document.querySelectorAll('body')[0].innerHTML = "<h1>"+ luts.length + "</h1>"



    // First, we need to create a canvas element and draw the image onto it
    var canvas = document.createElement('canvas');
    canvas.width = 1920 / 2;
    canvas.height = 1080 / 2;

    canvas.onclick=function(){
        pickedLuts.push(luts[0])
        try {            
            luts.shift()
            luts.shift()
        } catch (error) {
            
        }
        app()
    }

    var ctx = canvas.getContext('2d');

    var canvas2 = document.createElement('canvas');
    canvas2.width = 1920 / 2;
    canvas2.height = 1080/2;

    canvas2.onclick=function(){
        pickedLuts.push(luts[1])
        try {            
            luts.shift()
            luts.shift()
        } catch (error) {
            
        }
        app()
    }

    var ctx2 = canvas2.getContext('2d');

    // Load the image and draw it onto the canvas
    image = new Image();
    image.src = imageSrc;
    

    image.onload = function () {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        ctx2.drawImage(image, 0, 0, canvas.width, canvas.height);
        document.querySelectorAll('body')[0].appendChild(canvas);
        document.querySelectorAll('body')[0].appendChild(canvas2);

        // Now we need to load the LUT cube file
        var lut;

        fetch(luts[0]).then(function (response) {
            return response.text();
        }).then(function (text) {
            lut = parseLUT(text);

            // Get the image data from the canvas
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            console.log(lut)

            // Apply the LUT to the image data
            applyLUT(imageData, lut);

            // Draw the modified image data back onto the canvas
            ctx.putImageData(imageData, 0, 0);

        });

        fetch(luts[1]).then(function (response) {
            return response.text();
        }).then(function (text) {
            lut = parseLUT(text);

            // Get the image data from the canvas
            var imageData = ctx2.getImageData(0, 0, canvas.width, canvas.height);

            console.log(lut)

            // Apply the LUT to the image data
            applyLUT(imageData, lut);

            // Draw the modified image data back onto the canvas
            ctx2.putImageData(imageData, 0, 0);

        });
    };





}


function parseLUT(text) {
    var lines = text.split('\n');
    var lut = [];


    // remove comments

    lines = lines.filter(function (line) {
        return line[0] !== '#';
    });

    //remove blank lines

    lines = lines.filter(function (line) {
        return line.trim() !== '';
    });


    // get title

    var title = lines[0].split(' ')[1];


    // Parse the size and domain of the LUT
    var size = parseInt(lines[1].split(' ')[1]);
    var domain = [0, 1]

    // Parse the LUT data
    for (var i = 0; i < size; i++) {
        lut[i] = [];
        for (var j = 0; j < size; j++) {
            lut[i][j] = [];
            for (var k = 0; k < size; k++) {
                var values = lines[4 + i * size * size + j * size + k].split(' ').map(function (x) { return parseFloat(x); });
                lut[i][j][k] = [values[0], values[1], values[2]];
            }
        }
    }

    return { size: size, domain: domain, data: lut };
}


function applyLUT(imageData, lut) {
    var data = imageData.data;
    var size = lut.size;
    var domain = lut.domain;
    var lutData = lut.data;

    for (var i = 0; i < data.length; i += 4) {
        var b = data[i] / 255;
        var g = data[i + 1] / 255;
        var r = data[i + 2] / 255;

        
        var rIndex = Math.min(size - 1, Math.floor((r - domain[0]) / (domain[1] - domain[0]) * size));
        var gIndex = Math.min(size - 1, Math.floor((g - domain[0]) / (domain[1] - domain[0]) * size));
        var bIndex = Math.min(size - 1, Math.floor((b - domain[0]) / (domain[1] - domain[0]) * size));
        
        // Get the surrounding colors in the LUT
        var r0 = rIndex >= 0 && rIndex < size && gIndex >= 0 && gIndex < size && bIndex >= 0 && bIndex < size ? lutData[rIndex][gIndex][bIndex][0] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex))][0];
        var g0 = rIndex >= 0 && rIndex < size && gIndex >= 0 && gIndex < size && bIndex >= 0 && bIndex < size ? lutData[rIndex][gIndex][bIndex][1] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex))][1];
        var b0 = rIndex >= 0 && rIndex < size && gIndex >= 0 && gIndex < size && bIndex >= 0 && bIndex < size ? lutData[rIndex][gIndex][bIndex][2] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex))][2];
        var r1 = (rIndex + 1) >= 0 && (rIndex + 1) < size && gIndex >= 0 && gIndex < size && bIndex >= 0 && bIndex < size ? lutData[rIndex + 1][gIndex][bIndex][0] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex))][0];
        var g1 = (rIndex + 1) >= 0 && (rIndex + 1) < size && gIndex >= 0 && gIndex < size && bIndex >= 0 && bIndex < size ? lutData[rIndex + 1][gIndex][bIndex][1] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex))][1];
        var b1 = (rIndex + 1) >= 0 && (rIndex + 1) < size && gIndex >= 0 && gIndex < size && bIndex >= 0 && bIndex < size ? lutData[rIndex + 1][gIndex][bIndex][2] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex))][2];
        var r2 = rIndex >= 0 && rIndex < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && bIndex >= 0 && bIndex < size ? lutData[rIndex][gIndex + 1][bIndex][0] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex))][0];
        var g2 = rIndex >= 0 && rIndex < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && bIndex >= 0 && bIndex < size ? lutData[rIndex][gIndex + 1][bIndex][1] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex))][1];
        var b2 = rIndex >= 0 && rIndex < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && bIndex >= 0 && bIndex < size ? lutData[rIndex][gIndex + 1][bIndex][2] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex))][2];
        var r3 = (rIndex + 1) >= 0 && (rIndex + 1) < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && bIndex >= 0 && bIndex < size ? lutData[rIndex + 1][gIndex + 1][bIndex][0] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex))][0];
        var g3 = (rIndex + 1) >= 0 && (rIndex + 1) < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && bIndex >= 0 && bIndex < size ? lutData[rIndex + 1][gIndex + 1][bIndex][1] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex))][1];
        var b3 = (rIndex + 1) >= 0 && (rIndex + 1) < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && bIndex >= 0 && bIndex < size ? lutData[rIndex + 1][gIndex + 1][bIndex][2] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex))][2];
        var r4 = rIndex >= 0 && rIndex < size && gIndex >= 0 && gIndex < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex][gIndex][bIndex + 1][0] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex + 1))][0];
        var g4 = rIndex >= 0 && rIndex < size && gIndex >= 0 && gIndex < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex][gIndex][bIndex + 1][1] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex + 1))][1];
        var b4 = rIndex >= 0 && rIndex < size && gIndex >= 0 && gIndex < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex][gIndex][bIndex + 1][2] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex + 1))][2];
        var r5 = (rIndex + 1) >= 0 && (rIndex + 1) < size && gIndex >= 0 && gIndex < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex + 1][gIndex][bIndex + 1][0] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex + 1))][0];
        var g5 = (rIndex + 1) >= 0 && (rIndex + 1) < size && gIndex >= 0 && gIndex < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex + 1][gIndex][bIndex + 1][1] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex + 1))][1];
        var b5 = (rIndex + 1) >= 0 && (rIndex + 1) < size && gIndex >= 0 && gIndex < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex + 1][gIndex][bIndex + 1][2] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex))][Math.max(0, Math.min(size - 1, bIndex + 1))][2];
        var r6 = rIndex >= 0 && rIndex < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex][gIndex + 1][bIndex + 1][0] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex + 1))][0];
        var g6 = rIndex >= 0 && rIndex < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex][gIndex + 1][bIndex + 1][1] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex + 1))][1];
        var b6 = rIndex >= 0 && rIndex < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex][gIndex + 1][bIndex + 1][2] : lutData[Math.max(0, Math.min(size - 1, rIndex))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex + 1))][2];
        var r7 = (rIndex + 1) >= 0 && (rIndex + 1) < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex + 1][gIndex + 1][bIndex + 1][0] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex + 1))][0];
        var g7 = (rIndex + 1) >= 0 && (rIndex + 1) < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex + 1][gIndex + 1][bIndex + 1][1] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex + 1))][1];
        var b7 = (rIndex + 1) >= 0 && (rIndex + 1) < size && (gIndex + 1) >= 0 && (gIndex + 1) < size && (bIndex + 1) >= 0 && (bIndex + 1) < size ? lutData[rIndex + 1][gIndex + 1][bIndex + 1][2] : lutData[Math.max(0, Math.min(size - 1, rIndex + 1))][Math.max(0, Math.min(size - 1, gIndex + 1))][Math.max(0, Math.min(size - 1, bIndex + 1))][2];


        // Calculate the interpolation factors
        var t = (r - domain[0]) / (domain[1] - domain[0]) * size - rIndex;
        var u = (g - domain[0]) / (domain[1] - domain[0]) * size - gIndex;
        var v = (b - domain[0]) / (domain[1] - domain[0]) * size - bIndex;

        // Interpolate the RGB values
        var rInterp = (1 - t) * (1 - u) * (1 - v) * r0 + t * (1 - u) * (1 - v) * r1 + (1 - t) * u * (1 - v) * r2 + t * u * (1 - v) * r3 + (1 - t) * (1 - u) * v * r4 + t * (1 - u) * v * r5 + (1 - t) * u * v * r6 + t * u * v * r7;
        var gInterp = (1 - t) * (1 - u) * (1 - v) * g0 + t * (1 - u) * (1 - v) * g1 + (1 - t) * u * (1 - v) * g2 + t * u * (1 - v) * g3 + (1 - t) * (1 - u) * v * g4 + t * (1 - u) * v * g5 + (1 - t) * u * v * g6 + t * u * v * g7;
        var bInterp = (1 - t) * (1 - u) * (1 - v) * b0 + t * (1 - u) * (1 - v) * b1 + (1 - t) * u * (1 - v) * b2 + t * u * (1 - v) * b3 + (1 - t) * (1 - u) * v * b4 + t * (1 - u) * v * b5 + (1 - t) * u * v * b6 + t * u * v * b7;

        // Update the image data with the interpolated values
        data[i] = Math.round(rInterp * 255);
        data[i + 1] = Math.round(gInterp * 255);
        data[i + 2] = Math.round(bInterp * 255);

    }

}
