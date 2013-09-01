/* Controllers */

angular.module('heathRobinson')
  .controller('machine', function($scope, settings, initialData) {

    $scope.tape1 = {
      sequence: initialData.cipher,
      counter: 0,
      loopStart: function() {
        $scope.score = 0;
        $scope.$apply();
      }
    };
    $scope.tape2 = {
      sequence: initialData.key,
      counter: 0,
      loopStart: function() {
        clearInterval(charInterval);
        $scope.score = 0;
        $scope.$apply();
        charInterval = setInterval(newChar, 125);
      }
    };

    $scope.tape1.len = $scope.tape1.sequence.length;
    $scope.tape2.len = $scope.tape2.sequence.length;

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

    $scope.togglePlaystate = function() {
      if ($scope.tapeRunning) {
        // tape is running so stop it
        $scope.tapeRunning = false;
        clearInterval(charInterval);
      } else {
        // either the tape is stopped mid-run, or it's at the start position, ready to play
        if ($scope.tapeReset) {
          $scope.tapeRunning = true;
          $scope.tapeReset = false;
        }
      }
    };

    $scope.resetTapes = function () {
      $scope.tapeRunning = false;
      $scope.tapeReset = true;
      clearInterval(charInterval);
    };

    $scope.$watch('tapeSpeed', function() {
      $scope.resetTapes();
    });

    $scope.tapeRunning = false;
    $scope.tapeReset = false;
  });