// local SERVER
// exports.options = {
//     host: '14.35.205.161',
//     port: '3309',
//     user: 'root',
//     password: 'root',
//     database: 'OPENBMS',
//     waitForConnections: true,
//     connectionLimit: 1000,
//     connectTimeout: 1000,
//     queueLimit: 0,
//     multipleStatements: true,
// };

// real DB(OPENBMS)
// exports.options = {
//     host: '14.63.174.168',
//     port: '3306',
//     user: 'hivvDev',
//     password: 'Psw9UhGb0PnB',
//     database: 'OPENBMS',
//     waitForConnections: true,
//     connectionLimit: 1000,
//     connectTimeout: 1000,
//     queueLimit: 0,
//     multipleStatements: true
// }

// test DB(OPENBMS2)
// exports.options = {
//     host: '14.63.174.168',
//     port: '3306',
//     user: 'hivvDev',
//     password: 'Psw9UhGb0PnB',
//     database: 'OPENBMS2',
//     waitForConnections: true,
//     connectionLimit: 1000,
//     connectTimeout: 1000,
//     queueLimit: 0,
//     multipleStatements: true,
// };

// test SERVER
// exports.options = {
//     host: '211.254.214.135',
//     port: '8084',
//     user: 'hivvSet',
//     password: 'gkdlqmfoqtpt321',
//     database: 'OPENBMS',
//     waitForConnections: true,
//     connectionLimit: 1000,
//     connectTimeout: 1000,
//     queueLimit: 0,
//     multipleStatements: true
// }

exports.options = {
    host: process.env['MYSQL_HOST'],
    port: process.env['MYSQL_PORT'],
    user: process.env['MYSQL_USER'],
    password: process.env['MYSQL_PASSWORD'],
    database: process.env['MYSQL_DATABASE'],
    waitForConnections: true,
    connectionLimit: 1000,
    connectTimeout: 1000,
    queueLimit: 0,
    multipleStatements: true,
};
