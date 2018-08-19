module.exports = {

    /**
     * checks if string is empty(undefined or blank) or not
     * @return {boolean}
     * @param val
     */
    isStringEmpty: function (val) {
        return (val === undefined || val === null || val.length <= 0);
    },

    isNullOrUndefined: function (arg) {
        return arg === null || arg === undefined;
    }
};
