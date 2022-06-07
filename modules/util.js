// make key
function makeKeySet(now) {
    return {
        key: now.format('YYYYMMDDHHmmss') + now.milliseconds().toString().padStart(3, '0'),
        dt: now.format('YYYYMMDD'),
        h: now.format('HH'),
        m: now.format('mm'),
        dttm: now.format('YYYY-MM-DD HH:mm:ss'),
    };
}

// buffer to hex
function bufferOneLine(buffer) {
    let result = '';

    buffer.forEach((v, i) => {
        result += v.toString(16).padStart(2, '0');
        if (i != buffer.length - 1) result += ' ';
    });

    return result;
}

// hex range check
function hexRangeCheck(hex, minHex, maxHex) {
    const val = transferHex(hex),
        minVal = transferHex(minHex),
        maxVal = transferHex(maxHex);
    if (val >= minVal && val <= maxVal) return true;
    return false;
}

// transfer hex
function transferHex(hex) {
    return typeof hex == 'number' ? hex : parseInt(hex, 16);
}

module.exports = {
    makeKeySet: makeKeySet,
    bufferOneLine: bufferOneLine,
    hexRangeCheck: hexRangeCheck,
    transferHex: transferHex,
};
