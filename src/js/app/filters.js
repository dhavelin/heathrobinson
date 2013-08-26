/* Filters */

angular.module('heathRobinson').
  filter('zeropad', function() {
    return function(num) {
      var numAsText = num.toString();
      return "0000".substring(0, 4 - numAsText.length) + numAsText;
    }
  });
