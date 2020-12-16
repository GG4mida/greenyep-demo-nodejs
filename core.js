const md5 = require("md5-node");

const { MERCHANT_ID, MERCHANT_TOKEN } = require("./config");

/**
 * 获取指定长度字符串
 * @param {int} len - 字符串长度
 */
function getRandomCode(len) {
  let str = "";
  const strPol = "abcdefghijklmnopqrstuvwxyz0123456789";
  const max = strPol.length - 1;

  for (let i = 0; i < len; i++) {
    str += strPol.charAt(Math.floor(Math.random() * max));
  }
  return str;
}

/**
 * 获取订单信息
 * @param {float} amount - 订单金额
 * @param {int} type - 支付类型
 */
function getTransactionData(amount, type) {
  // 商户的 uid
  // 必填
  const transMerchId = MERCHANT_ID;

  // 商户的 token
  // 必填
  const transMerchToken = MERCHANT_TOKEN;

  // 支付金额
  // 必填
  const transAmount = amount;

  // 收款账号
  // 选填
  const transAccount = "";

  // 支付类型，支付宝 = 1，微信 = 2
  // 必填
  const transType = type;

  // 支付成功后异步通知地址，必须是公网地址
  // 必填
  const transNotifyUrl = "http://127.0.0.1:3000/notify";

  // 支付成功后同步跳转地址，必须是公网地址
  const transRedirectUrl = "http://127.0.0.1:3000/result";

  // 自定义订单号
  // 选填
  const transOrderId = getRandomCode(12);

  // 自定义用户编号
  // 选填
  const transCustomerId = getRandomCode(12);

  // 商品名称
  // 选填
  const transProductName = "TEST PRODUCT NAME";

  // 安全校验串
  const transSignatureStr =
    transMerchId +
    transAmount +
    transType +
    transAccount +
    transOrderId +
    transCustomerId +
    transProductName +
    transNotifyUrl +
    transRedirectUrl +
    transMerchToken;
  const transSignature = md5(transSignatureStr);

  const transData = {
    uid: transMerchId,
    amount: transAmount,
    account: transAccount,
    type: transType,
    notify_url: transNotifyUrl,
    redirect_url: transRedirectUrl,
    order_id: transOrderId,
    customer_id: transCustomerId,
    product_name: transProductName,
    signature: transSignature,
  };

  return transData;
}

module.exports = {
  getTransactionData,
};
