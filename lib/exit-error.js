"use strict";

/**
 * @param {number} [code]
 * @param {String} [message]
 */
var ExitError = function(code, message) {
    this.code = code || 1;
    this.message = message || 'Exit with error.';
};

module.exports = {
    /**
     * @param {number} [code]
     * @param {String} [message]
     */
    throwError: function (code, message) {
        throw new ExitError(code, message);
    },
    /**
     * @param {Object} e
     *
     * @return {boolean}
     */
    validError: function (e) {
        return e instanceof ExitError;
    }
};
