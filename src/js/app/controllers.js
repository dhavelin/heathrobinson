/* Controllers */

angular.module('heathRobinson')
  .controller('machine', function($scope, settings, initialData, converters) {

    var charTimer;

    $scope.tape1 = {
      sequence: initialData.cipher,
      loopStart: function() {}
    };

    $scope.tape2 = {
      sequence: initialData.key,
      loopStart: function() {
        clearInterval(charTimer);
        if ($scope.tape2.loopCounter > 0) {
          while ($scope.tape2.charPosition < $scope.tape2.startPosition) {
            tapeAdvanced();
          }
        }
        $scope.score = 0;
        $scope.$apply();
        charTimer = setInterval(tapeAdvanced, $scope.tapeSpeed.speed);
      }
    };

    $scope.score = 0;

    $scope.togglePlaystate = function() {
      if ($scope.tapeRunning) {

        // tape is running so stop it
        $scope.tapeRunning = false;
        clearInterval(charTimer);

      } else {

        // either the tape is stopped mid-run, or it's at the start position, ready to play
        if ($scope.tapeReset) {
          $scope.tapeRunning = true;
          $scope.tapeReset = false;
        }

      }
    };

    $scope.resetTapes = function () {
      $scope.score = 0;
      $scope.tapeRunning = false;
      $scope.tapeReset = true;
      clearInterval(charTimer);
    };

    $scope.$watch('tapeSpeed', function() {
      $scope.resetTapes();
    });

    $scope.tapeRunning = false;
    $scope.tapeReset = false;

    /**
     *
     */
    function tapeAdvanced() {
      $scope.score++;
      if ($scope.tape1.charPosition === $scope.tape1.len - 1) {
        $scope.tape1.charPosition = 0;
      } else {
        $scope.tape1.charPosition++;
      }
      if ($scope.tape2.charPosition === $scope.tape2.len - 1) {
        $scope.tape2.charPosition = 0;
      } else {
        $scope.tape2.charPosition++;
      }
      $scope.$apply();
    }

  });