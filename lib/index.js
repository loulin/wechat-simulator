import xml2js from 'xml2js';
import _ from 'lodash';
import crypto from 'crypto';
import WXBizMsgCrypt from 'wechat-crypto';
import request from 'request';
import querystring from 'querystring';

let builder = new xml2js.Builder({
  rootName: 'xml',
  headless: true,
  cdata: true,
  renderOpts: {
    pretty: false
  }
});

export default class Simulator {
  constructor(config) {
    this.config = config;
    this.cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.appid);
  }

  getRequestParams(message, mode) {
    let xml;
    let query = {
      timestamp: Date.now(),
      nonce: parseInt((Math.random() * 100000000000), 10)
    };

    if (mode === 0) {
      let shasum = crypto.createHash('sha1');
      let arr = [this.config.token, query.timestamp, query.nonce].sort();
      query.signature = shasum.update(arr.join('')).digest('hex');
      if (message) {
        xml = builder.buildObject(message);
      }
    } else {
      let encrypt = this.cryptor.encrypt(builder.buildObject(message));
      let encyptMsg = {
        ToUserName: message.ToUserName,
        Encrypt: encrypt
      };

      query.encrypt_type = 'aes';
      query.msg_signature = this.cryptor.getSignature(query.timestamp, query.nonce, encrypt);

      if (mode === 1) {
        _.extend(encyptMsg, message);
      }

      xml = builder.buildObject(encyptMsg);
    }

    return {
      xml: xml,
      query: query
    };
  }

  send(message, mode, callback) {
    if (typeof mode === 'function') {
      callback = mode;
      mode = 1;
    }

    let params = this.getRequestParams(message, mode);

    request.post({
      url: this.config.url + '?' + querystring.stringify(params.query),
      body: params.xml,
      headers: {
        'Content-Type': 'text/xml'
      }
    }, function(err, response, body) {
      callback(err, body);
    });
  }

  verify(callback) {
    let params = this.getRequestParams(null, 0);
    params.query.echostr = Math.random().toString(36).substr(2, 15);

    request.get(this.config.url + '?' + querystring.stringify(params.query), function(err, response, body) {
      if (err) {
        return callback(err);
      }

      callback(null, params.query.echostr === body)
    });

  }
}
