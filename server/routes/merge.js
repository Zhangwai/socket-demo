var express = require("express");
var router = express.Router();
const fs = require("fs");
const uploadDir = `${__dirname}/../upload`;

/* GET home page. */
router.get("/", (req, res) => {
  let { hash } = req.query;
  console.log(hash);
  let path = `${uploadDir}/${hash}`,
    fileList = fs.readdirSync(path),
    suffix;
  fileList
    .sort((a, b) => {
      let reg = /_(\d+)/;
      return reg.exec(a)[1] - reg.exec(b)[1];
    })
    .forEach((item) => {
      !suffix ? (suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1]) : null;
      fs.appendFileSync(
        `${uploadDir}/${hash}.${suffix}`,
        fs.readFileSync(`${path}/${item}`)
      );
      fs.unlinkSync(`${path}/${item}`);
    });
  fs.rmdirSync(path);
  res.send({
    code: 0,
    path: `http://127.0.0.1:${
      process.env.PORT || "3000"
    }/upload/${hash}.${suffix}`,
  });
});

module.exports = router;
