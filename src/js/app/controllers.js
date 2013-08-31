/* Controllers */

angular.module('heathRobinson')
  .controller('machine', function($scope, settings, initialData) {

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

    $scope.tape1.sequence = initialData.cipher;
    $scope.tape1.len = $scope.tape1.sequence.length;

    $scope.tape2.sequence = initialData.key;
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