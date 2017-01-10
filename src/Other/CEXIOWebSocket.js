/**
 * Created by Rogiel on 11/17/16.
 */

const WebSocket = require('websocket').client;
const uuid = require('uuid');
const crypto = require('crypto');

let CEXWebsocketURL = 'wss://ws.cex.io/ws/';
let CEXIOWebSocket = function (apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    this.handlers = {};
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.onWebSocketError = undefined;

CEXIOWebSocket.prototype.onOrderUpdate = undefined;
CEXIOWebSocket.prototype.onUserTransaction = undefined;

CEXIOWebSocket.prototype.onBalanceUpdate = undefined;
CEXIOWebSocket.prototype.onOrderBalanceUpdate = undefined;

CEXIOWebSocket.prototype.onMarketDataUpdate = undefined;

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.connect = function () {
    this.client = new WebSocket();
    let self = this;

    return new Promise((resolve, reject) => {
        this.client.on('connectFailed', function (error) {
            reject(error);
        });

        this.client.on('connect', function (connection) {
            self.connection = connection;

            // Connection error
            connection.on('error', function (error) {
                Logger.error('CEX.IO WebSocket error:', error);
                for (let oid in self.handlers) {
                    if (!self.handlers.hasOwnProperty(oid)) continue;
                    self.handlers[oid]({error: error.toString()}, true);
                }
                if(self.onWebSocketError) {
                    self.onWebSocketError(error);
                }
            });

            // Connection closed
            connection.on('close', function () {
                for (let oid in self.handlers) {
                    if (!self.handlers.hasOwnProperty(oid)) continue;
                    self.handlers[oid]({error: 'Connection Closed'}, true);
                }
            });

            // Connection incoming message
            connection.on('message', function (data) {
                let message = JSON.parse(data.utf8Data);

                if(message.e == 'connected') {
                    if (self.apiKey) {
                        self.authenticate().then(function (error) {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                    return;
                }

                self.receiveMessage(message);
            });

            connection.on('ping', function (data) {
                connection.pong(data);
            });
        });

        self.client.connect(CEXWebsocketURL);
    });
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.receiveMessage = function (message) {
    let name = message.e;

    if (message.oid) {
        this.handlers[message.oid](message.data, message.ok != "ok");
        delete this.handlers[message.oid];
    } else {
        let handler = this[this.messageHandlers[name]];
        if (handler) {
            if (handler.direct) {
                this[this.messageHandlers[name]](message);
            } else {
                this[this.messageHandlers[name]](message.data);
            }
        } else {
            console.log(message);
        }
    }
};

CEXIOWebSocket.prototype.sendMessage = function (message) {
    this.connection.send(JSON.stringify(message));
};

CEXIOWebSocket.prototype.sendRequest = function (name, data = {}) {
    return new Promise((resolve, reject) => {
        let oid = uuid.v4();
        this.handlers[oid] = function (data, error) {
            if (error) {
                reject(data.error);
                return;
            }
            resolve(data);
        };
        this.sendMessage({
            "e": name,
            "data": data,
            "oid": oid
        });
    });
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype._ping = function ({time}) {
    this.pong(time);
};
CEXIOWebSocket.prototype._ping.direct = true;

CEXIOWebSocket.prototype._disconnecting = function (data) {
    for (let oid in self.handlers) {
        if (!self.handlers.hasOwnProperty(oid)) continue;
        self.handlers[oid]({error: data.reason}, true);
    }
};
CEXIOWebSocket.prototype._disconnecting.direct = true;

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.authenticate = function (apiKey = undefined, apiSecret = undefined) {
    if (apiKey)    this.apiKey = apiKey;
    if (apiSecret) this.apiSecret = apiSecret;

    function createSignature(timestamp, apiKey, apiSecret) {
        let hmac = crypto.createHmac('sha256', apiSecret);
        hmac.update(timestamp + apiKey);
        return hmac.digest('hex');
    }

    return new Promise((resolve, reject) => {
        let timestamp = Math.floor(Date.now() / 1000);
        this.authHandler = function (error) {
            if (error) {
                reject();
                return;
            }
            resolve();
        };

        this.sendMessage({
            e: 'auth',
            auth: {
                key: this.apiKey,
                signature: createSignature(timestamp, this.apiKey, this.apiSecret),
                timestamp: timestamp
            }
        });
    });
};

CEXIOWebSocket.prototype._handleAuthenticate = function ({ok, error}) {
    if (this.authHandler) {
        this.authHandler(error);
    }
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.ticker = function (handler) {
    this.tickerHandler = handler;
    this.sendMessage({
        "e": "subscribe",
        "rooms": [
            "tickers"
        ]
    });
};

CEXIOWebSocket.prototype._tick = function (data) {
    this.tickerHandler(data);
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.placeOrder = function (type, symbol1, symbol2, amount, price) {
    return this.sendRequest('place-order', {
        "pair": [
            symbol1,
            symbol2
        ],
        "amount": amount,
        "price": price,
        "type": type
    });
};

CEXIOWebSocket.prototype.getOrder = function (id) {
    return this.sendRequest('cancel-replace-order', {
        "order_id": id
    });
};

CEXIOWebSocket.prototype.cancelReplaceOrder = function (type, id, symbol1, symbol2, amount, price) {
    return this.sendRequest('cancel-replace-order', {
        "order_id": id,
        "pair": [
            symbol1,
            symbol2
        ],
        "amount": amount,
        "price": price,
        "type": type
    });
};

CEXIOWebSocket.prototype.cancelOrder = function (symbol1, symbol2, limit = 6) {
    return this.sendRequest('cancel-order', {
        "pair": [
            symbol1,
            symbol2
        ],
        "limit": limit
    });
};

CEXIOWebSocket.prototype.getArchivedOrders = function (id) {
    return this.sendRequest('cancel-order', {
        "order_id": id
    });
};

CEXIOWebSocket.prototype.getBalance = function () {
    return this.sendRequest('get-balance');
};

CEXIOWebSocket.prototype.getOpenOrders = function (symbol1, symbol2) {
    return this.sendRequest('open-orders', {
        "pair": [
            symbol1,
            symbol2
        ]
    });
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.getOrderBook = function (symbol1, symbol2, depth = 0) {
    return this.sendRequest('order-book-subscribe', {
        "pair": [
            symbol1,
            symbol2
        ],
        "subscribe": false,
        "depth": depth
    });
};

CEXIOWebSocket.prototype.orderBookSubscribe = function (symbol1, symbol2, depth = 0) {
    return this.sendRequest('order-book-subscribe', {
        "pair": [
            symbol1,
            symbol2
        ],
        "subscribe": true,
        "depth": depth
    });
};

CEXIOWebSocket.prototype.orderBookUnsubscribe = function (symbol1, symbol2) {
    return this.sendRequest('order-book-unsubscribe', {
        "pair": [
            symbol1,
            symbol2
        ]
    });
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.pong = function () {
    this.sendMessage({"e": "pong"});
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype._balance = function (data) {
    if (this.onBalanceUpdate) {
        this.onBalanceUpdate(data);
    }
};

CEXIOWebSocket.prototype._orderBalance = function (data) {
    if (this.onOrderBalanceUpdate) {
        this.onOrderBalanceUpdate(data);
    }
};

CEXIOWebSocket.prototype._transaction = function (data) {
    if (this.onUserTransaction) {
        this.onUserTransaction(data);
    }
};

CEXIOWebSocket.prototype._order = function (data) {
    if (this.onOrderUpdate) {
        this.onOrderUpdate(data);
    }
};

CEXIOWebSocket.prototype._marketDataUpdate = function (data) {
    if (this.onMarketDataUpdate) {
        this.onMarketDataUpdate(data);
    }
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOWebSocket.prototype.messageHandlers = {
    'tick': '_tick',
    'ping': '_ping',
    'disconnecting': '_disconnecting',
    'auth': '_handleAuthenticate',

    'balance': '_balance',
    'obalance': '_orderBalance',
    'tx': '_transaction',
    'order': '_order',
    'md_update': '_marketDataUpdate'
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = CEXIOWebSocket;