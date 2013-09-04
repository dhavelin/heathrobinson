/* Controllers */

angular.module('heathRobinson')
  .controller('machine', function($scope, settings, initialData) {

    var charTimer;
    var charCounter = 0;

    $scope.tape1 = {
      sequence: initialData.cipher,
      seqPrint: initialData.char2print(initialData.cipher),
      photocell: {
        line1: 0,
        line2: 0
      },
      loopCounter: 0,
      charPosition: 0,
      loopStart: function() {
      }
    };

    $scope.tape2 = {
      sequence: initialData.key,
      seqPrint: initialData.char2print(initialData.key),
      photocell: {
        line1: 0,
        line2: 0
      },
      loopCounter: 0,
      charPosition: 0,
      loopStart: function() {
        var lag;
        clearInterval(charTimer);
        if ($scope.tape2.loopCounter > 0) {
          while ($scope.tape2.charPosition < $scope.tape2.len - 1) {
            newChar();
          }
        }
        $scope.score = 0;
        $scope.$apply();
        charTimer = setInterval(newChar, $scope.tapeSpeed.speed);
      }
    };

    $scope.tape1.len = $scope.tape1.sequence.length;
    $scope.tape2.len = $scope.tape2.sequence.length;

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
      $scope.tape1.charPosition = $scope.tape1.len - 2;
      $scope.tape2.charPosition = $scope.tape2.len - 2;
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
    function newChar() {
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