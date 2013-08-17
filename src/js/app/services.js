/* Services */

angular.module('heathRobinson').
  service('tty2bits', function() {
    this.convert = function(ttyChar) {
      if (ttyChar > 31 || ttyChar < 0) {
        throw new TypeError("arrayFromTtyChar - Teletype character is out of range");
      }
      for (var cShifted = ttyChar, aFromChar = []; cShifted; aFromChar.push(Boolean(cShifted & 1)), cShifted >>>= 1);
      return aFromChar;
    };
  });