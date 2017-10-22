// From BayMinimum/MealTweet
const offlineData = require("./snack_offline")
module.exports=function (callback) {
    'use strict';
    let cheerio = require('cheerio');
    let http = require('http');
    let time = require('time');

    let now = new time.Date()
    now.setTimezone("Asia/Seoul")
    const lookupDate = generateLookupDate(now.getFullYear(), now.getMonth(), now.getDate())

    let options = {
        host: "gaonnuri.ksain.net",
        path: "/xe/?mid=login"
    };

    // get html data from school website
    let data = "";
    let request = http.request(options, function (res) {
        res.setEncoding("utf8");
        res.on('data', function (chunk) {
            data += chunk;
            console.log("received chunk");
        });
        res.on('end', function () {
            parseSnack(data);
        });
    });

    let parseSnack =function (html) {
        console.log(html)
        let $ = cheerio.load(html, {decodeEntities: false}); // option to avoid unicode hangul issue

        let dd=now.getDate();

        let snack = $(".snack").first().parent().find(".menu").html()
        if (snack.indexOf("정보") >= 0 && snack.indexOf("없음") >= 0) snack = false
        try {
            if(snack.charAt(0)===' ') snack = snack.substring(1, snack.length);
        }catch(exception){
            console.log(exception);
            console.log("Substring operation for snack failed!");
        }
        if (!snack) snack = offlineData[lookupDate]
        if (!snack) snack = ""
        callback(snack)
    };

    request.on('error', function () {
        console.log("Network error");
        console.log(lookupDate)
        let snack = offlineData[lookupDate]
        if (!snack) snack = ""
        callback(snack)
    });

    request.end();

};


function generateLookupDate(yyyy, mm, dd) {
    let target = `${yyyy}-`
    if (mm < 10) target += `0${mm}-`
    else target += `${mm}-`
    if (dd < 10) target += `0${dd}`
    else target += `${dd}`
    return target
}