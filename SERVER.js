const net = require('net');
const dotenv = require('dotenv');
const moment = require('moment');
const mysql = require('mysql2/promise');
const asyncRedis = require('async-redis');
const colors = require('colors');
const grayLog = colors['gray'];

dotenv.config({ path: './.env.dev' });

const util = require('./modules/util');
const { errorMessage } = require('./modules/error');
const print = require('./modules/print');
const query = require('./modules/query');
const format = require('./modules/format');
const transform = require('./modules/transform');

const configMysql = require('./config/mysql');
const configHost = require('./config/host');
const configPeriod = require('./config/period');

// const redisClient = asyncRedis.createClient();

const timeout = 1800000;
const { ip, port } = configHost.info;
const pool = mysql.createPool(configMysql.options);

console.log(port);

// cmd info 셋팅
const mainCmdInfo = { minHex: 0x0ba0, maxHex: 0x0ba2, name: { '0BA0': 'TH', '0BA1': 'VC', '0BA2': 'LOC' } };
const bizCmdInfo = { minHex: 0x0ca0, maxHex: 0x0ca1, name: { '0CA0': 'IBT', '0CA1': 'TS' } };
const resCmdInfo = { minHex: 0x0da1, maxHex: 0x0da2, ip: '0DA1', period: '0DA2', name: { '0DA1': 'IP', '0DA2': 'PERIOD' } };

const formatInfo = {
    prev_fmt_json: JSON.stringify(format.prevFormat),
    ptc_fmt_json: JSON.stringify(format.protocolFormat),
    db_fmt_json: JSON.stringify(format.dbFormat),
};

