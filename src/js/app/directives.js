/* Directives */

angular.module('heathRobinson').
  directive( 'tape', function(converters, settings) {

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
      var bits = converters.char2bits(ttyChar);
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
        loopCounter: '=',
        reset: '=',
        tapeObject: '='
      },

      link: function(scope, elem, attrs, controller) {

        // register this tape on the bedstead
        controller.addTape(elem[0].id);

        scope.loopCounter = 0;

        var loopHandler = function() {
          scope.$apply();
          scope.tapeObject.loopStart();
          scope.loopCounter++;
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

          scope.tapeObject.len = value.length;
          scope.tapeObject.startPosition = value.length - 2;
          scope.tapeObject.charPosition = scope.tapeObject.startPosition;

          elem.css('background-image', 'url(' + canvas.toDataURL('image/png') + ')');

        });

        scope.$watch('reset', function(value) {
          scope.loopCounter = 0;
          scope.tapeObject.charPosition = scope.tapeObject.startPosition;
        });

      }
    };
  }).
  directive('bedstead', function(settings, $interpolate) {

    // We can reuse angular functionality to create CSS templates
    var durationTemplate      = $interpolate('#{{id}} {-webkit-animation-duration:{{tapePeriod}}ms;' +
                                             'animation-duration:{{tapePeriod}}ms;}'),

        animationNameTemplate = $interpolate('#{{id}} {-webkit-animation-name:{{name}};animation-name:{{name}};}'),

        keyframesTemplate     = $interpolate('@-webkit-keyframes {{id}}{from {background-position: 0 180px;}' +
                                             'to {background-position: 0 -{{tapeLength - 180}}px;}}' +
                                             '@keyframes {{id}}{from {background-position: 0 180px;}' +
                                              'to {background-position: 0 -{{tapeLength - 180}}px;}}');

    return {
      restrict: 'A',

      controller: function($scope, $element, $attrs) {

        $scope.speeds = [
          {
            description: 'Really Slow (0.5 chars/sec)',
            speed: 2000
          },
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
  }).
  directive('photocell', function(converters) {

    return {
      restrict: 'A',
      scope: {
        ttydata: '=',
        position: '=',
        title: '@'
      },
      template: '<h2 style="margin-left:0">{{title}}</h2>' +
                '<div class="line" style="margin-top: 4px">{{line1}}</div>' +
                '<div class="line">{{line2}}</div>',
      link: function(scope, elem, attrs) {

        var printableChars = converters.char2print(scope.ttydata);

        scope.$watch('position', function(value) {
          var lastIndex = printableChars.length - 1;
          scope.line1 = printableChars[scope.position];
          scope.line2 = scope.position === lastIndex ? printableChars[0] : printableChars[scope.position + 1];
        });
      }
    };
  });