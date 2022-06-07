exports.selectSeqByBoardnum = (boardnum) => {
    let query = 'SELECT tpf.cmpy_seq, tpf.btry_seq';
    query += ' FROM TBL_PTC_FMT tpf';
    query += ' WHERE tpf.brd_num = "' + boardnum + '"';

    return query;
};

exports.insertMainProtocol = (cmdName) => {
    let query = '';
    if (cmdName == 'TH') query = 'INSERT INTO TBL_PTC_MN_TH SET ?';
    if (cmdName == 'VC') query = 'INSERT INTO TBL_PTC_MN_VC SET ?';
    if (cmdName == 'LOC') query = 'INSERT INTO TBL_PTC_MN_LOC SET ?';

    return query;
};

exports.insertLastProtocol = (cmdName) => {
    let query = '';
    if (cmdName == 'LOC') {
        query += 'INSERT INTO TBL_BTRY_LAST_STAT(btry_seq, last_loc_dttm, lat, lon, ins_nm, ins_dttm, upd_nm, upd_dttm)';
        query += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        query += ' ON DUPLICATE KEY UPDATE';
        query += ' last_loc_dttm = VALUES(last_loc_dttm), lat = VALUES(lat), lon = VALUES(lon), upd_nm = VALUES(upd_nm), upd_dttm = VALUES(upd_dttm)';
    }
    if (cmdName == 'TH') {
        query += 'INSERT INTO TBL_BTRY_LAST_STAT(btry_seq, last_th_dttm, tp1, hd1, ins_nm, ins_dttm, upd_nm, upd_dttm)';
        query += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        query += ' ON DUPLICATE KEY UPDATE';
        query += ' last_th_dttm = VALUES(last_th_dttm), tp1 = VALUES(tp1), hd1 = VALUES(hd1), upd_nm = VALUES(upd_nm), upd_dttm = VALUES(upd_dttm)';
    }
    if (cmdName == 'VC') {
        query += 'INSERT INTO TBL_BTRY_LAST_STAT(btry_seq, last_vc_dttm, volt, curr, ins_nm, ins_dttm, upd_nm, upd_dttm)';
        query += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        query += ' ON DUPLICATE KEY UPDATE';
        query += ' last_vc_dttm = VALUES(last_vc_dttm), volt = VALUES(volt), curr = VALUES(curr), upd_nm = VALUES(upd_nm), upd_dttm = VALUES(upd_dttm)';
    }
    if (cmdName == 'BIZ') {
        query += 'INSERT INTO TBL_BTRY_LAST_STAT(btry_seq, last_biz_dttm, chrg_stat_cd, volt_sys, curr_sys, tp_sys, soc, soh, ins_nm, ins_dttm, upd_nm, upd_dttm)';
        query += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        query += ' ON DUPLICATE KEY UPDATE';
        query += ' last_biz_dttm = VALUES(last_biz_dttm), chrg_stat_cd = VALUES(chrg_stat_cd), volt_sys = VALUES(volt_sys), curr_sys = VALUES(curr_sys), tp_sys = VALUES(tp_sys), soc = VALUES(soc), soh = VALUES(soh), upd_nm = VALUES(upd_nm), upd_dttm = VALUES(upd_dttm)';
    }

    return query;
};

exports.insertBizProtocol = () => {
    let query = '';
    query += ' INSERT INTO TBL_PTC_BIZ_DATA(';
    query += ' brd_num, biz_key, biz_dt, biz_h, biz_m,';
    query += ' cmpy_seq, btry_seq, ptc_cmd, cmd,';
    query += ' len, alarm_stat, fet_stat,';
    query += ' volt_sys, volt_mdl, volt_etc1, curr_sys, curr_mdl,';
    query += ' curr_etc1, tp_sys, tp_mdl, tp_etc1, chrg_stat_cd,';
    query += ' soc, soh, crc, ins_nm, ins_dttm';
    query += ' ) VALUES ?';

    return query;
};

exports.insertBizRawProtocol = () => {
    let query = 'INSERT INTO TBL_PTC_BIZ_DATA_RAW SET ?';

    return query;
};

