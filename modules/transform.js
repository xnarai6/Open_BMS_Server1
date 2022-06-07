/**
 * 패킷 분리 로직
 *
 * 1. 들어온 데이터 길이가 32 미만인 경우 종료
 * 2. 길이가 32 이상인 경우 loop
 * 3. 먼저 len(데이터 index 2, 3번 값) 받아서 자르기
 * 4. 자른 data 체크(stx / soh / crc /etx)
 * 5. 실패시 종료
 * 6. 통과시 array에 넣고 통과한 부분 잘라서 나머지 부분 다시 buff에 저장
 * 7. 2번 반복
 *
 * @param {*} buff
 * @returns
 */

const util = require('./util');

function recDataToProtocolArray(buff) {
    let resultArray = [];

    if (buff.length < 32) return resultArray;

    while (buff.length >= 32) {
        let LEN = buff.readIntBE(2, 2);

        let partBuff = buff.slice(0, LEN + 4);
        // console.log(util.bufferOneLine(partBuff));
        // console.log(LEN);
        // console.log(buff.length);

        let STX = partBuff.toString('hex', 0, 1);
        let SOH = partBuff.toString('hex', 1, 2);
        let CRC = partBuff.readIntBE(partBuff.length - 2, 1);
        let ETX = partBuff.toString('hex', partBuff.length - 1, partBuff.length);

        if (STX != '02' || SOH != '01' || ETX != '03') break;

        resultArray.push(partBuff);

        buff = buff.slice(LEN + 4);
    }

    return resultArray;
}

function protocolToProtocolObj(buff) {
    return {
        STX: buff.toString('hex', 0, 1),
        SOH: buff.toString('hex', 1, 2),
        LEN: buff.readIntBE(2, 2),
        CMD: buff.toString('hex', 4, 6).toUpperCase(),
        BOARDNUM: buff.toString('hex', 6, 30),
        DATA: buff.slice(30, buff.length - 2),
        CRC: buff.readIntBE(buff.length - 2, 1),
        ETX: buff.toString('hex', buff.length - 1, buff.length),
    };
}

function makeMainProtocolObj(info) {
    const keySet = info['keySet'];
    const seqInfo = info['seqInfo'];
    const protocolObj = info['protocolObj'];
    const cmdName = info['cmdName'];

    const data = protocolObj['DATA'];

    let result = {
        cmpy_seq: seqInfo['cmpy_seq'],
        btry_seq: seqInfo['btry_seq'],
        brd_num: protocolObj['BOARDNUM'],
        mn_key: keySet['key'],
        mn_dt: keySet['dt'],
        mn_h: keySet['h'],
        mn_m: keySet['m'],
        mn_inp_cd: 'B',
        mn_stat_cd: 'Y',
        cmd: protocolObj['CMD'],
        len: protocolObj['LEN'],
        crc: protocolObj['CRC'],
        ins_nm: 'socket',
        ins_dttm: keySet['dttm'],
    };

    let addResult = {};
    if (cmdName == 'TH') addResult = { tp1: (data.readIntLE(0, 2) / 100).toFixed(2), hd1: (data.readIntLE(2, 2) / 100).toFixed(2), tp2: (data.readIntLE(4, 2) / 100).toFixed(2), hd2: (data.readIntLE(6, 2) / 100).toFixed(2) };
    if (cmdName == 'VC') addResult = { volt: (data.readIntLE(0, 4) / 1000).toFixed(2), curr: (data.readIntLE(4, 4) / 1000).toFixed(2) };
    if (cmdName == 'LOC') addResult = { lat: data.readIntLE(0, 1) + '.' + data.readUIntLE(1, 4).toString().padStart(7, '0'), lon: data.readIntLE(5, 1) + '.' + data.readUIntLE(6, 4).toString().padStart(7, '0') };

    Object.assign(result, addResult);

    return result;
}

