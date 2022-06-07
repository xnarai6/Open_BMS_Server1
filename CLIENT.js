const net = require('net');
const socket = new net.Socket();
const util = require('./modules/util.js');
const makedata = require('./modules/makedata.js');
const serverInfo = { host: '127.0.0.1', port: '4001' };

const brdNumArray = [
    'dc52b0d82ad17a29b5e86f5d7adb4cdce837c78d851b1806',
    'bf7cca40351cb7aa1df160d7fd871b958001a21cc1d9c9bd',
    'dda3a219c77d590fc78ec94432ad8bf30a1f32d545903b25',
    'eaf007ddc9fc5a358afa49c980fcf14ef58feec180fff3b1',
    'cb71125203485456c4d7cd7dc55e13e82432d2c091b4ce3c',
    '43384f7523bfcf1ea185553ffec94ab064929185d5b62d13',
    '1fc30a8a7571b1b9db1996ce8ec81a186bc71b2e1a0a02c1',
    '681fa145e9494efe756a31d41e192c73e0fcd6e817897250',
    '4f481662a159d5617fd2412b98c39edbdd582c3abd4894b8',
    '6bdc6d65f2e205b34be20df0e715cd929758fae3b1b74583',
];

socket.connect(serverInfo, () => {
    console.log('========== CONNECT ==========');

    // type: main 'TH' / main 'VC' / main 'LOC'
    // type: biz 'IBT' / biz 'TS'
    // type: res 'RESIP' / res 'RESPERIOD'
    // 1. type 정하기
    const type = 'TH';

    // 2. boardnum 정하기
    const boardnum = '4f481662a159d56166d2412b98c66edbdd582c3abdffffff';

    // 3. data 가져오기
    const data = makedata.data(type);

    // 4. head 가져오기
    const head = makedata.head(type, boardnum, data.length);

    // 5. tail 가져오기
    const tail = makedata.tail();

    // 6. 합하기
    const sendbuffer = Buffer.concat([head, data, tail]);
    const multipleBuffer = Buffer.concat([sendbuffer, sendbuffer]);

    // 7. 보내기
    // console.log(sendbuffer);
    // socket.write(sendbuffer);

    // 8. 여러개 보내기
    console.log(multipleBuffer);
    socket.write(multipleBuffer);

    // const sendType = makedata.CMDType.Loc;
    // const sendType = makedata.CMDType.RESIP;
    // const sendType = makedata.CMDType.RESPERIOD;
    // const boardNum = '8c55d483a26805036fa9b8e6b8f647b9271cd01e92f4fa72';
    // const boardNum = brdNumArray[getRandomInt(0, brdNumArray.length)];
    // const boardNum = '4f481662a159d56166d2412b98c66edbdd582c3abdffffff';

    // const head = makedata.head(sendType, boardNum);
    // const data = makedata.data.main(sendType);
    // const data = makedata.data.res(sendType);
    // const tail = makedata.tail();

    // const sendBuffer = Buffer.concat([head, data, tail]);
    // const sendBuffer = Buffer.from([
    //     0x02, 0x01, 0x00, 0x20, 0x0d, 0xa2, 0x4f, 0x48, 0x16, 0x62, 0xa1, 0x59, 0xd5, 0x61, 0x66, 0xd2, 0x41, 0x2b, 0x98, 0xc6, 0x6e, 0xdb, 0xdd, 0x58, 0x2c, 0x3a, 0xbd, 0xff, 0xff, 0xff, 0x01, 0x03, 0x02, 0x01, 0x00, 0x20, 0x0d, 0xa2, 0x4f, 0x48, 0x16, 0x62, 0xa1, 0x59, 0xd5, 0x61, 0x66, 0xd2, 0x41, 0x2b, 0x98, 0xc6, 0x6e, 0xdb, 0xdd, 0x58, 0x2c, 0x3a,
    //     0xbd, 0xff, 0xff, 0xff, 0x01, 0x03,
    // ]);

    // console.log('========== SEND DATA START ==========');
    // console.log(util.bufferOneLine(sendBuffer));
    // console.log('========== SEND DATA END ==========');

    // socket.write(sendBuffer);
});

socket.on('data', (data) => {
    console.log('FROM SERVER RESPONSE IS: ');
    console.log(util.bufferOneLine(data));

    let CMD = data.toString('hex', 4, 6).toUpperCase();
    if (CMD == '0DA1') {
        let ipData = data.slice(30, data.length - 2);
        console.log('IP/PORT DATA');
        console.log(util.bufferOneLine(ipData));
        let ip = ipData.slice(0, 4).join('.');
        let port = ipData.slice(4, 6).readUInt16BE();

        console.log(`IP: ${ip}`);
        console.log(`PORT: ${port}`);
    }

    if (CMD == '0DA2') {
        let periodData = data.slice(30, data.length - 2);
        console.log('PERIOD DATA');
        console.log(util.bufferOneLine(periodData));
        let tpArray = periodData.slice(0, 2);
        let locArray = periodData.slice(2, 4);
        let btryArray = periodData.slice(4, 6);

        console.log(`TP: ${tpArray[0]} ${matchPeriodType(tpArray[1])}`);
        console.log(`LOC: ${locArray[0]} ${matchPeriodType(locArray[1])}`);
        console.log(`BTRY: ${btryArray[0]} ${matchPeriodType(btryArray[1])}`);
    }
});
socket.on('end', () => {
    console.log('========== END ==========');
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function matchPeriodType(prevType) {
    if (Buffer.from([prevType]).toString('hex').toUpperCase() == '0A') return 'sec';
    if (Buffer.from([prevType]).toString('hex').toUpperCase() == '0B') return 'min';
    if (Buffer.from([prevType]).toString('hex').toUpperCase() == '0C') return 'hour';
}