exports.insertLastStat = (type) => {
    let query = '';
    if (type == 'LOC') {
        query += 'INSERT INTO TBL_BTRY_LAST_STAT(btry_seq, last_loc_dttm, lat, lon, ins_nm, ins_dttm, upd_nm, upd_dttm)';
        query += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        query += ' ON DUPLICATE KEY UPDATE';
        query += ' last_loc_dttm = VALUES(last_loc_dttm), lat = VALUES(lat), lon = VALUES(lon), upd_nm = VALUES(upd_nm), upd_dttm = VALUES(upd_dttm)';
    }
    if (type == 'TH') {
        query += 'INSERT INTO TBL_BTRY_LAST_STAT(btry_seq, last_th_dttm, tp1, hd1, ins_nm, ins_dttm, upd_nm, upd_dttm)';
        query += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        query += ' ON DUPLICATE KEY UPDATE';
        query += ' last_th_dttm = VALUES(last_th_dttm), tp1 = VALUES(tp1), hd1 = VALUES(hd1), upd_nm = VALUES(upd_nm), upd_dttm = VALUES(upd_dttm)';
    }
    if (type == 'VC') {
        query += 'INSERT INTO TBL_BTRY_LAST_STAT(btry_seq, last_vc_dttm, volt, curr, ins_nm, ins_dttm, upd_nm, upd_dttm)';
        query += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        query += ' ON DUPLICATE KEY UPDATE';
        query += ' last_vc_dttm = VALUES(last_vc_dttm), volt = VALUES(volt), curr = VALUES(curr), upd_nm = VALUES(upd_nm), upd_dttm = VALUES(upd_dttm)';
    }
    if (type == 'BIZ') {
        query += 'INSERT INTO TBL_BTRY_LAST_STAT(btry_seq, last_biz_dttm, chrg_stat_cd, volt_sys, curr_sys, tp_sys, soc, soh, ins_nm, ins_dttm, upd_nm, upd_dttm)';
        query += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        query += ' ON DUPLICATE KEY UPDATE';
        query += ' last_biz_dttm = VALUES(last_biz_dttm), chrg_stat_cd = VALUES(chrg_stat_cd), volt_sys = VALUES(volt_sys), curr_sys = VALUES(curr_sys), tp_sys = VALUES(tp_sys), soc = VALUES(soc), soh = VALUES(soh), upd_nm = VALUES(upd_nm), upd_dttm = VALUES(upd_dttm)';
    }

    return query;
};