const server = net.createServer((socket) => {
    socket.setTimeout(timeout);

    socket.on('end', () => print.nowLog({ event: 'SOCKET END' }, 'blue'));
    socket.on('close', () => print.nowLog({ event: 'SOCKET CLOSE' }, 'blue'));
    socket.on('timeout', () => print.nowLog({ event: 'SOCKET TIMEOUT', socket: socket }, 'blue'));
    socket.on('error', (error) => print.nowLog({ event: 'SOCKET ERROR', error: error, socket: socket }, 'blue'));

    socket.on('data', async (recData) => {
        print.nowLog({ event: 'SOCKET SEND DATA START' }, 'blue');

        // ========== A. PROTOCOL ==========
        // A. recData 체크
        if (!Buffer.isBuffer(recData)) return print.errorLog(errorMessage['INVALID_BUFFER']);
        print.wrapLog({ event: 'A. REC DATA', info: util.bufferOneLine(recData) }, 'green');
        // ========== A. PROTOCOL ==========

        // ========== B. PROTOCOL ARRAY ==========
        // B-1. recData array 생성
        let protocolArray = [];
        protocolArray = transform.recDataToProtocolArray(recData);
        let protocolArrayStr = protocolArray.map((e) => util.bufferOneLine(e));
        print.wrapLog({ event: 'B-1. PROTOCOL ARRAY', info: JSON.stringify(protocolArrayStr) }, 'green');
        if (protocolArray.length <= 0) return print.errorLog(errorMessage['EMPTY_BUFFER_ARRAY']);
        // ========== B. PROTOCOL ARRAY ==========

        // DB connect
        const connection = await pool.getConnection(async (conn) => conn);
        await connection.beginTransaction();

        // ========== C. PROTOCOL ==========
        // protocol array 반복
        let count = 1;
        for (let protocol of protocolArray) {
            // C-1. make key SET
            let keySet = util.makeKeySet(moment());
            print.wrapLog({ event: `C-1. PROTOCOL KEY SET(COUNT: ${count})`, info: JSON.stringify(keySet) }, 'green');

            // C-2. make protocol object
            let protocolObj;
            try {
                protocolObj = transform.protocolToProtocolObj(protocol);
            } catch (error) {
                return print.errorLog(errorMessage['BASIC_CON_ERR'], error);
            }
            print.wrapLog({ event: `C-2. PROTOCOL OBJECT(COUNT: ${count})`, info: JSON.stringify(protocolObj) }, 'green');

            // protocol value 체크
            if (protocolObj['STX'] != '02' || protocolObj['SOH'] != '01' || protocolObj['ETX'] != '03') return print.errorLog(errorMessage['BASIC_CHK_ERR']);

            // protocol data 체크
            if (!Buffer.isBuffer(protocolObj.DATA)) return print.errorLog(errorMessage['INVALID_BUFFER']);

            print.wrapLog({ event: `C-3. PROTOCOL DATA(COUNT: ${count})`, info: util.bufferOneLine(protocolObj['DATA']) }, 'green');

            // C-4. BOARDNUM으로 seq 정보 가져오기
            let seqInfo;
            try {
                let selectQuery = query.selectSeqByBoardnum(protocolObj['BOARDNUM']);
                let selectResult = await connection.query(selectQuery);
                seqInfo = selectResult[0][0];
            } catch (error) {
                connection.release();
                return print.errorLog(errorMessage['BASIC_SEL_ERR'], error);
            }
            if (!seqInfo || seqInfo == null) {
                connection.release();
                return print.errorLog(errorMessage['BASIC_SEL_EMP']);
            }
            print.wrapLog({ event: `C-4. SEQ INFO(COUNT: ${count})`, info: JSON.stringify(seqInfo) }, 'green');

            // 2-4. format 셋팅
            // const formatInfo = rows1[0];

            // formatInfo.prev_fmt_json = JSON.stringify(format.prevFormat);
            // formatInfo.ptc_fmt_json = JSON.stringify(format.protocolFormat);
            // formatInfo.db_fmt_json = JSON.stringify(format.dbFormat);

            // ========== D. PROTOCOL-main ==========
            // D. CMD가 MAIN인 경우 (CMD: 0BA0 ~ 0BA2)
            if (util.hexRangeCheck(protocolObj['CMD'], mainCmdInfo['minHex'], mainCmdInfo['maxHex'])) {
                console.log(grayLog(`========== D. MAIN PROTOCOL(COUNT: ${count}) START ==========`));

                const cmdName = mainCmdInfo.name[protocolObj['CMD']];

                // D-1. protocol-main object 생성
                let mainProtocolObj;
                try {
                    mainProtocolObj = transform.makeMainProtocolObj({ keySet: keySet, seqInfo: seqInfo, protocolObj: protocolObj, cmdName: cmdName });
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['MAIN_CON_ERR'], error);
                }
                print.wrapLog({ event: `D-1. MAIN PROTOCOL OBJECT(COUNT: ${count})`, info: JSON.stringify(mainProtocolObj) }, 'green');

                // D-2. protocol-main insert
                try {
                    let insertQuery = query.insertMainProtocol(cmdName);
                    await connection.query(insertQuery, mainProtocolObj);
                    // await redisClient.set("ptcMn:" + protocolObj.BOARDNUM + ":" + keySet.key, JSON.stringify(mainDbObject));
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['MAIN_INS_ERR'], error);
                }
                print.wrapLog({ event: `D-2. MAIN PROTOCOL INSERT(COUNT: ${count})`, info: 'INSERT SUCCESS' }, 'green');

                // D-3. protocol-main-last object 생성
                let mainLastProtocolObj;
                try {
                    mainLastProtocolObj = transform.makeLastProtocolObj({ obj: mainProtocolObj, cmdName: cmdName });
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['MAIN_LAST_CON_ERR'], error);
                }
                print.wrapLog({ event: `D-3. MAIN LAST PROTOCOL OBJECT(COUNT: ${count})`, info: JSON.stringify(mainLastProtocolObj) }, 'green');

                // D-4. protocol-main-last insert
                try {
                    let insertQuery = query.insertLastProtocol(cmdName);
                    await connection.query(insertQuery, mainLastProtocolObj);
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['MAIN_LAST_INS_ERR'], error);
                }
                print.wrapLog({ event: `D-4. MAIN LAST PROTOCOL INSERT(COUNT: ${count})`, info: 'INSERT SUCCESS' }, 'green');

                console.log(grayLog(`========== D. MAIN PROTOCOL(COUNT: ${count}) END ==========`));
            }
            // ========== D. PROTOCOL-main ==========

            // ========== E. PROTOCOL-biz ==========
            // E. biz data인 경우(cmd: 0CA0 ~ 0CA1)
            if (util.hexRangeCheck(protocolObj['CMD'], bizCmdInfo['minHex'], bizCmdInfo['maxHex'])) {
                console.log(grayLog(`========== E. BIZ PROTOCOL(COUNT: ${count}) START ==========`));

                const cmdName = bizCmdInfo.name[protocolObj['CMD']];

                // E-1. protocol-biz-prev 적용
                let bizPrevProtocolObj;
                try {
                    bizPrevProtocolObj = transform.makeBizPrevProtocolObj({ formatJson: formatInfo['prev_fmt_json'], protocolData: protocolObj['DATA'] });
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_PRE_CON_ERR'], error);
                }
                print.wrapLog({ event: `E-1. BIZ PREV PROTOCOL OBJECT(COUNT: ${count})`, info: JSON.stringify(bizPrevProtocolObj) }, 'green');

                // E-2-1. protocol-biz object 1 생성
                let bizProtocolObj1;
                try {
                    bizProtocolObj1 = transform.makeBizProtocolObj1({ formatJson: formatInfo['ptc_fmt_json'], prevProtocolData: bizPrevProtocolObj });
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_BTR_CON_ERR'], error);
                }
                print.wrapLog({ event: `E-2-1. BIZ PROTOCOL OBJECT 1(COUNT: ${count})`, info: JSON.stringify(bizProtocolObj1) }, 'green');

                // E-2-2. protocol-biz object 2 생성
                let bizProtocolObj2;
                try {
                    bizProtocolObj2 = transform.makeBizProtocolObj2({ formatJson: formatInfo['db_fmt_json'], keySet: keySet, seqInfo: seqInfo, boardnum: protocolObj['BOARDNUM'], protocolObj: bizProtocolObj1 });
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_OBJ_CON_ERR'], error);
                }
                print.wrapLog({ event: `E-2-2. BIZ PROTOCOL OBJECT 2(COUNT: ${count})`, info: JSON.stringify(bizProtocolObj2) }, 'green');

                // E-2-1. protocol-biz object 3 생성
                let bizProtocolObj3;
                try {
                    bizProtocolObj3 = transform.makeBizProtocolObj3({ cmd: protocolObj['CMD'], protocolObj: bizProtocolObj2 });
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_ARR_CON_ERR'], error);
                }
                print.wrapLog({ event: `E-2-3. BIZ PROTOCOL OBJECT 3(COUNT: ${count})`, info: JSON.stringify(bizProtocolObj3) }, 'green');

                // E-3. protocol-biz insert
                try {
                    let insertQuery = query.insertBizProtocol();
                    await connection.query(insertQuery, bizProtocolObj3);
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_BTR_INS_ERR'], error);
                }
                print.wrapLog({ event: `E-3. BIZ PROTOCOL INSERT(COUNT: ${count})`, info: 'INSERT SUCCESS' }, 'green');

                // E-4. protocol-biz-raw object 생성
                let bizRawProtocolObj;
                try {
                    bizRawProtocolObj = transform.makeBizRawProtocolObj({ keySet: keySet, seqInfo: seqInfo, protocolObj: protocolObj });
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_BTR_RAW_CON_ERR'], error);
                }
                print.wrapLog({ event: `E-4. BIZ RAW PROTOCOL OBJECT(COUNT: ${count})`, info: JSON.stringify(bizRawProtocolObj) }, 'green');

                // E-5. protocol-biz-raw insert
                try {
                    let insertQuery = query.insertBizRawProtocol();
                    await connection.query(insertQuery, bizRawProtocolObj);
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_BTR_RAW_INS_ERR'], error);
                }
                print.wrapLog({ event: `E-5. BIZ RAW PROTOCOL INSERT(COUNT: ${count})`, info: 'INSERT SUCCESS' }, 'green');

                // E-6. protocol-biz-last object 생성
                let bizLastProtocolObj;
                try {
                    bizLastProtocolObj = transform.makeLastProtocolObj({ cmdName: 'BIZ', obj: bizProtocolObj2[bizProtocolObj2.length - 1] });
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_BTR_LAST_CON_ERR'], error);
                }
                print.wrapLog({ event: `E-6. BIZ LAST PROTOCOL OBJECT(COUNT: ${count})`, info: JSON.stringify(bizLastProtocolObj) }, 'green');

                // E-7. protocol-last insert
                try {
                    let insertQuery = query.insertLastProtocol('BIZ');
                    await connection.query(insertQuery, bizLastProtocolObj);
                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return print.errorLog(errorMessage['BIZ_BTR_LAST_INS_ERR'], error);
                }
                print.wrapLog({ event: `E-7. BIZ LAST PROTOCOL INSERT(COUNT: ${count})`, info: 'INSERT SUCCESS' }, 'green');

                console.log(grayLog(`========== E. BIZ PROTOCOL(COUNT: ${count}) END ==========`));
            }
            // ========== E. PROTOCOL-biz ==========

            // ========== F. PROTOCOL-res ==========
            // F. response data인 경우(cmd: 0DA1 ~ 0DA2)
            if (util.hexRangeCheck(protocolObj['CMD'], resCmdInfo['minHex'], resCmdInfo['maxHex'])) {
                console.log(grayLog(`========== F. RESPONSE DATA(COUNT: ${count}) START ==========`));

                // F-1. response ip port
                if (protocolObj['CMD'] == '0DA1') {
                    let ipData = Buffer.from(ip.split('.'));
                    let portData = Buffer.alloc(2);
                    portData.writeUInt16BE(port);

                    let head = recData.slice(0, 2);
                    let len = Buffer.alloc(2);
                    len.writeUInt16BE(34);
                    let cmd = recData.slice(4, 6);
                    let brd = recData.slice(6, 30);
                    let tail = recData.slice(30, recData.length);

                    let newData = Buffer.concat([head, len, cmd, brd, ipData, portData, tail]);

                    print.wrapLog({ event: `F-1. RES IP PROTOCOL OBJECT(COUNT: ${count})`, info: util.bufferOneLine(newData) }, 'green');
                    socket.write(newData);
                }

                // F-2. response period
                if (protocolObj['CMD'] == '0DA2') {
                    let tpData = Buffer.concat([Buffer.from([configPeriod.info['tp'].value]), configPeriod.match(configPeriod.info['tp'].type)]);
                    let locData = Buffer.concat([Buffer.from([configPeriod.info['loc'].value]), configPeriod.match(configPeriod.info['loc'].type)]);
                    let btryData = Buffer.concat([Buffer.from([configPeriod.info['btry'].value]), configPeriod.match(configPeriod.info['btry'].type)]);

                    let head = recData.slice(0, 2);
                    let len = Buffer.alloc(2);
                    len.writeUInt16BE(34);
                    let cmd = recData.slice(4, 6);
                    let brd = recData.slice(6, 30);
                    let tail = recData.slice(30, recData.length);

                    let newData = Buffer.concat([head, len, cmd, brd, tpData, locData, btryData, tail]);

                    print.wrapLog({ event: `F-2. RES PERIOD PROTOCOL OBJECT(COUNT: ${count})`, info: util.bufferOneLine(newData) }, 'green');
                    socket.write(newData);
                }

                console.log(grayLog(`========== F. RESPONSE DATA(COUNT: ${count}) END ==========`));
            }
            // ========== F. PROTOCOL-res ==========

            count++;
        }
        // ========== C. PART DATA ==========

        await connection.commit();
        connection.release();

        print.nowLog({ event: 'SOCKET DATA END' }, 'blue');
    });
});
server.on('connection', (socket) => print.nowLog({ event: 'SERVER CONNECTION', info: `IP: ${socket.remoteAddress}` }, 'blue'));
server.on('end', () => print.nowLog({ event: 'SERVER END' }, 'blue'));
server.on('close', () => print.nowLog({ event: 'SERVER CLOSE' }, 'blue'));
server.on('error', (error) => print.nowLog({ event: 'SERVER ERROR', error: error }, 'blue'));
server.listen(port, '0.0.0.0', () => print.nowLog({ event: 'SERVER LISTEN', info: `port: ${port}` }, 'blue'));
