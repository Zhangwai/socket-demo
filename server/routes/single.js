var express = require("express");
var router = express.Router();
const fs = require("fs");
const SparkMD5 = require("spark-md5");
const formidable = require("formidable");
const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);

const uploadDir = resolve("../upload");

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

// 基于FORM-DATA上传数据
router.post("/single1", async (req, res) => {
  let { files } = await handleMultiparty(req, res);
  console.log(files);
  let { file } = files;
  // console.log(file);
  let suffix = /\.([0-9a-zA-Z]+)$/.exec(file.originalFilename)[0];
  let readStream = fs.createReadStream(file.filepath);
  let writeStream = fs.createWriteStream(
    `${uploadDir}/${file.newFilename}${suffix}`
  );
  // 从读取流中读到的文件写到写入流中
  readStream.pipe(writeStream);
  readStream.on("end", function () {
    fs.unlinkSync(file.filepath);
    res.send({
      code: 0,
      originalFilename: file.originalFilename,
      path: `http://127.0.0.1:${process.env.PORT || "3000"}/upload/${
        file.newFilename + suffix
      }`,
    });
  });
});

// 上传BASE64
router.post("/single2", (req, res) => {
  let { chunk, filename } = req.body;

  // chunk的处理：转换为buffer
  chunk = decodeURIComponent(chunk);
  chunk = chunk.replace(/^data:image\/\w+;base64,/, "");
  chunk = Buffer.from(chunk, "base64");

  console.log(chunk);

  // 存储文件到服务器
  let spark = new SparkMD5.ArrayBuffer(),
    suffix = /\.([0-9a-zA-Z]+)$/.exec(filename)[1],
    path;
  spark.append(chunk);
  path = `${uploadDir}/${spark.end()}.${suffix}`;
  fs.writeFileSync(path, chunk);
  res.send({
    code: 0,
    originalFilename: filename,
    path: `http://127.0.0.1:${
      process.env.PORT || "3000"
    }/upload/${spark.end()}.${suffix}`,
  });
});

// 切片上传 && 合并;
router.post("/single3", async (req, res) => {
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
          resolve("../"),
          `http://127.0.0.1:${process.env.PORT || "3000"}/`
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
          resolve("../"),
          `http://127.0.0.1:${process.env.PORT || "3000"}/`
        ),
      });
    });
  });
});

module.exports = router;