exports.selectHour = (start, end) => {
    // let query = 'SELECT';
    //     query += '     a.btry_seq,';
    //     query += '     SUM(IF(a.chrg_stat_cd = "C", 1, 0)) AS "C", SUM(IF(a.chrg_stat_cd = "DC", 1, 0)) AS "DC", SUM(IF(a.chrg_stat_cd = "W", 1, 0)) AS "W",';
    //     query += '     MAX(a.volt_max) AS volt_max, MIN(a.volt_min) AS volt_min,';
    //     query += '     MAX(a.curr_max) AS curr_max, MIN(a.curr_min) AS curr_min,';
    //     query += '     MAX(a.tp_max) AS tp_max, MIN(a.tp_min) AS tp_min,';
    //     query += '     ROUND(AVG(a.soc), 4) AS soc, ROUND(AVG(a.soh), 4) AS soh';
    //     query += ' FROM (';
    //     query += '     SELECT';
    //     query += '         tpbd.btry_seq, tpbd.chrg_stat_cd,';
    //     query += '         MAX(tpbd.volt_sys) AS volt_max, MIN(tpbd.volt_sys) AS volt_min,';
    //     query += '         MAX(tpbd.curr_sys) AS curr_max, MIN(tpbd.curr_sys) AS curr_min,';
    //     query += '         MAX(tpbd.tp_sys) AS tp_max, MIN(tpbd.tp_sys) AS tp_min,';
    //     query += '         ROUND(AVG(tpbd.soc), 4) AS soc, ROUND(AVG(tpbd.soh), 4) AS soh,';
    //     query += '         LEFT(tpbd.biz_key, 12) AS biz_dthm';
    //     query += '     FROM TBL_PTC_BIZ_DATA tpbd';
    //     query += '     WHERE CONCAT(tpbd.biz_dt, tpbd.biz_h) >= "' + start + '"';
    //     query += '     AND CONCAT(tpbd.biz_dt, tpbd.biz_h) < "' + end + '"';
    //     query += '     GROUP BY tpbd.btry_seq, LEFT(tpbd.biz_key, 12)';
    //     query += '     ORDER BY LEFT(tpbd.biz_key, 12) ASC';
    //     query += ' ) a';
    //     query += ' GROUP BY a.btry_seq';

    // let query2 = 'SELECT';
    //     query2 += '     LEFT(tpbd.biz_key, 10) AS biz_dth,';
    //     query2 += '     tpbd.cmpy_seq, tpbd.btry_seq,';
    //     query2 += '     MAX(tpbd.volt_sys) AS volt_max, MIN(tpbd.volt_sys) AS volt_min,';
    //     query2 += '     MAX(tpbd.curr_sys) AS curr_max, MIN(tpbd.curr_sys) AS curr_min,';
    //     query2 += '     MAX(tpbd.tp_sys) AS tp_max, MIN(tpbd.tp_sys) AS tp_min,';
    //     query2 += '     ROUND(AVG(tpbd.soc), 4) AS soc, ROUND(AVG(tpbd.soh), 4) AS soh';
    //     query2 += ' FROM TBL_PTC_BIZ_DATA2 tpbd';
    //     query2 += ' WHERE LEFT(tpbd.biz_key, 10) = "' + start + '"';
    //     query2 += ' GROUP BY tpbd.cmpy_seq, tpbd.btry_seq, LEFT(tpbd.biz_key, 10)';

    let query2 = 'SELECT';
    query2 += '     e.cmpy_seq, e.btry_seq,';
    query2 += '     TRUNCATE(e.C / 60, 0) AS C, TRUNCATE(e.DC / 60, 0) AS DC, TRUNCATE(e.W / 60, 0) AS W,';
    query2 += '     e.C_cnt, e.DC_cnt,';
    query2 += '     f.volt_max, f.volt_min, f.curr_max, f.curr_min, f.tp_max, f.tp_min, f.soc, f.soh';
    query2 += ' FROM (';
    query2 += '     SELECT';
    query2 += '     	d.cmpy_seq, d.btry_seq,';
    query2 += '         SUM(d.C) AS C, SUM(d.DC) AS DC, (3600 - SUM(d.C) - SUM(d.DC)) AS W,';
    query2 += '         SUM(IF(d. type_cd = "C", 1, 0)) AS C_cnt,';
    query2 += '         SUM(IF(d. type_cd = "DC", 1, 0)) AS DC_cnt';
    query2 += '     FROM (';
    query2 += '         SELECT';
    query2 += '             c.cmpy_seq, c.btry_seq, c.type_cd,';
    query2 += '             IFNULL(CASE WHEN c.type_cd = "C" THEN sec END, 0) AS C,';
    query2 += '             IFNULL(CASE WHEN c.type_cd = "DC" THEN sec END, 0) AS DC';
    query2 += '         FROM (';
    query2 += '             SELECT';
    query2 += '                 a.cmpy_seq, a.btry_seq, b.type_cd,';
    query2 += '                 TIMESTAMPDIFF(SECOND, IF(STR_TO_DATE("' + start + '", "%Y%m%d%H") > b.start_dttm, STR_TO_DATE("' + start + '", "%Y%m%d%H"), b.start_dttm), b.end_dttm) AS sec';
    query2 += '             FROM (';
    query2 += '                 SELECT tpbd.cmpy_seq, tpbd.btry_seq';
    query2 += '                 FROM TBL_PTC_BIZ_DATA tpbd';
    query2 += '                 WHERE LEFT(tpbd.biz_key, 10) = "' + start + '"';
    query2 += '                 GROUP BY tpbd.cmpy_seq, tpbd.btry_seq, LEFT(tpbd.biz_key, 10)';
    query2 += '             ) a';
    query2 += '             LEFT OUTER JOIN (';
    query2 += '                 SELECT tpbs.cmpy_seq, tpbs.btry_seq, tpbs.type_cd, tpbs.start_key, tpbs.start_dttm, tpbs.end_dttm';
    query2 += '                 FROM TBL_PTC_BIZ_STAT tpbs';
    query2 += '                 WHERE';
    query2 += '                 (';
    query2 += '                     DATE_FORMAT(tpbs.start_dttm, "%Y%m%d%H") < "' + start + '"';
    query2 += '                     AND DATE_FORMAT(tpbs.end_dttm, "%Y%m%d%H") >= "' + start + '"';
    query2 += '                 ) OR (';
    query2 += '                     DATE_FORMAT(tpbs.start_dttm, "%Y%m%d%H") >= "' + start + '"';
    query2 += '                     AND DATE_FORMAT(tpbs.start_dttm, "%Y%m%d%H") < "' + end + '"';
    query2 += '                 )';
    query2 += '             ) b';
    query2 += '             ON a.cmpy_seq = b.cmpy_seq';
    query2 += '             AND a.btry_seq = b.btry_seq';
    query2 += '         ) c';
    query2 += '     ) d';
    query2 += '     GROUP BY d.cmpy_seq, d.btry_seq';
    query2 += ' ) e';
    query2 += ' LEFT OUTER JOIN (';
    query2 += '     SELECT';
    query2 += '         tpbd2.cmpy_seq, tpbd2.btry_seq,';
    query2 += '         MAX(tpbd2.volt_sys) AS volt_max, MIN(tpbd2.volt_sys) AS volt_min,';
    query2 += '         MAX(tpbd2.curr_sys) AS curr_max, MIN(tpbd2.curr_sys) AS curr_min,';
    query2 += '         MAX(tpbd2.tp_sys) AS tp_max, MIN(tpbd2.tp_sys) AS tp_min,';
    query2 += '         ROUND(AVG(tpbd2.soc), 4) AS soc, ROUND(AVG(tpbd2.soh), 4) AS soh';
    query2 += '     FROM TBL_PTC_BIZ_DATA tpbd2';
    query2 += '     WHERE LEFT(tpbd2.biz_key, 10) = "' + start + '"';
    query2 += '     GROUP BY tpbd2.cmpy_seq, tpbd2.btry_seq, LEFT(tpbd2.biz_key, 10)';
    query2 += ' ) f';
    query2 += ' ON e.cmpy_seq = f.cmpy_seq';
    query2 += ' AND e.btry_seq = f.btry_seq';

    return query2;
};

