// 1. 메인 format
// r1. returnType(반환 타입) - 'S': slice / 'H': hex / 'N': number
// r2. directionType(방향 타입) - 'F': forward / 'B': backward
// exports.mainFormat = {
//     STX: { returnType: 'H', directionType: 'F', val: 1, },
//     SOH: { returnType: 'H', directionType: 'F', val: 1, },
//     LEN: { returnType: 'I', directionType: 'F', val: 2, },
//     CMD: { returnType: 'H', directionType: 'F', val: 2, },
//     BOARDNUM: { returnType: 'H', directionType: 'F', val: 24, },
//     DATA: { returnType: 'S', directionType: 'B', val: 2, },
//     CRC: { returnType: 'S', byte: 1, },
//     ETX: { returnType: 'S', byte: 1, },
// }

/**
 * [DATA TRANS format]
 *
 * R1. changeType(변환 타입) - 'NC': no change / 'C': yes
 * arrayType이 C인 경우
 * -> R1-1. changeArray - from값을 to 값으로
 */
// exports.changeFormat = {
//     changeType: 'C',
//     changeArray: [{from: "1082", to: "02"}, {from: "1083", to: "03"}, {from: "108F", to: "10"}]
// }

/**
 * [사전작업 프로토콜 format]
 *
 * R1. STX(시작 byte) - 값(hex)
 *
 * R2. ETX(종료 byte) - 값(hex)
 *
 * R3. protocolInfo(배열 타입) - 타입(OP: 단일 / MP: 다중) / 프로토콜 매칭 값(명칭 / 코드(구분 값))
 *
 * R4. changeInfo(변환 타입) - 종류(C: 계산 / M: 매칭 / E: 인코딩) / 변환 값
 *  - R4-1. C인 경우 - 계산 부호 / 계산 값
 *  - R4-2. M인 경우 - 이전 값 / 변환 값
 *  - R4-3. E인 경우 - 인코딩 종류(UTF8 / EUCKR / ...)
 *
 * R4. val(값)
 */
// IBT
// exports.prevFormat = {
//     STX: '3A',
//     ETX: '7E',
//     protocolInfo: { type: 'OP', val: [{name: 'all', code: '00'}]},
//     changeInfo: { type: 'E', val: [{enc: 'UTF8'}] }
// }

// TS
exports.prevFormat = {
    STX: '02',
    ETX: '03',
    protocolInfo: {
        type: 'MP',
        val: [
            { name: 'summary', code: '0351' },
            { name: 'packvalue', code: '0352' },
            { name: 'temperature', code: '0354' },
            { name: 'slave_cell_volt_1_4', code: '0100' },
            { name: 'slave_cell_volt_5_8', code: '0101' },
            { name: 'slave_tp_1_2', code: '0106' },
        ],
    },
    changeInfo: {
        type: 'M',
        val: [
            { from: '1082', to: '02' },
            { from: '1083', to: '03' },
            { from: '108F', to: '10' },
        ],
    },
};

/**
 * [프로토콜 format]
 *
 * R0. byteType(바이트 타입) - 'B': byte / 'BR': byte range / 'SV': static value
 * byteType가 BR인 경우
 *  - R0-1. byte는 배열
 *
 * R1. arrayType(배열 타입) - 'NA': non array / 'AN': array number / 'AT' array target
 * arrayType이 AN or AT인 경우
 *  - R1-1. arrayTarget(배열 타겟) - AN인 경우 number값 / AT인 경우 타겟 key 명
 *
 * R2. reverseType(반전 타입) - 'R': reverse / 'NR': no reverse
 *
 * R3. returnType(반환 타입)
 *  - 'S': slice / 'H': hex / 'N': number / 'U': utf-8 / 'A': ascii / 'AH': ascii hex / 'AHN': ascii hex number
 *  - 'IH': individual hex / 'IHN': individual hex number
 *
 * R4. calType(계산 타입) - 'N': no / 'Y': yes
 * calType이 Y인 경우
 *  - R4-1. calUnit(계산 부호) - '+' / '-' / '*' / '/'
 *  - R4-2. calVal(계산 값) - 값
 *
 * R5. byte(바이트 값)
 */
// IBT
// exports.protocolFormat = {
//     MP: { byteType: 'SV', arrayType: 'NA', reverseType: 'NR', returnType: 'H', calType: 'N', byte: '00' },
//     data: {
//         all: {
//             ADDRESS: { arrayType: 'NA', reverseType: 'NR', returnType: 'IH', calType: 'N', byte: 2 },
//             CMD: { arrayType: 'NA', reverseType: 'NR', returnType: 'IH', calType: 'N', byte: 2 },
//             VERSION: { arrayType: 'NA', reverseType: 'NR', returnType: 'IH', calType: 'N', byte: 2 },
//             LEN: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'N', byte: 4 },

//             BAT_SERIAL_NUM: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'N', byte: 2 },
//             VOLT: { arrayType: 'AT', arrayTarget: 'BAT_SERIAL_NUM', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '/', calVal: 10000, byte: 4 },

//             CURR1: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '/', calVal: 100, byte: 4 },
//             CURR2: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '/', calVal: 100, byte: 4 },

