# ddf-lut-comparison
A little app to compare luts in nodejs

I wrote this to compare all the film profile & print looks in Dehancer as it was impossible to pick from 126 combinations using their dropdown lists

Luckily they had a feature to export the look as a LUT so I automated exporting every single profile with the two kodak and fuji print settings

This app puts one lut up against another and you keep picking your favourite of the two until you get down to the remaining winner

I haven't included the LUTs (cube files) because they are not mine to share, but if you populate the LUTs folder and then run generatelutsjson.js it will create the json file with all the lut file names as an array

Run switchboard.js and then navigate to localhost:4015 to start your comparison.

You will need to install express using npm i express

You can cange the image file name at the top of luts.js

I only made this to work with the LUTs exported from Dehancer, the parser will probably fail using other LUTs that may have different internal layouts. The parser was not built to do anymore than look at this specific set of LUTs.

The applyLut function is cool though, as far as I can tell it does a good job of putting a LUT over an image in a canvas.

This was written to help me with a YouTube video - https://youtu.be/UVIsLfvy-gw

Feel free to improve it or take anything useful.

DDF