exports.selectDay = (date) => {
    let query = 'SELECT';
    query += '     tsh.cmpy_seq, tsh.btry_seq,';
    query += '     SUM(IFNULL(tsh.avg_chrg_time, 0)) AS C, SUM(IFNULL(tsh.avg_dischrg_time, 0)) AS DC, (1440 - SUM(IFNULL(tsh.avg_chrg_time, 0)) - SUM(IFNULL(tsh.avg_dischrg_time, 0))) AS W,';
    query += '     SUM(IFNULL(tsh.chrg_cnt, 0)) AS C_cnt, SUM(IFNULL(tsh.chk_cnt, 0)) AS chk_cnt, SUM(IFNULL(tsh.event_cnt, 0)) AS event_cnt,';
    query += '     MAX(IFNULL(tsh.max_volt, 0)) AS max_volt, MIN(IFNULL(tsh.min_volt, 0)) AS min_volt,';
    query += '     MAX(IFNULL(tsh.max_curr, 0)) AS max_curr, MIN(IFNULL(tsh.min_curr, 0)) AS min_curr,';
    query += '     MAX(IFNULL(tsh.max_tp, 0)) AS max_tp, MIN(IFNULL(tsh.min_tp, 0)) AS min_tp,';
    query += '     ROUND(AVG(IFNULL(tsh.avg_soc, 0)), 4) AS soc, ROUND(AVG(IFNULL(tsh.avg_soh, 0)), 4) AS soh';
    query += ' FROM TBL_STTC_HOUR tsh';
    query += ' WHERE tsh.sttc_dt = "' + date + '"';
    query += ' GROUP BY tsh.cmpy_seq, tsh.btry_seq, tsh.sttc_dt = "' + date + '"';

    return query;
};

