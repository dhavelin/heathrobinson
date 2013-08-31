/* Services */

angular.module('heathRobinson').
  constant('settings', {
    tapeGap: 0
  }).
  service('initialData', function() {
    this.cipher = [
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
    this.key = [
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
  }).
  service('tty2bits', function() {
    this.convert = function(ttyChar) {
      if (ttyChar > 31 || ttyChar < 0) {
        throw new TypeError("arrayFromTtyChar - Teletype character is out of range");
      }
      for (var cShifted = ttyChar, aFromChar = []; cShifted; aFromChar.push(Boolean(cShifted & 1)), cShifted >>>= 1);
      return aFromChar;
    };
  });