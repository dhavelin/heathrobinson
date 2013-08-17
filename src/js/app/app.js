


/**
// Turn a TTY character (0-31) into a bit array of booleans
var arrayFromTtyChar = function(ttyChar) {
  if (ttyChar > 31 || ttyChar < 0) {
    throw new TypeError("arrayFromTtyChar - Teletype character is out of range");
  }
  for (var cShifted = ttyChar, aFromChar = []; cShifted; aFromChar.push(Boolean(cShifted & 1)), cShifted >>>= 1);
  return aFromChar;
}

var drawCircle = function(xPos, yPos, radius, context) {
  context.beginPath();
  context.arc(xPos, yPos, radius, 0, 2 * Math.PI, false);
  context.globalCompositeOperation="destination-out";
  context.fillStyle = 'black';
  context.fill();
}

var drawTape = function(height, context) {
  context.beginPath();
  context.rect(0, 0, 121, height);
  context.fillStyle = '#eee';
  context.fill();
  context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = 'red';
  context.moveTo(0,0.5);
  context.lineTo(121, 0.5);
  context.stroke();
}

// Draw a group of holes that represents a particular TTY character
var punchChar = function(ttyChar, yPos, context) {
  var bits = arrayFromTtyChar(ttyChar);
  // First hole is 18 from edge
  var xOffset = 18;
  var xPos;

  for(var n = 0; n < 5; n++) {
    if (bits[n]) {
      xPos = n * 17 + xOffset;
      // allow for sprocket hole
      if (n > 2) {
        xPos = xPos + 15;
      }
      drawCircle(xPos, yPos, 6, context);
    }
  }

  // draw sprocket hole
  drawCircle(50 + xOffset, yPos, 3.5, context);
}

var punchTape = function(sequence, context) {
  for (var i = 0; i < sequence.length; i++) {
    yPos = (20 * i) + 10;
    punchChar(sequence[i], yPos, context);
  }
}

var getDurationStyles = function(id, duration) {
  return "#" + id + " {-webkit-animation-duration:" + duration + "ms;" +
                    " -moz-animation-duration:" + duration + "ms;" +
                    " animation-duration:" + duration + "ms;}";
}

var getKeyFrames = function(id, length) {

  var keyframes = '';
  var prefixes = ['-webkit-', '-moz-', ''];
  for(var i = 0; i < prefixes.length; i++) {
    keyframes += "@" + prefixes[i] + "keyframes " + id + "{" +
                 "from {background-position: 0 0;}" +
                 "to {background-position: 0 -" + length + "px;}}";
  }
  return keyframes;
}

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var sequence1 = [
  25, 9, 18, 26, 5, 3, 12, 13, 25, 30,
  20, 1, 16, 12, 19, 9, 15, 12, 3, 6,
  18, 8, 9, 25, 15, 28, 26, 31, 31, 8,
  14, 26, 20, 19, 18, 19, 19, 26, 27, 29,
  31, 6, 8, 10, 10, 4, 8, 5, 14, 23,
  18, 27, 1, 11, 25, 31, 19, 16, 22, 10,
  1, 26, 21, 20, 1, 20, 7, 9, 18, 16,
  3, 12, 19, 7, 5, 18, 22, 20, 12, 4,
  29, 22, 29, 20, 1, 26, 25, 9, 2, 27,
  20, 28, 20, 11, 8, 23, 28, 9, 29, 1
];

var sequence2 = [
  11, 30, 14, 21, 15, 22, 14, 8, 30, 14,
  20, 23, 2, 19, 5, 24, 20, 2, 1, 12,
  13, 21, 29, 1, 12, 17, 31, 22, 14, 7,
  18, 19, 8, 21, 29, 22, 6, 28, 4, 2,
  24, 1, 15, 16, 3, 27, 15, 30, 2, 16,
  29, 21, 20, 5, 7, 31, 14, 25, 1, 23,
  28, 8, 11, 13, 26, 17, 19, 4, 31, 16,
  13, 25, 28, 28, 27, 8, 24, 11, 17, 16,
  3, 29, 4, 28, 19, 18, 30, 21, 8, 29,
  26, 4, 26, 24, 18, 21, 23
];

var tapeLength = sequence1.length * 20;

var tape1xPos = 0;
var tape2xPos = 150;

var animation;

canvas.height = tapeLength;

// Draw blank tape
drawTape(tapeLength, context);

// Punch the tape
punchTape(sequence1, context);

var durationStyles = getDurationStyles('tape1', tapeLength * 125);
var keyframeStyles = getKeyFrames('tape1', tapeLength * 20);

// convert canvas to image and set it as background on #tapes
document.getElementById('tape1').style.backgroundImage = 'url(' + canvas.toDataURL("image/png") + ')';

// Do the same for tape 2

tapeLength = sequence2.length * 20;

canvas.width = 121;
canvas.height = tapeLength;
drawTape(tapeLength, context);
punchTape(sequence2, context);

document.getElementById('tape2').style.backgroundImage = 'url(' + canvas.toDataURL("image/png") + ')';

durationStyles += getDurationStyles('tape2', tapeLength * 125);
keyframeStyles += getKeyFrames('tape2', tapeLength * 20);
document.getElementById("duration").textContent = durationStyles + keyframeStyles;
**/

// Declare app level module
angular.module('heathRobinson', []);