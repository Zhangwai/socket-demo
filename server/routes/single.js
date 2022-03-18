var express = require("express");
var router = express.Router();
const fs = require("fs");
const SparkMD5 = require("spark-md5");
const formidable = require("formidable");
const uploadDir = `${__dirname}/../upload`;

function handleMultiparty(req, res, temp) {
  return new Promise((resolve, reject) => {
    // multiparty的配置
    let options = {
      maxFieldsSize: 20 * 1024 * 1024,
      multiples: true,
    };
    !temp ? (options.uploadDir = uploadDir) : null;
    let form = formidable(options);
    // console.log(form);
    // multiparty解析
    form.parse(req, function (err, fields, files) {
      if (err) {
        res.send({
          code: 1,
          reason: err,
        });
        reject(err);
        return;
      }
      resolve({
        fields,
        files,
      });
    });
  });
}

// 切片上传 && 合并;
router.post("/", async (req, res) => {
  console.log("single3");
  let { fields, files } = await handleMultiparty(req, res, true);
  let { chunk } = files,
    { filename } = fields;
  let hash = /([0-9a-zA-Z]+)_\d+/.exec(filename)[1],
    // suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1],
    path = `${uploadDir}/${hash}`;
  !fs.existsSync(path) ? await fs.mkdirSync(path) : null;
  path = `${path}/${filename}`;
  console.log(path);
  fs.access(path, async (err) => {
    // 存在的则不再进行任何的处理
    if (!err) {
      res.send({
        code: 2, // 已存在
        path: path.replace(
          __dirname,
          `http://127.0.0.1:${process.env.PORT || "3000"}`
        ),
      });
      console.log("已存在退出");
      return;
    }

    // 为了测试出效果，延迟1秒钟
    // await new Promise((resolve) => {
    //   setTimeout((_) => {
    //     resolve();
    //   }, 200);
    // });

    // 不存在的再创建
    let readStream = fs.createReadStream(chunk.filepath);
    let writeStream = fs.createWriteStream(path);
    // 从读取流中读到的文件写到写入流中
    readStream.pipe(writeStream);
    readStream.on("end", function () {
      fs.unlinkSync(chunk.filepath);
      res.send({
        code: 0,
        path: path.replace(
          __dirname,
          `http://127.0.0.1:${process.env.PORT || "3000"}`
        ),
      });
    });
  });
});

module.exports = router;
