/**
 * this util object binded commonly used utils to window.
 */
(function () {
    window.util = {
        'getRandomScope': getRandomScope
    }
})();

/**
 * this function returned a floored random number between min and max
 * @param {number} min - min of the scope
 * @param {number} max - pay attention that max does not appear in the result, (max - 1) does
 */
function getRandomScope(min, max) {
    var scale = max - min
    return Math.floor(Math.random() * scale + min)
}