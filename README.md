## wechat simulator
Wechat server simulation for sending event or message to user server, mostly used for debug.

### Install
`npm install wechat-simulator -S`

### Example
```js
var Simulator = require('wechat-simulator');

// wechat config must be the same with your server
var simulator = new Simulator({
  appid: 'wxf3db56459f30fe0e',
  token: 'YCbzZms6kOwejkrljKtvviBYgW0CRj0x',
  encodingAESKey: 'JVcCWVGjWJ0Ds5egUsRjNVpqJ8wPQAHfG0Ss5RfS1D3',
  url: 'https://lodejs.org/wechat/event'
});

// verify server
simulator.verify(function(err, pass) {
  console.log(err || pass);
}

// send message or event
simulator.send({
  ToUserName: 'gh_36a25f348d1e',
  FromUserName: 'o-hVKuLBPfFNJJbFPM5xq9PsWx9M',
  CreateTime: '1446175343',
  MsgType: 'event',
  Event: 'card_pass_check',
  CardId: 'p-hVLuMC-x2zMwD4kito8D0Aat_g'
}, function(err, data) {
  console.log(err || data);
});
```
