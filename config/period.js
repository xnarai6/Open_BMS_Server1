// local SERVER
// exports.info = {
//     tp: {
//         value: '5',
//         type: 'min',
//     },
//     loc: {
//         value: '10',
//         type: 'sec',
//     },
//     btry: {
//         value: '1',
//         type: 'min',
//     },
// };

// real SERVER
// exports.info = {
//     tp: {
//         value: '5',
//         type: 'min',
//     },
//     loc: {
//         value: '10',
//         type: 'sec',
//     },
//     btry: {
//         value: '1',
//         type: 'min',
//     },
// };

// test SERVER
exports.info = {
    tp: {
        value: '5',
        type: 'min',
    },
    loc: {
        value: '10',
        type: 'sec',
    },
    btry: {
        value: '1',
        type: 'min',
    },
};

exports.match = (type) => {
    if (type == 'sec') return Buffer.from([0x0a]);
    if (type == 'min') return Buffer.from([0x0b]);
    if (type == 'hour') return Buffer.from([0x0c]);
};