//             SYS_TEMP_NUM: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'N', byte: 2 },
//             SYS_TEMP: { arrayType: 'AT', arrayTarget: 'SYS_TEMP_NUM', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '-', calVal: 40, byte: 2 },

//             FET_TEMP_NUM: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'N', byte: 2 },
//             FET_TEMP: { arrayType: 'AT', arrayTarget: 'FET_TEMP_NUM', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '-', calVal: 40, byte: 2 },

//             LTC_TEMP_NUM: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'N', byte: 2 },
//             LTC_TEMP: { arrayType: 'AT', arrayTarget: 'LTC_TEMP_NUM', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '-', calVal: 40, byte: 2 },

//             CELL_TEMP_NUM: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'N', byte: 2 },
//             CELL_TEMP: { arrayType: 'AT', arrayTarget: 'CELL_TEMP_NUM', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '-', calVal: 40, byte: 2 },

//             ALARM_STATE: { arrayType: 'NA', reverseType: 'NR', returnType: 'IH', calType: 'N', byte: 4 },
//             FET_STATE: { arrayType: 'NA', reverseType: 'NR', returnType: 'IH', calType: 'N', byte: 2 },

//             LTC_BOARD_NUM: { arrayType: 'NA', reverseType: 'NR', returnType: 'IH', calType: 'N', byte: 2 },
//             BALAHCE_INFO: { arrayType: 'NA', reverseType: 'NR', returnType: 'IH', calType: 'N', byte: 4 },

//             SOC_NOW: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '/', calVal: 100, byte: 4 },
//             SOH_NOW: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '/', calVal: 100, byte: 4 },
//             SOC_FULL: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'Y', calUnit: '/', calVal: 10, byte: 4 },

//             CRC: { arrayType: 'NA', reverseType: 'NR', returnType: 'IHN', calType: 'N', byte: 2 }
//         }
//     }
// }

// TS
exports.protocolFormat = {
    MP: { byteType: 'BR', arrayType: 'NA', reverseType: 'R', returnType: 'H', calType: 'N', byte: [0, 3] },
    data: {
        summary: {
            SOC: { arrayType: 'NA', reverseType: 'R', returnType: 'N', calType: 'Y', calUnit: '/', calVal: 10, byte: 2 },
            USED_COUNT: { arrayType: 'NA', reverseType: 'R', returnType: 'N', calType: 'Y', calUnit: '/', calVal: 10, byte: 2 },
            FLAG1: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 },
            FET: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 },
            FLAG2: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 },
            MODE: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 },
            // CRC1: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 }
        },
        packvalue: {
            VOLT: { arrayType: 'NA', reverseType: 'R', returnType: 'N', calType: 'Y', calUnit: '/', calVal: 10, byte: 2 },
            CURR: { arrayType: 'NA', reverseType: 'R', returnType: 'SN', calType: 'Y', calUnit: '/', calVal: 10, byte: 2 },
            DC_CURR: { arrayType: 'NA', reverseType: 'R', returnType: 'N', calType: 'Y', calUnit: '/', calVal: 10, byte: 2 },
            C_CURR: { arrayType: 'NA', reverseType: 'R', returnType: 'N', calType: 'Y', calUnit: '/', calVal: 10, byte: 2 },
            // CRC2: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 }
        },
        temperature: {
            MAX_TP: { arrayType: 'NA', reverseType: 'R', returnType: 'SN', calType: 'N', byte: 1 },
            MIN_TP: { arrayType: 'NA', reverseType: 'R', returnType: 'SN', calType: 'N', byte: 1 },
            AVG_TP: { arrayType: 'NA', reverseType: 'R', returnType: 'SN', calType: 'N', byte: 1 },
            FET_TP: { arrayType: 'NA', reverseType: 'R', returnType: 'SN', calType: 'N', byte: 1 },
            // CRC3: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 }
        },
        slave_cell_volt_1_4: {
            S_VOLT_1: { arrayType: 'AN', arrayTarget: '4', reverseType: 'R', returnType: 'N', calType: 'Y', calUnit: '/', calVal: 1000, byte: 2 },
            // CRC4: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 }
        },
        slave_cell_volt_5_8: {
            S_VOLT_2: { arrayType: 'AN', arrayTarget: '4', reverseType: 'R', returnType: 'N', calType: 'Y', calUnit: '/', calVal: 1000, byte: 2 },
            // CRC5: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 }
        },
        slave_tp_1_2: {
            S_TP: { arrayType: 'AN', arrayTarget: '2', reverseType: 'R', returnType: 'SN', calType: 'N', byte: 1 },
            // CRC6: { arrayType: 'NA', reverseType: 'NR', returnType: 'N', calType: 'N', byte: 1 }
        },
    },
};

