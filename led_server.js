/*
 * Liam McFalls
*/
//var gpio = require("pi-gpio");
var sys = require('sys');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

function puts(error, stdout, stderr) {}

var express = require('express');
var app = express();
var http = require("http").Server(app);
var bodyParser = require("body-parser");
app.use(bodyParser.json());

var schedule = require('node-schedule');
var nightFadeSchedule = schedule.scheduleJob('0 23 * * 0-4', function() {nightFade();});

var PORT = 24173;

var RED_PIN=4;
var GREEN_PIN=17;
var BLUE_PIN=18;

var party = 0;

var r = 0.0;
var g = 0.0;
var b = 0.0;

var bright = 8;
var maxBright = 8;

setRed(r);
setBlue(b);
setGreen(g);

var fadeTime = 0.5; //The time in seconds it takes the lights transition colors
var fadeDivs = 50; //The number of steps to take between colors
var nightProg = 0; //a number from 0 to 20 indicating the current progress in fading to the night color
var nightFadeDivs = 20; //The number of steps to take when fading to the night color over the course of an hour
var doNightFade = true;
var nightColor = {'r':200, 'g':0, 'b':0};

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/setcolor", function(req, res) {
    console.log("Fading lights to: " + req.body.r + " " +  req.body.g + " " + req.body.b);
    res.send("Lights changed!");
    fadeTo(req.body.r, req.body.g, req.body.b);
});

app.post("/brightnessdown", function(req, res) {
    bright -= 1;
    if (bright < 0) bright = 0;
    res.send("Lights changed!");
    fadeTo(r,g,b);
});

app.post("/brightnessup", function(req, res) {
    bright += 1;
    if (bright > maxBright) bright=maxBright;
    res.send("Lights changed!");
    fadeTo(r,g,b);
});

app.post("/toggle_party", function(req, res) {
    console.log("Toggling party mode! t=" + req.body.t + " divs=" + req.body.divs);
    if (party == 0) {
        party = spawn('python3',["/home/pi/led-interface/lights.py","party", req.body.t, req.body.divs]);
    } else {
        killParty();
    }
});

function killParty() {
    if (party != 0) {
        party.stdin.pause();
        party.kill();
        party = 0;
        fadeTo(r,g,b);
    }
}

function fadeTo(tr,tg,tb) {
    if (tr > 255) tr = 255;
    if (tr < 0) tr = 0;
    if (tg > 255) tg = 255;
    if (tg < 0) tg = 0;
    if (tb > 255) tb = 255;
    if (tb < 0) tb = 0;

    tr *= bright/maxBright;
    tg *= bright/maxBright;
    tb *= bright/maxBright;

    tr = parseInt(tr);
    tg = parseInt(tg);
    tb = parseInt(tb);

    spawn('python3',["/home/pi/led-interface/lights.py","fade",r,g,b,tr,tg,tb,fadeTime,fadeDivs]);
    r = tr;
    g = tg;
    b = tb;
}

function nightFade() {
    if (!doNightFade) return;
    nightProg++;
    console.log("Night Fade step " + nightProg);
    tr = parseInt((nightColor.r - r)*nightProg/nightFadeDivs);
    tg = parseInt((nightColor.g - g)*nightProg/nightFadeDivs);
    tb = parseInt((nightColor.b - b)*nightProg/nightFadeDivs);
    fadeTo(tr,tg,tb);
    if (nightProg < nightFadeDivs)
        setTimeout(nightFade, 3600000/nightFadeDivs);
    else
        nightProg = 0
}

function setRedTime(val, time) {
    setTimeout(function() {setRed(val);}, time);
}

function setGreenTime(val, time) {
    setTimeout(function() {setGreen(val);}, time);
}

function setBlueTime(val, time) {
    setTimeout(function() {setBlue(val);}, time);
}

function setRed(val) {
    exec("pigs p " + RED_PIN + " " + val, puts);
    r = val;
    /*gpio.open(RED_PIN, "output", function(err) {
        gpio.write(RED_PIN, val, function() {
            gpio.close(RED_PIN);
        });
    });*/
}
function setGreen(val) {
    exec("pigs p " + GREEN_PIN + " " + val, puts);
    g = val;
    /*gpio.open(GREEN_PIN, "output", function(err) {
        gpio.write(GREEN_PIN, val, function() {
            gpio.close(GREEN_PIN);
        });
    });*/
}
function setBlue(val) {
    exec("pigs p " + BLUE_PIN + " " + val, puts);
    b = val;
    /*gpio.open(BLUE_PIN, "output", function(err) {
        gpio.write(BLUE_PIN, val, function() {
            gpio.close(BLUE_PIN);
        });
    });*/
}

http.listen(PORT, function() {
    console.log("Listening on *:" + PORT);
});