function makeBizPrevProtocolObj(info) {
    const protocolData = info['protocolData'];
    const format = JSON.parse(info['formatJson']);

    const protocolInfo = format['protocolInfo'];
    const changeInfo = format['changeInfo'];

    let result = {
        type: protocolInfo['type'],
        protocol: protocolInfo['val'],
        data: [],
    };

    if (protocolInfo != null) {
        let offset = 0,
            changeData = [],
            start = 0,
            end = 0;

        while (start != -1 && end != -1) {
            start = protocolData.indexOf(format['STX'], offset, 'hex') + 1;
            end = protocolData.indexOf(format['ETX'], offset, 'hex');

            if (start == -1 || end == -1) break;

            let tData = protocolData.slice(start, end);

            if (changeInfo != null && changeInfo.type == 'C') tData = tData.map((e) => (e = eval(e + ' ' + changeInfo.val[0].unit + ' ' + parseInt(changeInfo.val[0].cal, 16))));
            if (changeInfo != null && changeInfo.type == 'M') {
                let tStr = tData.toString('hex').toUpperCase();
                for (let e of changeInfo.val) tStr = tStr.replace(new RegExp(e.from, 'gi'), e.to);
                tData = Buffer.from(tStr, 'hex');
            }
            if (changeInfo != null && changeInfo.type == 'E') {
                let tStr = tData.toString('utf-8'),
                    rStr = '';
                tStr.split('').map((e) => (rStr += '0' + e));
                tData = Buffer.from(rStr, 'hex');
            }

            changeData.push(tData);

            offset = end + 1;
        }

        result.data = changeData;
    }

    return result;
}

function makeBizProtocolObj1(info) {
    const prevProtocolData = info['prevProtocolData'];
    const format = JSON.parse(info['formatJson']);

    const mpInfo = format['MP'];
    const dataFormat = format['data'];

    const protocolArray = prevProtocolData['protocol'];
    const dataArray = prevProtocolData['data'];

    let result = {};

    for (let d of dataArray) {
        let gubun;
        if (mpInfo.byteType == 'SV') gubun = mpInfo.byte;
        if (mpInfo.byteType == 'BR') {
            gubun = d
                .slice(mpInfo.byte[0], mpInfo.byte[1] + 1)
                .slice(0, 2)
                .reverse()
                .toString('hex');

            d = d.slice(mpInfo.byte[1] + 1, d.length);
        }

        let protocolElement = protocolArray.find((e) => e.code == gubun);
        if (protocolElement == undefined) continue;

        let name = protocolElement.name,
            realFormat = dataFormat[name];

        let start = 0;

        for (let key in realFormat) {
            let count = 1;
            const byte = realFormat[key].byte;
            const reverseType = realFormat[key].reverseType;
            const arrayType = realFormat[key].arrayType,
                returnType = realFormat[key].returnType,
                calType = realFormat[key].calType;
            const arrayTarget = realFormat[key].arrayTarget,
                calUnit = realFormat[key].calUnit,
                calVal = realFormat[key].calVal;

            if (arrayType != 'NA') result[key] = [];
            if (arrayType == 'AN') count = parseInt(arrayTarget);
            if (arrayType == 'AT') count = parseInt(result[arrayTarget], 16);

            for (let i = 0; i < count; i++) {
                let end = start + byte,
                    value;

                let tempD = d.slice(start, end);
                if (reverseType == 'R') tempD = tempD.reverse();

                if (returnType == 'S') value = tempD;
                else if (returnType == 'H') value = tempD.toString('hex');
                else if (returnType == 'N') value = parseInt(tempD.toString('hex'), 16);
                else if (returnType == 'SN') {
                    value = parseInt(tempD.toString('hex'), 16);
                    let intMask = parseInt('0x80' + '00'.repeat(byte - 1), 16);
                    if ((value & intMask) > 0) value = value - intMask * 2;
                } else if (returnType == 'U') value = tempD.toString();
                else if (returnType == 'A') value = tempD.toString('ascii');
                else if (returnType == 'IH') value = tempD.reduce((s, v) => s + v.toString(16).toUpperCase(), '');
                else if (returnType == 'IHN')
                    value = parseInt(
                        tempD.reduce((s, v) => s + v.toString(16).toUpperCase(), ''),
                        16
                    );

                // console.log(key, '|', returnType, '|', tempD, '|', value);

                if (calType == 'Y') value = eval(value + ' ' + calUnit + ' ' + calVal);

                if (arrayType == 'NA') result[key] = value;
                else result[key].push(value);

                start = end;
            }
        }
    }

    return result;
}

