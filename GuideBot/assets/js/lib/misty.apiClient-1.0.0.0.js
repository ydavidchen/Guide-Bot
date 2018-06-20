/// <reference="jquery" />
var misty;
(function (misty) {
    var apiClient;
    (function (apiClient) {
        class constants {
        }
        constants.robotInformation = "/robot";
        class mistyRobot {
            constructor(rootUrl, softwareVersion, firmwareVersion, sensors) {
                this._rootUrl = rootUrl;
                this._softwareVersion = softwareVersion;
                this._firmwareVersion = firmwareVersion;
                this._sensors = sensors;
            }
            get softwareVersion() {
                return this._softwareVersion;
            }
            get firmwareVersion() {
                return this._firmwareVersion;
            }
            get sensors() {
                return this._sensors;
            }
            static connect(url) {
                let robo = undefined;
                $.getJSON(url + constants.robotInformation, (data, textStatus, jqXHR) => {
                    let jsonData = data;
                    let count = data.sensors.length;
                    let sensors = new Array(count);
                    for (let i = 0; i < count; i++) {
                        let item = new sensor();
                        item.id = data.sensors[i].id;
                        item.name = data.sensors[i].name;
                        sensors[i] = item;
                    }
                    robo = new mistyRobot(url, data.softwareVersion, data.firmwareVersion, sensors);
                }).fail(function () {
                    // TODO: Need error handling strategy
                });
                return robo;
            }
        }
        apiClient.mistyRobot = mistyRobot;
        ;
        class sensor {
        }
        apiClient.sensor = sensor;
    })(apiClient = misty.apiClient || (misty.apiClient = {}));
})(misty || (misty = {}));
;
//# sourceMappingURL=misty.apiClient-1.0.0.0.js.map