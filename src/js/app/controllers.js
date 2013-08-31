/* Controllers */

angular.module('heathRobinson')
  .controller('machine', function($scope, settings) {

    var tapeGap = 0;

    var getDurationStyles = function(id, length, charduration) {
      // charduration is the time (ms) for the tape to move one character

      var tapePeriod = (length + settings.tapeGap) * charduration;
      return "#" + id + " {-webkit-animation-duration:" + tapePeriod + "ms;" +
                        " animation-duration:" + tapePeriod + "ms;" +
                        "}";
    };

    var getKeyFrames = function(id, length) {

      var tapeLength = (length + settings.tapeGap) * 20;

      var keyframes = '';
      var prefixes = ['-webkit-', ''];
      for(var i = 0; i < prefixes.length; i++) {
        keyframes += "@" + prefixes[i] + "keyframes " + id + "{" +
                     "from {background-position: 0 0;}" +
                     "to {background-position: 0 -" + tapeLength + "px;}}";      
      }
      return keyframes;
    };

    var setKeyFrames = function() {
      $scope.keyframes = getKeyFrames('tape1', $scope.tape1.len) +
                         getKeyFrames('tape2', $scope.tape2.len);
    };

    var setDurations = function() {
      var charduration = 1000 / $scope.tapeSpeed.speed;
      $scope.durations = getDurationStyles('tape1', $scope.tape1.len, charduration) +
                         getDurationStyles('tape2', $scope.tape2.len, charduration);
    };

    var setAnimationNames = function(on) {
      if (on) {
        $scope.animationNames = "#tape1{-webkit-animation-name:tape1;animation-name:tape1;}" +
                                "#tape2{-webkit-animation-name:tape2;animation-name:tape2;}";
      } else {
        $scope.animationNames = "#tape1{-webkit-animation-name:none;animation-name:none;}" +
                                "#tape2{-webkit-animation-name:none;animation-name:none;}";
      }
    };

    $scope.tape1 = {};
    $scope.tape2 = {};
    var tape1 = {id: 'tape1'};
    var tape2 = {id: 'tape2'};

    $scope.tape1.sequence = [
      25, 9, 18, 26, 5, 3, 12, 13, 25, 30,
      20, 1, 16, 12, 19, 9, 15, 12, 3, 6,
      18, 8, 9, 25, 15, 28, 26, 31, 31, 8,
      14, 26, 20, 19, 18, 19, 19, 26, 27, 29,
      31, 6, 8, 10, 10, 4, 8, 5, 14, 23,
      18, 27, 1, 11, 25, 31, 19, 16, 22, 10,
      1, 26, 21, 20, 1, 20, 7, 9, 18, 16,
      3, 12, 19, 7, 5, 18, 22, 20, 12, 4,
      29, 22, 29, 20, 1, 26, 25, 9, 2, 27,
      20, 28, 20, 11, 8, 23, 28, 9, 29, 1, 10
    ];
    $scope.tape1.len = $scope.tape1.sequence.length;

    $scope.tape2.sequence = [
      11, 30, 14, 21, 15, 22, 14, 8, 30, 14,
      20, 23, 2, 19, 5, 24, 20, 2, 1, 12,
      13, 21, 29, 1, 12, 17, 31, 22, 14, 7,
      18, 19, 8, 21, 29, 22, 6, 28, 4, 2,
      24, 1, 15, 16, 3, 27, 15, 30, 2, 16,
      29, 21, 20, 5, 7, 31, 14, 25, 1, 23,
      28, 8, 11, 13, 26, 17, 19, 4, 31, 16,
      13, 25, 28, 28, 27, 8, 24, 11, 17, 16,
      3, 29, 4, 28, 19, 18, 30, 21, 8, 29,
      26, 4, 26, 24, 18, 21, 23, 11, 14, 15
    ];
    $scope.tape2.len = $scope.tape2.sequence.length;

    $scope.tape1.counter = 0;
    $scope.tape2.counter = 0;
    $scope.score = 0;

    var charInterval;
    var charCounter = 0;

    var newChar = function() {
      $scope.score++;
      $scope.$apply();
      /**
      if ($scope.score > $scope.tape1.len) {
        clearInterval(charInterval);
      }
      **/
    };

    tape1.loopStart = function(e) {
      $scope.score = 0;
      $scope.tape1.counter++;
      $scope.$apply();
    };

    tape2.loopStart = function(e) {
      clearInterval(charInterval);
      $scope.score = 0;
      $scope.tape2.counter++;
      $scope.$apply();
      charInterval = setInterval(newChar, 125);
    };

    var animationListenerSetup = function(tape) {
      var e = document.getElementById(tape.id);
      e.addEventListener("webkitAnimationStart", tape.loopStart, false);
      e.addEventListener("webkitAnimationIteration", tape.loopStart, false);

      e.addEventListener("animationstart", tape.loopStart, false);
      e.addEventListener("animationiteration", tape.loopStart, false);
    };

    $scope.togglePlaystate = function() {
      if ($scope.tapeReset) {
        setAnimationNames(true);
        $scope.tapeRunning = true;
        $scope.tapeReset = false;
      } else if ($scope.tapeRunning) {
        $scope.tapeRunning = false;
        clearInterval(charInterval);
      }
    };

    $scope.resetTapes = function () {
      $scope.tapeRunning = false;
      $scope.tapeReset = true;
      setAnimationNames(false);
      clearInterval(charInterval);
      $scope.tape1.counter = 0;
      $scope.tape2.counter = 0;
    };

    $scope.$watch('tapeSpeed', function() {
      $scope.resetTapes();
      setDurations();}
    );

    $scope.speeds = [
      {description:'Slow (4 chars/sec)', speed: 4},
      {description:'Faster (8 chars/sec)', speed: 8},
      {description:'Actual (1000 chars / sec)', speed: 1000}
    ];
    $scope.tapeRunning = false;
    $scope.tapeReset = true;
    $scope.tapeSpeed = $scope.speeds[1]; // Faster
    animationListenerSetup(tape1);
    animationListenerSetup(tape2);
    setKeyFrames();
    setAnimationNames(true);
  });