function makeBizProtocolObj2(info) {
    const keySet = info['keySet'];
    const seqInfo = info['seqInfo'];
    const boardnum = info['boardnum'];
    const protocolObj = info['protocolObj'];
    const format = JSON.parse(info['formatJson']);

    let result = [];

    let count = 1;
    if (format['LOOP'].loopType == 'N') count = Number(format['LOOP'].target);
    if (format['LOOP'].loopType == 'T') count = Number(protocolObj[format['LOOP'].target]);
    if (format['LOOP'].loopType == 'MT') count = Number(format['LOOP'].target.reduce((ac, cv) => ac + (protocolObj[cv] ? protocolObj[cv].length : 0), 0));
    if (count <= 0) count = 1;

    for (let i = 0; i < count; i++) {
        let tempResult = {
            brd_num: boardnum,
            biz_key: keySet['key'],
            biz_dt: keySet['dt'],
            biz_h: keySet['h'],
            biz_m: keySet['m'],
            cmpy_seq: seqInfo['cmpy_seq'],
            btry_seq: seqInfo['btry_seq'],
            ins_nm: 'socket',
            ins_dttm: keySet['dttm'],
        };

        for (let key in format) {
            let value,
                targetCount = 1;
            const multiType = format[key].multiType,
                multiCalUnit = format[key].multiCalUnit;
            const changeType = format[key].changeType,
                changeJson = format[key].changeJson;

            if (multiType == 'M' || multiType == 'MC') targetCount = format[key].target.length;

            if (multiType == 'O') {
                let tempValue;
                const arrayType = format[key].arrayType;
                const target = format[key].target,
                    targetValue = protocolObj[target];
                if (targetValue == undefined) continue;

                if (arrayType == 'NA') tempValue = targetValue;
                if (arrayType != 'NA') {
                    const arrayCal = format[key].arrayCal,
                        arrayIdx = format[key].arrayIdx;

                    if (arrayType == 'AI') tempValue = targetValue[i];
                    if (arrayType == 'AC' && arrayCal == 'S') tempValue = targetValue.reduce((total, cur) => total + cur, 0);
                    if (arrayType == 'AC' && arrayCal == 'A') tempValue = targetValue.reduce((total, cur) => total + cur, 0) / targetValue.length || 0;
                    if (arrayType == 'AO') tempValue = targetValue[arrayIdx];
                }

                value = tempValue;
            }

            if (multiType == 'M') {
                for (let targetIndex = 0; targetIndex < targetCount; targetIndex++) {
                    let tempValue;
                    const arrayType = format[key].arrayType[targetIndex];
                    const target = format[key].target[targetIndex],
                        targetValue = protocolObj[target];
                    if (targetValue == undefined) continue;

                    if (arrayType == 'NA') tempValue = targetValue;
                    if (arrayType != 'NA') {
                        const arrayCal = format[key].arrayCal,
                            arrayIdx = format[key].arrayIdx;

                        if (arrayType == 'AI') tempValue = targetValue[i];
                        if (arrayType == 'AC' && arrayCal == 'S') tempValue = targetValue.reduce((total, cur) => total + cur, 0);
                        if (arrayType == 'AC' && arrayCal == 'A') tempValue = targetValue.reduce((total, cur) => total + cur, 0) / targetValue.length || 0;
                        if (arrayType == 'AO') tempValue = targetValue[arrayIdx];
                    }

                    if (targetIndex == 0) value = tempValue;
                    else if (targetIndex != 0) value = eval(value + ' ' + multiCalUnit + ' ' + tempValue);
                }
            }

            if (multiType == 'MC') {
                let targetArray = [];

                for (let targetIndex = 0; targetIndex < targetCount; targetIndex++) {
                    const arrayType = format[key].arrayType[targetIndex];
                    const target = format[key].target[targetIndex],
                        targetValue = protocolObj[target];
                    if (targetValue == undefined) continue;

                    if (arrayType == 'NA') targetArray.push(targetValue);
                    if (arrayType != 'NA') {
                        const arrayCal = format[key].arrayCal,
                            arrayIdx = format[key].arrayIdx;

                        if (arrayType == 'AI') targetArray = targetArray.concat(targetValue);
                        if (arrayType == 'AC' && arrayCal == 'S') targetArray = targetArray.push(targetValue.reduce((total, cur) => total + cur, 0));
                        if (arrayType == 'AC' && arrayCal == 'A') targetArray = targetArray.push(targetValue.reduce((total, cur) => total + cur, 0) / targetValue.length || 0);
                        if (arrayType == 'AO') targetArray = targetArray.push(targetValue[arrayIdx]);
                    }
                }

                if (targetArray.length == 0) continue;

                value = targetArray[i];
            }

            if (changeType != 'NC') {
                const changeObject = JSON.parse(changeJson);

                if (changeType == 'CN') {
                    if (value < 0) value = changeObject['-'];
                    if (value > 0) value = changeObject['+'];
                    if (value == 0) value = changeObject['0'];
                }

                if (changeType == 'CS') value = changeObject[value];
            }

            if (format[key].saveType == 'NS') continue;
            else tempResult[key] = value;
        }

        result.push(tempResult);
    }

    return result;
}

