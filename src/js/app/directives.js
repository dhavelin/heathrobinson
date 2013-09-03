/* Directives */

angular.module('heathRobinson').
  directive( 'tape', function(tty2bits, settings) {

    // Add a canvas element off-screen for creating punched tapes on
    var bodyElement = angular.element(document.body);
    var canvasElement = angular.element('<canvas/>').attr('width', settings.tapeWidth.toString());
    bodyElement.append(canvasElement);

    function drawCircle(xPos, yPos, radius, context) {
      context.beginPath();
      context.arc(xPos, yPos, radius, 0, 2 * Math.PI, false);
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = 'black';
      context.fill();
    }

    function drawTape(height, context) {

      // Draw the tape background
      context.beginPath();
      context.rect(0, 0, settings.tapeWidth, height);
      context.fillStyle = '#eee';
      context.fill();

      // Draw a red line to mark the start of the tape
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = 'red';
      context.moveTo(0, 0.5);
      context.lineTo(settings.tapeWidth, 0.5);
      context.stroke();

    }

    // Draw a group of holes that represents a particular TTY character
    function punchChar(ttyChar, yPos, context) {
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

    function punchTape(sequence, context) {
      for (var i = 0; i < sequence.length; i++) {
        yPos = (20 * i) + 10;
        punchChar(sequence[i], yPos, context);
      }
    }

    return {
      restrict: 'A',

      require: '^bedstead',

      scope: {
        ttydata: '=',
        loopCallback: '=',
        loopCounter: '=',
        reset: '='
      },

      link: function(scope, elem, attrs, controller) {

        // register this tape on the bedstead
        controller.addTape( elem[0].id );

        var loopHandler = function() {
          scope.loopCounter++;
          scope.$apply();
          scope.loopCallback();
        };

        elem.bind('webkitAnimationStart',     loopHandler);
        elem.bind('webkitAnimationIteration', loopHandler);
        elem.bind('animationstart',           loopHandler);
        elem.bind('animationiteration',       loopHandler);

        scope.$watch('ttydata', function(value) {

          controller.setTapeLength(elem[0].id, value.length);

          var tapeLength = (value.length + settings.tapeGap) * 20;
          var canvas = canvasElement[0];
          var context = canvas.getContext('2d');

          canvas.height = tapeLength;

          // Draw blank tape
          drawTape(tapeLength, context);

          // Punch the tape
          punchTape(value, context);

          elem.css('background-image', 'url(' + canvas.toDataURL('image/png') + ')');

        });

        scope.$watch('reset', function(value) {
          scope.loopCounter = 0;
        });

      }
    };
  }).
  directive('bedstead', function(settings, $interpolate) {

    // We can reuse angular functionality to create CSS templates
    var durationTemplate      = $interpolate('#{{id}} {-webkit-animation-duration:{{tapePeriod}}ms;' +
                                             'animation-duration:{{tapePeriod}}ms;}'),

        animationNameTemplate = $interpolate('#{{id}} {-webkit-animation-name:{{name}};animation-name:{{name}};}'),

        keyframesTemplate     = $interpolate('@-webkit-keyframes {{id}}{from {background-position: 0 0;}' +
                                             'to {background-position: 0 -{{tapeLength}}px;}}' +
                                             '@keyframes {{id}}{from {background-position: 0 0;}' +
                                              'to {background-position: 0 -{{tapeLength}}px;}}');

    return {
      restrict: 'A',

      controller: function($scope, $element, $attrs) {

        $scope.speeds = [
          {
            description: 'Slow (4 chars/sec)',
            speed: 250
          },
          {
            description: 'Faster (8 chars/sec)',
            speed: 125
          },
          {
            description: 'Actual (1000 chars / sec)',
            speed: 1
          }
        ];
        $scope.tapeSpeed = $scope.speeds[1]; // Faster

        $scope.tapes = {};

        this.addTape = function(id) {
          $scope.tapes[id] = {
            len: {
              chars: 0,
              pixels: 0
            }
           };
        };

        this.setTapeLength = function(id, len) {
          $scope.tapes[id].len.chars = len;
          $scope.tapes[id].len.pixels = (len + settings.tapeGap) * 20;
          this.setKeyframesStyle();
          this.setDurationStyle();
        };

        this.setDurationStyle = function() {

          var styles = '';
          var tapePeriod;

          for (var id in $scope.tapes) {
            if ($scope.tapes.hasOwnProperty(id)) {
              tapePeriod = ($scope.tapes[id].len.chars + settings.tapeGap) * $scope.tapeSpeed.speed;
              styles += durationTemplate({
                id: id,
                tapePeriod: tapePeriod
              });
            }
          }
          $scope.duration = styles;
        };

        this.setAnimationNameStyle = function(reset) {
          var styles = '';

          for (var id in $scope.tapes) {
            if ($scope.tapes.hasOwnProperty(id)) {
              styles += animationNameTemplate({
                id: id,
                name: reset ? 'none' : id
              });
            }
          }
          $scope.animationName = styles;
        };

        this.setKeyframesStyle = function() {
          var styles = '';

          for (var id in $scope.tapes) {
            if ($scope.tapes.hasOwnProperty(id)) {
              styles += keyframesTemplate({
                id: id,
                tapeLength: $scope.tapes[id].len.pixels
              });
            }
          }
          $scope.keyframes = styles;
        };
      },

      link: function(scope, elem, attrs, controller) {

        scope.$watch('tapeSpeed', function(value) {
          controller.setDurationStyle();
        });

        scope.$watch('tapeReset', function(value) {
          controller.setAnimationNameStyle(value);
        });
      }
    };
  });