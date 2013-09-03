/* Filters */

angular.module('heathRobinson').

  /**
   * Filter that adds leading zeros to a number to pad it to 4 digits
   *
   * @param <Number> num
   * @return <String> zero-padded number
   */
  filter('zeropad', function() {
    return function(num) {
      var numAsText = num.toString();
      return '0000'.substring(0, 4 - numAsText.length) + numAsText;
    };
  });
