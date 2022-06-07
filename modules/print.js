const moment = require('moment');
const colors = require('colors');

const redLog = colors['red'];
const grayLog = colors['gray'];

module.exports = {
    nowLog: printNowLog,
    wrapLog: printWrapLog,
    errorLog: printErrorLog,
};

function printNowLog(data, color) {
    let colorLog = colors[color];

    let nowDttm = moment().format('YYYY-MM-DD HH:mm:ss');

    let logArray = [data.event, nowDttm];
    if (data.info) logArray.push(data.info);

    let logStr = `========== ${logArray.join(' | ')} ==========`;
    console.log(colorLog(logStr));

    if (data.error) console.log(redLog(data.error));
    if (data.socket) data.socket.end();
}

function printWrapLog(data, color) {
    let colorLog = colors[color];

    console.log(grayLog(`========== ${data.event} START ==========`));
    console.log(colorLog(data.info));
    console.log(grayLog(`========== ${data.event} END ==========`));
}

function printErrorLog(error1, error2) {
    console.log(redLog(error1));
    if (error2) console.log(redLog(error2));
    return false;
}