function makeBizProtocolObj3(info) {
    const cmd = info['cmd'];
    const protocolObj = info['protocolObj'];

    return [
        protocolObj.map((obj) => [
            obj.brd_num,
            obj.biz_key,
            obj.biz_dt,
            obj.biz_h,
            obj.biz_m,
            obj.cmpy_seq,
            obj.btry_seq,
            cmd,
            obj.cmd,
            obj.len,
            obj.alarm_stat,
            obj.fet_stat,
            obj.volt_sys,
            obj.volt_mdl,
            obj.volt_etc1,
            obj.curr_sys,
            obj.curr_mdl,
            obj.curr_etc1,
            obj.tp_sys,
            obj.tp_mdl,
            obj.tp_etc1,
            obj.chrg_stat_cd,
            obj.soc,
            obj.soh,
            obj.crc,
            obj.ins_nm,
            obj.ins_dttm,
        ]),
    ];
}

function makeBizRawProtocolObj(info) {
    const keySet = info['keySet'];
    const seqInfo = info['seqInfo'];
    const protocolObj = info['protocolObj'];

    return {
        brd_num: protocolObj['BOARDNUM'],
        biz_key: keySet['key'],
        biz_dt: keySet['dt'],
        biz_h: keySet['h'],
        biz_m: keySet['m'],
        cmpy_seq: seqInfo['cmpy_seq'],
        btry_seq: seqInfo['btry_seq'],
        raw: protocolObj['DATA'].toString('hex').toUpperCase(),
        ins_nm: 'socket',
        ins_dttm: keySet['dttm'],
    };
}

function makeLastProtocolObj(info) {
    const cmdName = info['cmdName'];
    const obj = info['obj'];

    let result = [];

    if (cmdName == 'LOC') result = [obj['btry_seq'], obj['ins_dttm'], obj['lat'], obj['lon'], obj['ins_nm'], obj['ins_dttm'], obj['ins_nm'], obj['ins_dttm']];
    if (cmdName == 'TH') result = [obj['btry_seq'], obj['ins_dttm'], obj['tp1'], obj['hd1'], obj['ins_nm'], obj['ins_dttm'], obj['ins_nm'], obj['ins_dttm']];
    if (cmdName == 'VC') result = [obj['btry_seq'], obj['ins_dttm'], obj['volt'], obj['curr'], obj['ins_nm'], obj['ins_dttm'], obj['ins_nm'], obj['ins_dttm']];
    if (cmdName == 'BIZ') result = [obj['btry_seq'], obj['ins_dttm'], obj['chrg_stat_cd'], obj['volt_sys'], obj['curr_sys'], obj['tp_sys'], obj['soc'], obj['soh'], obj['ins_nm'], obj['ins_dttm'], obj['ins_nm'], obj['ins_dttm']];

    return result;
}

function hourDbObject(dt, h, nowDttm, dataRow) {
    let result = [];

    for (let data of dataRow) {
        let temp = {
            cmpy_seq: data.cmpy_seq,
            btry_seq: data.btry_seq,
            sttc_dt: dt,
            sttc_hour: h,
            comment: '',
            avg_chrg_time: data['C'],
            avg_dischrg_time: data['DC'],
            avg_standby_time: data['W'],
            chrg_cnt: data['C_cnt'],
            volt_max: data.volt_max,
            volt_min: data.volt_min,
            curr_max: data.curr_max,
            curr_min: data.curr_min,
            tp_max: data.tp_max,
            tp_min: data.tp_min,
            avg_soc: data.soc,
            avg_soh: data.soh,
            ins_nm: 'socket',
            ins_dttm: nowDttm,
        };

        result.push(temp);
    }

    return result;
}

function hourDbArray(hourDbObject) {
    return [hourDbObject.map((obj) => [obj.cmpy_seq, obj.btry_seq, obj.sttc_dt, obj.sttc_hour, obj.comment, obj.avg_chrg_time, obj.avg_dischrg_time, obj.avg_standby_time, obj.chrg_cnt, obj.volt_max, obj.volt_min, obj.curr_max, obj.curr_min, obj.tp_max, obj.tp_min, obj.avg_soc, obj.avg_soh, obj.ins_nm, obj.ins_dttm])];
}

