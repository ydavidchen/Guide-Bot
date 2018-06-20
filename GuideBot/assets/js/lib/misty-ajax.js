/// <reference types="jquery" />
var misty;
(function (misty) {
    var apiClient;
    (function (apiClient) {
        class MistyAjax {
            constructor(ipAddress, port) {
                this._timeout = 30000;
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
            set timeout(theTimeout) {
                this._timeout = theTimeout;
            }
            GetCommand(command, successCallback, version = null) {
                let newUri = "http://" + this._ipAddress + ":" + this._port + "/api/" + (version ? version + "/" : "") + command;
                let theClass = this;
                $.ajax({
                    type: "GET",
                    url: newUri,
                    dataType: "json",
                    async: true,
                    timeout: this._timeout
                })
                    .done(function (data) {
                    if (data[0].status === "Error") {
                        // the web call was successfull, but returned an error.  Display Error.
                        theClass._Error2Console(data[0].errorMessage);
                    }
                    else if (successCallback) {
                        // no errors and there is a callback function.
                        successCallback(data);
                    }
                })
                    .fail(function (request, status, err) {
                    // There was an error with the call.  Display error messages.
                    theClass._Error2Console("===  GET - error  ===", "GetCommand");
                    theClass._Error2Console(request);
                    theClass._Error2Console(status);
                    theClass._Error2Console(err);
                    successCallback(JSON.stringify(err));
                    theClass._Error2Console("===  GET - error  ===", "GetCommand");
                });
            }
            PostCommand(command, theData, successCallback, version = null) {
                let newUri = "http://" + this._ipAddress + ":" + this._port + "/api/" + (version ? version + "/" : "") + command;
                let theClass = this;
                $.ajax({
                    type: "POST",
                    url: newUri,
                    data: theData,
                    dataType: "json",
                    async: true,
                    timeout: this._timeout
                })
                    .done(function (data) {
                    if (data.status === "Error") {
                        // the web call was successfull, but returned an error.  Display Error.
                        theClass._Error2Console(data[0].errorMessage);
                    }
                    else if (successCallback) {
                        // no errors and there is a successCallback function.
                        successCallback(data);
                    }
                })
                    .fail(function (request, status, err) {
                    // There was an error with the call.  Display error messages.
                    theClass._Error2Console("===  POST - error  ===", "PostCommand");
                    theClass._Error2Console(request);
                    theClass._Error2Console(status);
                    theClass._Error2Console(err);
                    successCallback(JSON.stringify(err));
                    theClass._Error2Console("===  POST - error  ===", "PostCommand");
                });
                // do other code here first.
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
        apiClient.MistyAjax = MistyAjax;
    })(apiClient = misty.apiClient || (misty.apiClient = {}));
})(misty || (misty = {}));
//# sourceMappingURL=MistyAjax.js.map