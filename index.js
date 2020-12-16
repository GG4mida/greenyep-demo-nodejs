const express = require("express");
const md5 = require("md5-node");
const qs = require("qs");
const ejs = require("ejs");
const path = require("path");
const bodyParser = require("body-parser");
const axios = require("axios").default;

const { getTransactionData } = require("./core");

const { MERCHANT_TOKEN, API_TRANSACTION_CREATE } = require("./config");

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(express.static("public"));

app.set("views", path.join(__dirname, "/views"));
app.engine("html", ejs.__express);
app.set("view engine", "html");

/**
 * 首页
 */
app.get("/", (req, res) => {
  res.render("index");
});

/**
 * 订单提交
 */
app.post("/trans", (req, res) => {
  const { amount, type } = req.body;

  if (!amount || !type) {
    res.send("请求参数异常。");
  }

  // 生成订单数据
  const transactionData = getTransactionData(amount, type);

  // 请求参数设置
  const requestOptions = {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify(transactionData),
    url: API_TRANSACTION_CREATE,
  };

  axios(requestOptions)
    .then(function (response) {
      const { data } = response;

      const { code, content } = data;

      if (code === 400) {
        return res.send(content);
      }

      const {
        txn_id,
        amount,
        amount_pay,
        timeout,
        cashier_url,
        qrcode_url,
        query_url,
        signature,
      } = content;

      const signatureStr =
        txn_id +
        amount +
        amount_pay +
        timeout +
        cashier_url +
        qrcode_url +
        query_url +
        MERCHANT_TOKEN;
      const signatureData = md5(signatureStr);

      if (signatureData !== signature) {
        return res.send("签名串不匹配。");
      }

      // 这里可以跳转至 cashier_url（官方收银台），供用户支付。
      // 也可以使用返回的数据，自定义收银台。

      res.redirect(cashier_url);
    })
    .catch(function (error) {
      console.log(error);
    });
});

/**
 * 支付成功后同步跳转地址。
 * 跳转到该地址并不表示用户一定支付成功。
 * 需要根据订单号，查询相关订单是否已接收到通知回调成功的消息。
 * 如果已经接收到，则可以显示支付成功的信息。
 */
app.get("/result", (req, res) => {
  const { order_id } = req.query;

  console.info("同步回调处理，订单号为：", order_id);

  res.send(
    "请根据订单号，查询相关订单是否已接收到通知回调成功的消息。如果已经接收到，则可以显示支付成功的信息。"
  );
});

/**
 * 支付成功后通知回调地址
 * 可在此地址执行订单支付成功的逻辑，比如增加用户积分，延长服务时间等。
 */
app.post("/notify", (req, res) => {
  const { txn_id, order_id, amount, amount_pay, signature } = req.body;

  const signatureData = md5(
    txn_id + order_id + amount + amount_pay + MERCHANT_TOKEN
  );

  if (signatureData !== signature) {
    console.info("支付失败：加密串不匹配。");

    return res.send({
      code: 400,
      message: "faild",
    });
  }

  console.info(
    "支付成功：执行订单支付成功的逻辑，比如增加用户积分，延长服务时间等..."
  );

  return res.send({
    code: 200,
    message: "ok",
  });
});

app.listen(3000, () => {
  console.info("app listening on port 3000");
});
