'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _wechatCrypto = require('wechat-crypto');

var _wechatCrypto2 = _interopRequireDefault(_wechatCrypto);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var builder = new _xml2js2.default.Builder({
  rootName: 'xml',
  headless: true,
  cdata: true,
  renderOpts: {
    pretty: false
  }
});

var Simulator = (function () {
  function Simulator(config) {
    _classCallCheck(this, Simulator);

    this.config = config;
    this.cryptor = new _wechatCrypto2.default(config.token, config.encodingAESKey, config.appid);
  }

  _createClass(Simulator, [{
    key: 'getRequestParams',
    value: function getRequestParams(message, mode) {
      var xml = undefined;
      var query = {
        timestamp: Date.now(),
        nonce: parseInt(Math.random() * 100000000000, 10)
      };

      if (mode === 0) {
        var shasum = _crypto2.default.createHash('sha1');
        var arr = [this.config.token, query.timestamp, query.nonce].sort();
        query.signature = shasum.update(arr.join('')).digest('hex');
        if (message) {
          xml = builder.buildObject(message);
        }
      } else {
        var encrypt = this.cryptor.encrypt(builder.buildObject(message));
        var encyptMsg = {
          ToUserName: message.ToUserName,
          Encrypt: encrypt
        };

        query.encrypt_type = 'aes';
        query.msg_signature = this.cryptor.getSignature(query.timestamp, query.nonce, encrypt);

        if (mode === 1) {
          _lodash2.default.extend(encyptMsg, message);
        }

        xml = builder.buildObject(encyptMsg);
      }

      return {
        xml: xml,
        query: query
      };
    }
  }, {
    key: 'send',
    value: function send(message, mode, callback) {
      if (typeof mode === 'function') {
        callback = mode;
        mode = 1;
      }

      var params = this.getRequestParams(message, mode);

      _request2.default.post({
        url: this.config.url + '?' + _querystring2.default.stringify(params.query),
        body: params.xml,
        headers: {
          'Content-Type': 'text/xml'
        }
      }, function (err, response, body) {
        callback(err, body);
      });
    }
  }, {
    key: 'verify',
    value: function verify(callback) {
      var params = this.getRequestParams(null, 0);
      params.query.echostr = Math.random().toString(36).substr(2, 15);

      _request2.default.get(this.config.url + '?' + _querystring2.default.stringify(params.query), function (err, response, body) {
        if (err) {
          return callback(err);
        }

        callback(null, params.query.echostr === body);
      });
    }
  }]);

  return Simulator;
})();

exports.default = Simulator;
//# sourceMappingURL=index.js.map
