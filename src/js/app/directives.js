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
        punchChar(sequence.charAt(i), yPos, context);
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
        scope.tapeObject.position = {};

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
          scope.tapeObject.position = {
            start: value.length - 1,
            previous: value.length - 2,
            current: value.length - 1
          };

          elem.css('background-image', 'url(' + canvas.toDataURL('image/png') + ')');

        });

        scope.$on('tapeReset', function() {
          scope.loopCounter = 0;
          scope.tapeObject.position.current = scope.tapeObject.position.start;
          scope.tapeObject.position.previous = scope.tapeObject.position.current - 1;
          elem[0].style.backgroundPosition = '';
        });

        scope.$on('tapeStop', function() {
          var stopPosition = -20 * (scope.tapeObject.position.current + 1) + 180;
          elem[0].style.backgroundPosition = '0 ' + stopPosition + 'px';
        });

        scope.$on('tapeAdvanced', function() {
          scope.tapeObject.position.previous = scope.tapeObject.position.current;
          if (scope.tapeObject.position.current === scope.tapeObject.len - 1) {
            scope.tapeObject.position.current = 0;
          } else {
            scope.tapeObject.position.current++;
          }

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
            description: 'Slow (4 chars/sec)',
            speed: 250
          },
          {
            description: 'Medium (8 chars/sec)',
            speed: 125
          },
          {
            description: 'Fast (10 chars / sec)',
            speed: 100
          },
          {
            description: ' Very Fast (50 chars / sec)',
            speed: 20
          }
        ];
        $scope.tapeSpeed = $scope.speeds[1];

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

        this.setAnimationNameStyle = function(on) {

          var styles = '';

          for (var id in $scope.tapes) {
            if ($scope.tapes.hasOwnProperty(id)) {
              styles += animationNameTemplate({
                id: id,
                name: on ? id : 'none'
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

        scope.$on('tapeStart', function() {
          controller.setAnimationNameStyle(true);
        });

        scope.$on('tapeReset', function() {
          controller.setAnimationNameStyle(false);
        });

        scope.$on('tapeStop', function() {
          controller.setAnimationNameStyle(false);
        });

      }
    };
  }).

  directive('photocell', function(converters) {

    return {
      restrict: 'A',
      scope: {
        ttydata: '=',
        position: '='
      },
      template: '<span>{{character.previous}}<br>{{character.current}}</span>',
      link: function(scope, elem, attrs) {
        var printableChars = converters.char2print(scope.ttydata);


        scope.$watch('position', function(value) {
          scope.character = {
            current: printableChars[scope.position.current],
            previous: printableChars[scope.position.previous]
          };
        }, true);

        scope.$watch('ttydata', function(value) {
          printableChars = converters.char2print(scope.ttydata);
          scope.character = {
            current: printableChars[scope.position.current],
            previous: printableChars[scope.position.previous]
          };
        });
      }
    };
  }).

  directive('score', function($filter) {

    return {
      restrict: 'A',

      link: function(scope, elem, attrs) {

        var zeropad = function(n) {
          return '0000'.substring(0, 5 - n.length) + n;
        };

        var score = 0;

        elem.text($filter('zeropad')(score));

        scope.$on('tapeAdvanced', function() {

          // We want this to execute after updates to the data the score depends on
          scope.$evalAsync(function() {

            // We are XOR'ing the two least significant bits of the current and previous chars on each tape. We increment the loop
            // score when this equals 0. A spike in this value means we might have found the wheel settings.
            var deltaTape1 = scope.tape1.sequence[scope.tape1.position.current] ^ scope.tape1.sequence[scope.tape1.position.previous];
            var deltaTape2 = scope.tape2.sequence[scope.tape2.position.current] ^ scope.tape2.sequence[scope.tape2.position.previous];
            var deltaCombined = deltaTape1 ^ deltaTape2;
            var bit0 = deltaCombined & 1;
            var bit1 = (deltaCombined >> 1) & 1;
            var result = bit0 ^ bit1;

            scope.logicOutput = result ? 'X' : '\u2022';

            if (result === 0) {
              elem.text($filter('zeropad')(++score));
            }

          });

        });

        scope.$on('tapeReset', function() {
          score = 0;
          elem.text($filter('zeropad')(score));
        });

        scope.$on('loopRestart', function() {

          scope.printout.loop += scope.tape2.loopCounter + '\n';
          scope.printout.score += score + '\n';

          score = 0;
          elem.text($filter('zeropad')(score));
        });
      }
    };
  }).

  directive('tapeInput', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {

        function filter(inputValue) {

          var filtered;

          if (inputValue) {

            // Only capital letters are valid
            filtered = inputValue.toUpperCase();

            // If there are invalid chars, delete them
            if (!filtered.match('^[A-Z3489+/]+$')) {
              filtered = filtered.replace(/[^A-Z3489+\/]/g, '');
            }

            // If we changed something, update the view
            if (filtered !== inputValue) {
              ngModel.$setViewValue(filtered);
              ngModel.$render();
            }
            return filtered;
          }
          return inputValue;
        }
        ngModel.$parsers.push(filter);
        filter(scope[attrs.ngModel]);  // filter initial value
      }
    };
  });