exports.selectMonth = (month) => {
    let query = 'SELECT';
    query += '     tsd.cmpy_seq, tsd.btry_seq,';
    query += '     SUM(IFNULL(tsd.avg_chrg_time, 0)) AS C, SUM(IFNULL(tsd.avg_dischrg_time, 0)) AS DC, (DATE_FORMAT(LAST_DAY(CONCAT("' + month + '", "01")), "%d") * 24 * 60 - SUM(IFNULL(tsd.avg_chrg_time, 0)) - SUM(IFNULL(tsd.avg_dischrg_time, 0)))  AS W,';
    query += '     SUM(IFNULL(tsd.chrg_cnt, 0)) AS C_cnt, SUM(IFNULL(tsd.chk_cnt, 0)) AS chk_cnt, SUM(IFNULL(tsd.event_cnt, 0)) AS event_cnt,';
    query += '     ROUND(AVG(IFNULL(tsd.avg_soc, 0)), 4) AS soc, ROUND(AVG(IFNULL(tsd.avg_soh, 0)), 4) AS soh,';
    query += '     MAX(IFNULL(tsd.max_volt, 0)) AS max_volt, MIN(IFNULL(tsd.min_volt, 0)) AS min_volt,';
    query += '     MAX(IFNULL(tsd.max_curr, 0)) AS max_curr, MIN(IFNULL(tsd.min_curr, 0)) AS min_curr,';
    query += '     MAX(IFNULL(tsd.max_tp, 0)) AS max_tp, MIN(IFNULL(tsd.min_tp, 0)) AS min_tp';
    query += ' FROM TBL_STTC_DAY tsd';
    query += ' WHERE DATE_FORMAT(tsd.sttc_dt, "%Y%m") = "' + month + '"';
    query += ' GROUP BY tsd.cmpy_seq, tsd.btry_seq, DATE_FORMAT(tsd.sttc_dt, "%Y%m") = "' + month + '"';

    return query;
};

exports.insertSTTC = (type) => {
    let query = '';
    if (type == 'MNG') query = 'INSERT INTO TBL_STTC_MNG SET ?';

    if (type == 'H') {
        query = 'INSERT INTO TBL_STTC_HOUR(';
        query += ' cmpy_seq, btry_seq,';
        query += ' sttc_dt, sttc_hour,';
        query += ' comment,';
        query += ' avg_chrg_time, avg_dischrg_time, avg_standby_time,';
        query += ' chrg_cnt,';
        query += ' max_volt, min_volt, max_curr, min_curr, max_tp, min_tp,';
        query += ' avg_soc, avg_soh, ins_nm, ins_dttm';
        query += ' ) VALUES ?';
    }

    if (type == 'D') {
        query = 'INSERT INTO TBL_STTC_DAY(';
        query += ' cmpy_seq, btry_seq,';
        query += ' sttc_dt, sttc_dayweek,';
        query += ' comment,';
        query += ' avg_chrg_time, avg_dischrg_time, avg_standby_time,';
        query += ' chrg_cnt, chk_cnt, event_cnt,';
        query += ' max_volt, min_volt, max_curr, min_curr, max_tp, min_tp,';
        query += ' avg_soc, avg_soh, ins_nm, ins_dttm';
        query += ' ) VALUES ?';
    }

    if (type == 'M') {
        query = 'INSERT INTO TBL_STTC_MONTH(';
        query += ' cmpy_seq, btry_seq,';
        query += ' sttc_dt, sttc_month,';
        query += ' comment,';
        query += ' avg_chrg_time, avg_dischrg_time, avg_standby_time,';
        query += ' chrg_cnt, chk_cnt, event_cnt,';
        query += ' max_volt, min_volt, max_curr, min_curr, max_tp, min_tp,';
        query += ' avg_soc, avg_soh, ins_nm, ins_dttm';
        query += ' ) VALUES ?';
    }

    return query;
};
