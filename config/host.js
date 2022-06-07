// local SERVER
// exports.info = {
//     ip: '127.0.0.1',
//     port: '4001',
// };

// real SERVER
// exports.info = {
//     ip: '14.63.174.168',
//     port: '4000',
// }

// test SERVER
// exports.info = {
//     ip: '14.63.174.168',
//     port: '4001',
// };

exports.info = {
    ip: process.env['HOST_IP'],
    port: process.env['HOST_PORT'],
};