function dayDbObject(dt, wd, nowDttm, dataRow) {
    let result = [];

    for (let data of dataRow) {
        let temp = {
            cmpy_seq: data.cmpy_seq,
            btry_seq: data.btry_seq,
            sttc_dt: dt,
            sttc_dayweek: wd,
            comment: '',
            avg_chrg_time: data['C'],
            avg_dischrg_time: data['DC'],
            avg_standby_time: data['W'],
            chrg_cnt: data['C_cnt'],
            chk_cnt: data['chk_cnt'],
            event_cnt: data['event_cnt'],
            max_volt: data.max_volt,
            min_volt: data.min_volt,
            max_curr: data.max_curr,
            min_curr: data.min_curr,
            max_tp: data.max_tp,
            min_tp: data.min_tp,
            avg_soc: data.soc,
            avg_soh: data.soh,
            ins_nm: 'socket',
            ins_dttm: nowDttm,
        };

        result.push(temp);
    }

    return result;
}

function dayDbArray(dayDbObject) {
    return [dayDbObject.map((obj) => [obj.cmpy_seq, obj.btry_seq, obj.sttc_dt, obj.sttc_dayweek, obj.comment, obj.avg_chrg_time, obj.avg_dischrg_time, obj.avg_standby_time, obj.chrg_cnt, obj.chk_cnt, obj.event_cnt, obj.max_volt, obj.min_volt, obj.max_curr, obj.min_curr, obj.max_tp, obj.min_tp, obj.avg_soc, obj.avg_soh, obj.ins_nm, obj.ins_dttm])];
}

function monthDbObject(date, month, nowDttm, dataRow) {
    let result = [];

    for (let data of dataRow) {
        let temp = {
            cmpy_seq: data.cmpy_seq,
            btry_seq: data.btry_seq,
            sttc_dt: date,
            sttc_month: month,
            comment: '',
            avg_chrg_time: data['C'],
            avg_dischrg_time: data['DC'],
            avg_standby_time: data['W'],
            chrg_cnt: data['C_cnt'],
            chk_cnt: data['chk_cnt'],
            event_cnt: data['event_cnt'],
            max_volt: data.max_volt,
            min_volt: data.min_volt,
            max_curr: data.max_curr,
            min_curr: data.min_curr,
            max_tp: data.max_tp,
            min_tp: data.min_tp,
            avg_soc: data.soc,
            avg_soh: data.soh,
            ins_nm: 'socket',
            ins_dttm: nowDttm,
        };

        result.push(temp);
    }

    return result;
}

function monthDbArray(monthDbObject) {
    return [monthDbObject.map((obj) => [obj.cmpy_seq, obj.btry_seq, obj.sttc_dt, obj.sttc_month, obj.comment, obj.avg_chrg_time, obj.avg_dischrg_time, obj.avg_standby_time, obj.chrg_cnt, obj.chk_cnt, obj.event_cnt, obj.max_volt, obj.min_volt, obj.max_curr, obj.min_curr, obj.max_tp, obj.min_tp, obj.avg_soc, obj.avg_soh, obj.ins_nm, obj.ins_dttm])];
}

function mngDbObject(type, dt, val, nowDttm) {
    let result = {
        sttc_ty_cd: type,
        last_sttc_dt: dt,
        last_sttc_val: val,
        ins_nm: 'socket',
        ins_dttm: nowDttm,
    };

    return result;
}

module.exports = {
    recDataToProtocolArray: recDataToProtocolArray,
    protocolToProtocolObj: protocolToProtocolObj,
    makeMainProtocolObj: makeMainProtocolObj,
    makeBizPrevProtocolObj: makeBizPrevProtocolObj,
    makeBizProtocolObj1: makeBizProtocolObj1,
    makeBizProtocolObj2: makeBizProtocolObj2,
    makeBizProtocolObj3: makeBizProtocolObj3,
    makeBizRawProtocolObj: makeBizRawProtocolObj,

    makeLastProtocolObj: makeLastProtocolObj,

    sch: {
        hourDbObject: hourDbObject,
        hourDbArray: hourDbArray,
        dayDbObject: dayDbObject,
        dayDbArray: dayDbArray,
        monthDbObject: monthDbObject,
        monthDbArray: monthDbArray,
        mngDbObject: mngDbObject,
    },
};
