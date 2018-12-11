// From BayMinimum/MealTweet
const offlineData = require("./meal_offline")
module.exports = function (callback) {
  'use strict';
  let cheerio = require('cheerio');
  let https = require('https');
  let time = require('time');

  let now = new time.Date();
  now.setTimezone("Asia/Seoul");
  const yyyy = now.getFullYear();
  const mm = now.getMonth() + 1;
  const dd = now.getDate();

  let options = {
    host: "ksa.hs.kr",
    path: "/Home/CafeteriaMenu/72",
    rejectUnauthorized: false,
    agent: false
  };

  // get html data from school website
  let data = "";
  let request = https.request(options, function (res) {
    res.setEncoding("utf8");
    res.on('data', function (chunk) {
      data += chunk;
      console.log("received chunk");
    });
    res.on('end', function () {
      parseMeal(data);
    });
  });

  request.on('error', function () {
    console.log("Network error");
  });

  request.end();

  // pass meal as [breakfast, lunch, dinner] to callback func
  let parseMeal = function (html) {
    let $ = cheerio.load(html, {decodeEntities: false}); // option to avoid unicode hangul issue
    findMeal($, yyyy, mm, dd, (todayMeal) => {
      findMeal($, yyyy, mm, dd + 1, (tomorrowMeal) => {
        callback([todayMeal, tomorrowMeal])
      })
    })
  };

};

function generateLookupDate(yyyy, mm, dd) {
  let target = `${yyyy}-`;
  if (mm < 10) target += `0${mm}-`;
  else target += `${mm}-`;
  if (dd < 10) target += `0${dd}`;
  else target += `${dd}`;
  return target
}

function emojifyAllergyInfo(mealstr){
  return mealstr.replace(/①/g, "🥚")
                .replace(/②/g, "🥛")
                .replace(/③/g, "(메밀)")
                .replace(/④/g, "🥜")
                .replace(/⑤/g, "🇧")
                .replace(/⑥/g, "🍞")
                .replace(/⑦/g, "🐟")
                .replace(/⑧/g, "🦀")
                .replace(/⑨/g, "🍤")
                .replace(/⑩/g, "🐷")
                .replace(/⑪/g, "🍑")
                .replace(/⑫/g, "🍅")
                .replace(/⑬/g, "(아황산류)")
                .replace(/⑭/g, "(호두)")
                .replace(/⑮/g, "🐔")
                .replace(/⑯/g, "🐂")
                .replace(/⑰/g, "🦑")
                .replace(/⑱/g, "🐚")
                .replace(/⑲/g, "🌲")
}

function findMeal($, yyyy, mm, dd, callback) {
  let lookupDate = generateLookupDate(yyyy, mm, dd);
  let flag = false
  let meal = ["", "", ""];
  $(".meal-con").find('tr').each((i, elem) => {
    if ($(elem).find('th').toString().indexOf(lookupDate) >= 0) {
      $(elem).find('li').each((j, elem) => {
          let chunk = $(elem).toString()
            .replace("<li>", "")
            .replace("</li>", "")
            .replace(/ /g, "")
            .replace(/amp;/g, "")
            .replace("[조식]", "")
            .replace("[중식]", "")
            .replace("[석식]", "")
            .replace(/,/g, "\n")
            .replace(/\n\n/g, "\n");
          try {
            if (chunk.charAt(chunk.length - 1) === '\n') chunk = chunk.substring(0, chunk.length - 1);
          } catch (exception) {
            console.log(exception);
            console.log("Substring operation for meal chunk failed!");
          }
          meal[j] = chunk;
        }
      );
      flag = true
    }
  });

  if (!flag) {
    let k = 0
    while (k < 3) {
      if (!meal[k]) meal[k] = offlineData[k][lookupDate]
      if (!meal[k]) meal[k] = ""
      k += 1
    }
  }

  k = 0
  while (k < 3) {
    meal[k] = emojifyAllergyInfo(meal[k])
    k += 1
  }

  callback(meal)
}