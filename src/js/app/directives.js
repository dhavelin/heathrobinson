/* Directives */

angular.module('heathRobinson').
  directive('tape', function(tty2bits, settings) {

    // Add a canvas element off-screen for creating punched tapes on
    var bodyElement = angular.element(document.body);
    var canvasElement = angular.element("<canvas/>").attr("width", "121");
    bodyElement.append(canvasElement);

    var drawCircle = function(xPos, yPos, radius, context) {
      context.beginPath();
      context.arc(xPos, yPos, radius, 0, 2 * Math.PI, false);
      context.globalCompositeOperation="destination-out";
      context.fillStyle = 'black';
      context.fill();
    }

    var drawTape = function(height, context) {

      // Draw the tape background
      context.beginPath();
      context.rect(0, 0, 121, height);
      context.fillStyle = '#eee';
      context.fill();

      // Draw a red line to mark the start of the tape
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = 'red';
      context.moveTo(0,0.5);
      context.lineTo(121, 0.5);
      context.stroke();

    }

    // Draw a group of holes that represents a particular TTY character
    var punchChar = function(ttyChar, yPos, context) {
      var bits = tty2bits.convert(ttyChar);
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

    return {
      restrict: 'A',
      scope: {
        ttydata: '='
      },

      link: function(scope, elem, attrs) {

        scope.$watch('ttydata', function(value) {

          var tapeLength = (value.length + settings.tapeGap) * 20;
          var canvas = canvasElement[0];
          var context = canvas.getContext('2d');

          canvas.height = tapeLength;

          // Draw blank tape
          drawTape(tapeLength, context);

          // Punch the tape
          punchTape(value, context);

          elem.css('background-image', 'url(' + canvas.toDataURL("image/png") + ')');

        });
        
      }
    };
  });