/**
 * [DB format]
 *
 * R0. MPTYPE(다중 프로토콜 타입) - 'Y': 다중 프로토콜 / 'N': 단일 프로토콜
 *
 * R1. loopType(루프 타입) - 'N': number / 'T': target / 'MT': Mutiple Target
 *
 * R2. saveType(저장 타입) - 'NS': no save / 'S': save
 *
 * R3. multiType(다중 타입) - 'O': one / 'M': multiple / 'MC': multiple chain
 * M인 경우
 *  -> R3-1. multiCalUnit(다중 계산 부호) - '+' / '-' / '*' / '/'
 *
 * R4. arrayType(배열 타입) - 'NA': no array / 'AI': array individual / 'AC': array cal / 'AO': array one
 * AC인 경우
 *  -> R4-1. arrayCal(배열 계산) - 'S': sum / 'A': average
 * AO인 경우
 *  -> R4-2. arrayIdx(배열 인덱스) - index값
 *
 * R5. changeType(변경 타입) - 'NC': no change / 'CN': changeNumber / 'CS': changeString
 *
 * R6. changeJson(변경 json) - json값
 *
 * R6. target(타겟)
 */
// IBT
// exports.dbFormat = {
//     LOOP: { loopType: 'T', saveType: 'NS', multiType:'O', arrayType:'NA', changeType:'NC', target: 'BAT_SERIAL_NUM' },

//     volt_sys: { saveType: 'S', multiType:'O', arrayType:'AO', arrayIdx: '0', changeType:'NC', target: 'VOLT' },
//     volt_mdl: { saveType: 'S', multiType: 'O', arrayType: 'AI', changeType:'NC', target: 'VOLT' },

//     curr_sys: { saveType: 'S', multiType: 'M', multiCalUnit: '+', arrayType: ['NA', 'NA'], changeType:'NC', target: ['CURR1', 'CURR2'] },

//     tp_sys: { saveType: 'S', multiType: 'O', arrayType: 'AI', changeType:'NC', target: 'SYS_TEMP' },
//     tp_mdl: { saveType: 'S', multiType: 'O', arrayType: 'AI', changeType:'NC', target: 'CELL_TEMP' },
//     tp_etc1: { saveType: 'S', multiType: 'O', arrayType: 'AI', changeType:'NC', target: 'FET_TEMP' },

//     chrg_stat_cd: { saveType: 'S', multiType: 'M', multiCalUnit: '+', arrayType: ['NA', 'NA'], changeType:'CN', changeJson: '{"0":"W","-":"C","+":"DC"}', target: ['CURR1', 'CURR2'] },

//     soc: { saveType: 'S', multiType: 'O', arrayType:'NA', changeType:'NC', target: 'SOC_NOW' },
//     soh: { saveType: 'S', multiType: 'O', arrayType:'NA', changeType:'NC', target: 'SOH_NOW' },

//     crc: { saveType: 'S', multiType: 'O', arrayType: 'NA', changeType:'NC', target: 'CRC' }
// }

// TS
exports.dbFormat = {
    LOOP: { loopType: 'MT', saveType: 'NS', multiType: 'MC', arrayType: ['AI', 'AI'], changeType: 'NC', target: ['S_VOLT_1', 'S_VOLT_2'] },

    volt_sys: { saveType: 'S', multiType: 'O', arrayType: 'NA', changeType: 'NC', target: 'VOLT' },
    volt_mdl: { saveType: 'S', multiType: 'MC', arrayType: ['AI', 'AI'], changeType: 'NC', target: ['S_VOLT_1', 'S_VOLT_2'] },

    curr_sys: { saveType: 'S', multiType: 'O', arrayType: 'NA', changeType: 'NC', target: 'CURR' },

    tp_sys: { saveType: 'S', multiType: 'O', arrayType: 'NA', changeType: 'NC', target: 'AVG_TP' },
    tp_mdl: { saveType: 'S', multiType: 'O', arrayType: 'AI', changeType: 'NC', target: 'S_TP' },

    chrg_stat_cd: { saveType: 'S', multiType: 'O', arrayType: 'NA', changeType: 'CN', changeJson: '{"0":"W","+":"C","-":"DC"}', target: 'CURR' },

    soc: { saveType: 'S', multiType: 'O', arrayType: 'NA', changeType: 'NC', target: 'SOC' },
};

// memo
/*

exports.dbFormat = {
    addr: { saveType: 'S', multiType:'O', arrayType:'NA', changeType:'NC', target: 'ADDRESS' },
    cmd: { saveType: 'S', multiType:'O', arrayType:'NA', changeType:'NC', target: 'CMD' },
    ver: { saveType: 'S', multiType:'O', arrayType:'NA', changeType:'NC', target: 'VERSION' },
    len: { saveType: 'S', multiType:'O', arrayType:'NA', changeType:'NC', target: 'LEN' },
    alarm_stat: { saveType: 'S', multiType:'O', arrayType:'NA', changeType:'NC', target: 'ALARM_STATE' },
    fet_stat: { saveType: 'S', multiType:'O', arrayType:'NA', changeType:'NC', target: 'FET_STATE' },
    ltc_brd_num: { saveType: 'S', multiType:'O', arrayType:'NA', changeType:'NC', target: 'LTC_BOARD_NUM' },
    bal_info: { saveType: 'S', multiType:'O', arrayType:'NA', changeType:'NC', target: 'BALAHCE_INFO' },
}

*/
