/* Controllers */

angular.module('heathRobinson')
  .controller('machine', function($scope, settings, initialData) {

    var charTimer;

    $scope.enablePlay = true;
    $scope.tapeRunning = false;

    $scope.printout = {
      loop: '',
      score: ''
    };

    $scope.tape1 = {
      sequence: initialData.cipher,
      loopStart: function() {}
    };

    //var lastTime = 0;

    $scope.tape2 = {
      sequence: initialData.key,
      loopStart: function() {

        /**

        var timeNow = Date.now();

        console.log(timeNow - lastTime);
        lastTime = timeNow;
        **/

        clearInterval(charTimer);
        if ($scope.tape2.loopCounter > 0) {

          // There are two timers - the outer one fires every time the tape reaches the start position,
          // the inner one fires at regular intervals corresponding to the tape advancing one character.
          // In case these loops lose sync, fire all outstanding inner events just before outer restarts.
          while ($scope.tape2.position.current < $scope.tape2.position.start) {
            tapeAdvanced();
          }

          $scope.$broadcast('loopRestart');
        }
        charTimer = setInterval(tapeAdvanced, $scope.tapeSpeed.speed);
      }
    };

    // Set tapes running if not yet started, or stop if already running
    $scope.togglePlaystate = function() {
      if ($scope.tapeRunning) {
        clearInterval(charTimer);
        $scope.tapeRunning = false;
        $scope.$broadcast('tapeStop');
      } else {
        if ($scope.enablePlay) {
          tapeStarted = true;
          $scope.enablePlay = false;
          $scope.tapeRunning = true;
          $scope.$broadcast('tapeStart');
        }
      }
    };

    // Function that resets machine to start position
    $scope.resetTapes = function () {
      $scope.tapeRunning = false;
      $scope.enablePlay = true;
      $scope.printout = {
        loop: '',
        score: ''
      };
      $scope.$broadcast('tapeReset');
      clearInterval(charTimer);
    };

    // When tape speed is changed, set tapes to start position
    $scope.$watch('tapeSpeed', function() {
      $scope.resetTapes();
    });

    // Emit an event when the tapes have advanced by one character
    function tapeAdvanced() {

      // It would be nice to push this down to the tape directive but it's
      // important that both tapes get updated before the score is updated

      $scope.tape1.position.previous = $scope.tape1.position.current;
      if ($scope.tape1.position.current === $scope.tape1.len - 1) {
        $scope.tape1.position.current = 0;
      } else {
        $scope.tape1.position.current++;
      }

      $scope.tape2.position.previous = $scope.tape2.position.current;
      if ($scope.tape2.position.current === $scope.tape2.len - 1) {
        $scope.tape2.position.current = 0;
      } else {
        $scope.tape2.position.current++;
      }

      $scope.$apply();
      $scope.$broadcast('tapeAdvanced');
    }

  });