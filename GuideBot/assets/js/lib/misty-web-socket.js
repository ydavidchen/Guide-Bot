/// <reference types="jquery" />
var misty;
(function (misty) {
    var apiClient;
    (function (apiClient) {
        class MistyWebSocket {
            constructor(ipAddress, port) {
                this._isConnected = false;
                this._eventListeners = new Map();
                if (ipAddress && port) {
                    this._ipAddress = ipAddress.toString();
                    this._port = port.toString();
                }
                else {
                    this._Error2Console("Null port or ip address submitted");
                }
            }
            HasValidIp() {
                return this._ipAddress != null && this._ipAddress.trim() != "";
            }
            //TODO Look into eventId as it doesn't appear to be used and seems arbitrary
            SubscribeToData(eventTriggerType, eventName, eventID, debounce, property, inequality, value, msgType, eventCallback) {
                var apievent = {
                    "$id": "1",
                    "EventTriggerType": eventTriggerType,
                    "EventName": eventName,
                    "EventId": eventID,
                    "DebounceSeconds": debounce,
                    "EventConditions": [
                        {
                            "$id": "2",
                            "Item1": property,
                            "item2": inequality,
                            "item3": value
                        }
                    ]
                };
                var msg = {
                    "$id": "1",
                    "Operation": "subscribe",
                    "Type": msgType,
                    "Message": JSON.stringify(apievent)
                };
                var message = JSON.stringify(msg);
                this._websocket.send(message);
                this._eventListeners.set(eventName, eventCallback);
            }
            RegisterForObjectWithFilter(eventName, msgType, debounceMs, property, inequality, value, returnProperty, eventCallback) {
                var msg;
                if (property && inequality) {
                    msg = {
                        "$id": "1",
                        "Operation": "subscribe",
                        "Type": msgType,
                        "DebounceMs": debounceMs,
                        "EventName": eventName ? eventName : msgType,
                        "Message": "",
                        "ReturnProperty": returnProperty,
                        "EventConditions": [
                            {
                                "Property": property,
                                "Inequality": inequality,
                                "Value": value
                            }
                        ]
                    };
                }
                else {
                    msg = {
                        "$id": "1",
                        "Operation": "subscribe",
                        "Type": msgType,
                        "DebounceMs": debounceMs,
                        "EventName": eventName ? eventName : msgType,
                        "Message": "",
                        "ReturnProperty": returnProperty
                    };
                }
                var message = JSON.stringify(msg);
                this._websocket.send(message);
                this._eventListeners.set(eventName ? eventName : msgType, eventCallback);
            }
            RegisterForObject(msgType, debounceMs, eventCallback) {
                var msg = {
                    "$id": "1",
                    "Operation": "subscribe",
                    "Type": msgType,
                    "DebounceMs": debounceMs,
                    "Message": ""
                };
                var message = JSON.stringify(msg);
                this._websocket.send(message);
                this._eventListeners.set(msgType, eventCallback);
            }
            UnsubscribeFromObject(eventName) {
                var msg = {
                    "$id": "1",
                    "Operation": "unsubscribe",
                    "EventName": eventName,
                    "Message": ""
                };
                var message = JSON.stringify(msg);
                this._websocket.send(message);
                this._eventListeners.delete(eventName);
            }
            IsConnected() {
                return this._isConnected;
            }
            Connect(successCallback) {
                let that = this;
                if (this._isConnected) {
                    this.Disconnect;
                }
                this._websocket = new WebSocket("ws://" + this._ipAddress + ":" + this._port + "/pubsub");
                this._websocket.onopen = function (event) {
                    that._isConnected = true;
                    // no errors and there is a callback function.
                    successCallback(event);
                };
                this._websocket.onmessage = function (event) {
                    try {
                        //Parse the Json if possible, otherwise is probably a status
                        let theDataObject = JSON.parse(event.data);
                        let messageId = theDataObject.eventName ? theDataObject.eventName : theDataObject.type;
                        that._eventListeners.get(messageId)(theDataObject);
                    }
                    catch (e) {
                        //TODO this is not necessarily an error just because it is not valid json 
                        console.log(JSON.stringify(event.data));
                    }
                };
            }
            Disconnect() {
                if (this._isConnected) {
                    this._websocket.close();
                    this._isConnected = false;
                }
            }
            UnsubscribeFromEvent(eventTriggerType, eventName, eventId) {
                var apievent = {
                    "$id": "1",
                    "EventTriggerType": eventTriggerType,
                    "EventName": eventName,
                    "EventId": eventId
                };
                var msg = {
                    "$id": "1",
                    "Operation": "unsubscribe",
                    "Type": "ApiEventRegistration",
                    "Message": JSON.stringify(apievent)
                };
                var message = JSON.stringify(msg);
                this._websocket.send(message);
            }
            _ValidateipAddress(ipAddress) {
                // right now we only except ip addresses.
                let ipNumbers = ipAddress.split('.');
                let ipNums = new Array(4);
                if (ipNumbers.length !== 4) {
                    console.error("IP Address needs to be in the format of ###.###.###.### where ### is a number between 0-255.");
                    return "";
                }
                for (let i = 0; i < 4; i++) {
                    ipNums[i] = parseInt(ipNumbers[i]);
                    if (ipNums[i] < 0 || ipNums[i] > 255) {
                        console.error("IP Address needs to be in the format of ###.###.###.### where ### is a number between 0-255.");
                        return "";
                    }
                }
                return ipNums.join('.');
            }
            _Error2Console(message, methodName = '') {
                if (typeof message === 'string') {
                    console.error(this.constructor.name + " - " + methodName + " - " + message);
                }
                else {
                    console.error(message);
                }
            }
        }
        apiClient.MistyWebSocket = MistyWebSocket;
    })(apiClient = misty.apiClient || (misty.apiClient = {}));
})(misty || (misty = {}));
//# sourceMappingURL=MistyWebSocket.js.map