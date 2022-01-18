const moment = require('moment');
const WebSocket = require('ws');
const pako = require('pako');

const WS_URL = 'wss://api.huobi.pro/ws';


var orderbook = {};

exports.OrderBook = orderbook;

function handle(data) {
    // console.log('received', data.ch, 'data.ts', data.ts, 'crawler.ts', moment().format('x'));
    let symbol = data.ch.split('.')[1];
    let channel = data.ch.split('.')[2];
    switch (channel) {
        case 'depth':
            orderbook[symbol] = data.tick;
            break;
        case 'kline':
            console.log(symbol, data.tick);
            break;
    }
}

function subscribe(ws) {
    var symbols = ['btcusdt','ethusdt'];

    
    for (let symbol of symbols) {
        ws.send(JSON.stringify({
            "sub": `market.${symbol}.ticker`,
            "id": `${symbol}`
        }));
    }
}

function init() {
    var ws = new WebSocket(WS_URL);
    ws.on('open', () => {
        console.log('open');
        subscribe(ws);
    });
    ws.on('message', (data) => {
        let text = pako.inflate(data, {
            to: 'string'
        });
        let msg = JSON.parse(text);
        if (msg.ping) {
            ws.send(JSON.stringify({
                pong: msg.ping
            }));
        } else if (msg.tick) {
            var res = msg.ch.replace("usdt", "");
            var res = res.replace("market.", "");
            var res = res.replace(".ticker", "");
            var fiyat = msg.tick.close;
            if (fiyat>0) {
                console.log(res.toUpperCase()+' => Amount : '+fiyat+'');
              
               }
            
            //console.log(msg);
            handle(msg);
        } else {
            console.log(text);
        }
    });
    ws.on('close', () => {
        console.log('close');
        init();
    });
    ws.on('error', err => {
        console.log('error', err);
        init();
    });
}

init();
