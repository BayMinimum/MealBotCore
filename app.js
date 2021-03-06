const meal = require("./meal");
const snack = require("./snack");

module.exports.getData = function (req, res) {
  if (req.body.type == "meal") {
    meal((data) => {
      res.status(200).send(JSON.stringify(data)).end()
    }, req.body.date)
  } else if (req.body.type == "snack") {
    snack((data) => {
      res.status(200).send(data).end()
    })
  }
};
