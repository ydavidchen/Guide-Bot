/// <reference types="jquery" />
/// <reference path="MistyAjax.ts" />
/// <reference path="MistyAPI.ts" />
/// <reference path="MistyWebSocket.ts" />
var misty;
(function (misty) {
    var apiClient;
    (function (apiClient) {
        apiClient.Mood = {
            1: { filename: "Angry.jpg" },
            2: { filename: "Concerned.jpg" },
            3: { filename: "Confused.jpg" },
            4: { filename: "Content.jpg" },
            5: { filename: "Groggy.jpg" },
            6: { filename: "Happy.jpg" },
            7: { filename: "Love.jpg" },
            8: { filename: "Sad.jpg" }
        };
        class Color {
            constructor(params) {
                this.params = params;
                this.red = params["red"];
                this.green = params["green"];
                this.blue = params["blue"];
            }
        }
        apiClient.Color = Color;
        class Motion {
            constructor(params) {
                this.params = params;
                this.degrees = params["degrees"];
                this.angular = params["angular"];
                this.linear = params["linear"];
            }
        }
        apiClient.Motion = Motion;
        apiClient.motions = {};
        apiClient.motions["left"] = new Motion({ linear: 30.0, angular: 10.0 });
        apiClient.motions["right"] = new Motion({ linear: 30.0, angular: -10.0 });
        apiClient.motions["forward"] = new Motion({ linear: 30.0, angular: 0 });
        apiClient.motions["backward"] = new Motion({ linear: -30.0, angular: 0.0 });
        apiClient.motions["stop"] = new Motion({ linear: 0.0, angular: 0 });
        apiClient.motions["spin right"] = new Motion({ linear: 0.0, angular: -20.0 });
        apiClient.motions["spin left"] = new Motion({ linear: 0.0, angular: 20.0 });
        apiClient.colors = {};
        apiClient.colors["Blue LED"] = new Color({ red: 30, green: 144, blue: 255 });
        apiClient.colors["Gold LED"] = new Color({ red: 218, green: 165, blue: 20 });
        apiClient.colors["Green LED"] = new Color({ red: 0, green: 255, blue: 10 });
        apiClient.colors["LED Off"] = new Color({ red: 0, green: 0, blue: 0 });
        apiClient.colors["Orange LED"] = new Color({ red: 255, green: 80, blue: 0 });
        apiClient.colors["Pink LED"] = new Color({ red: 255, green: 105, blue: 180 });
        apiClient.colors["Purple LED"] = new Color({ red: 148, green: 0, blue: 211 });
        apiClient.colors["Red LED"] = new Color({ red: 255, green: 0, blue: 0 });
        apiClient.colors["Silver LED"] = new Color({ red: 169, green: 169, blue: 169 });
        apiClient.colors["White LED"] = new Color({ red: 255, green: 255, blue: 255 });
        apiClient.colors["Yellow LED"] = new Color({ red: 255, green: 255, blue: 0 });
        apiClient.colors["Random LED"] = new Color({ red: 1, green: 1, blue: 1 });
        apiClient.moods = {};
        apiClient.moods["Angry Eyes"] = apiClient.Mood[1];
        apiClient.moods["Concerned Eyes"] = apiClient.Mood[2];
        apiClient.moods["Confused Eyes"] = apiClient.Mood[3];
        apiClient.moods["Content Eyes"] = apiClient.Mood[4];
        apiClient.moods["Groggy Eyes"] = apiClient.Mood[5];
        apiClient.moods["Happy Eyes"] = apiClient.Mood[6];
        apiClient.moods["Loving Eyes"] = apiClient.Mood[7];
        apiClient.moods["Sad Eyes"] = apiClient.Mood[8];
        apiClient.moods["Unamused Eyes"] = apiClient.Mood[9];
        class MistyRobot {
            constructor(theAddress, thePort) {
                this._isExploring = false;
                this._Address = theAddress;
                this._Port = thePort;
                this._MistyWebSocket = new apiClient.MistyWebSocket(theAddress, thePort);
                this._MistyAPI = new apiClient.MistyAPI(new apiClient.MistyAjax(theAddress, thePort));
            }
            get GetAddress() {
                return this._Address;
            }
            get GetPort() {
                return this._Port;
            }
            get IsWebsocketConnected() {
                return this._MistyWebSocket.IsConnected();
            }
            // === SetUpWebsocket === //
            ///////////////////////////
            Connect() {
                this._MistyWebSocket.Connect(function (event) {
                    //	alert("Connected to websockets");
                });
            }
            Subscribe(eventTriggerType, eventName, eventID, debounce, property, inequality, value, msgType, eventCallback) {
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                this._MistyWebSocket.SubscribeToData(eventTriggerType, eventName, eventID, debounce, property, inequality, value, msgType, eventCallback);
            }
            ChangeEyes(input, callback) {
                var mood;
                mood = input === "Random Eyes" ? apiClient.Mood[Math.floor(Math.random() * 9)] : apiClient.moods[input];
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.ChangeEyes(mood, ensuredCallback);
            }
            // === Updates === //
            /////////////////////
            GetStoreUpdateAvailable(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.GetStoreUpdateAvailable(ensuredCallback);
            }
            PerformSystemUpdate(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.PerformSystemUpdate(ensuredCallback);
            }
            // === Audio === //
            ///////////////////
            SaveAudioAssetToRobot(FileName, audioData, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.SaveAudioAssetToRobot(FileName, audioData, false, true, ensuredCallback);
            }
            PlayAudioClip(AudioClipId, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.PlayAudioClip(AudioClipId, ensuredCallback);
            }
            DeleteAudioClip(AudioClipId, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.DeleteAudioClip(AudioClipId, ensuredCallback);
            }
            GetListOfAudioClips(callback) {
                this._MistyAPI.GetListOfAudioClips(callback);
            }
            GetBatteryLevel(callback) {
                this._MistyAPI.GetBatteryLevel(callback);
            }
            GetDeviceInformation(callback) {
                this._MistyAPI.GetDeviceInformation(callback);
            }
            GetLogInformation(callback) {
                this._MistyAPI.GetLogInformation(callback);
            }
            GetListOfAudioFiles(callback) {
                this._MistyAPI.GetListOfAudioFiles(callback);
            }
            // === Images === //
            ////////////////////
            ChangeDisplayImage(FileName, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.ChangeDisplayImage(FileName, ensuredCallback);
            }
            DeleteImage(FileName, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.DeleteImage(FileName, ensuredCallback);
            }
            SaveImageAssetToRobot(FileName, imageData, imageWidth, imageHeight, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.SaveImageAssetToRobot(FileName, imageData, imageWidth, imageHeight, false, true, ensuredCallback);
            }
            GetListOfImages(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.GetListOfImages(ensuredCallback);
            }
            // === SLAM === //
            //////////////////
            IsMappingReady(eventCallback) {
                let that = this;
                this.GetStatus(function (data) {
                    that._IsSlamReady(data, that, that._ReadyToMap, eventCallback);
                });
            }
            StartMapping(eventCallback) {
                let ensuredCallback = this._EnsureCallback(eventCallback);
                this._MistyAPI.StartMapping(ensuredCallback);
            }
            StartTracking(eventCallback) {
                let ensuredCallback = this._EnsureCallback(eventCallback);
                this._MistyAPI.StartTracking(ensuredCallback);
            }
            StartRecording(eventCallback) {
                let ensuredCallback = this._EnsureCallback(eventCallback);
                this._MistyAPI.StartRecording(ensuredCallback);
            }
            IsTrackingReady(eventCallback) {
                let that = this;
                this.GetStatus(function (data) {
                    that._IsSlamReady(data, that, that._ReadyToTrack, eventCallback);
                });
            }
            _IsSlamReady(data, that, slamCommand, eventCallback) {
                let ensuredCallback = this._EnsureCallback(eventCallback);
                if (data === null || data[0] == null || data[0].result === null || data[0].result.sensorStatus !== "Ready") {
                    console.log("Slam sensor is not ready. Try SlamReset command.");
                    return false;
                }
                slamCommand(that, ensuredCallback);
                return true;
            }
            _ReadyToMap(that, ensuredCallback) {
                that._MistyAPI.StartMapping(function (ensuredCallback) {
                    that.Subscribe("SelfState", "StartMapping", "1", 1, "Position.X", ">=", "0", "ApiEventRegistration", ensuredCallback);
                });
            }
            _ReadyToTrack(that, ensuredCallback) {
                that._MistyAPI.StartTracking(function (ensuredCallback) {
                    that.Subscribe("SelfState", "StartTracking", "1", 1, "Position.X", ">=", "0", "ApiEventRegistration", ensuredCallback);
                });
            }
            StopMapping(callback) {
                if (this._isExploring) {
                    console.log("You are not mapping.");
                    return;
                }
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.StopMapping(ensuredCallback);
            }
            GetMap(callback) {
                if (this._isExploring) {
                    this.StopMapping(function (data) {
                        this._isExploring = false;
                        let ensuredCallback = this._EnsureCallback(callback);
                        this._MistyAPI.GetMap(ensuredCallback);
                    });
                }
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.GetMap(ensuredCallback);
            }
            GetRawMap(callback) {
                if (this._isExploring) {
                    this.StopMapping(function (data) {
                        this._isExploring = false;
                        let ensuredCallback = this._EnsureCallback(callback);
                        this._MistyAPI.GetMap(ensuredCallback);
                    });
                }
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.GetRawMap(ensuredCallback);
            }
            GetPath(x, y, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.GetPath(x, y, ensuredCallback);
            }
            FollowToPoint(locationX, locationY, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                let path = "(" + locationX + "," + locationY + ")";
                this._MistyAPI.FollowPath(path, ensuredCallback);
            }
            FollowPath(path, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.FollowPath(path, ensuredCallback);
            }
            DriveToLocation(x, y, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.DriveToLocation(x, y, ensuredCallback);
            }
            GetStatus(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.GetStatus(ensuredCallback);
            }
            ResetMapping(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.ResetMapping(ensuredCallback);
            }
            StopTracking(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.StopTracking(ensuredCallback);
            }
            StopRecording(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.StopRecording(ensuredCallback);
            }
            SubscribeToYPose(callback, debounce) {
                if (!debounce || debounce < 100) {
                    debounce = 100;
                }
                this.SubscribeToNamedObjectWithFilter("PoseSubscriptionY", "SelfState", 1000, "Position.Y", "exists", 0, "Position.Y", function (data) {
                    callback(data);
                });
            }
            SubscribeToXPose(callback, debounce) {
                if (!debounce || debounce < 100) {
                    debounce = 100;
                }
                this.SubscribeToNamedObjectWithFilter("PoseSubscriptionX", "SelfState", 1000, "Position.X", "exists", 0, "Position.X", function (data) {
                    callback(data);
                });
            }
            SubscribeToBattery(callback) {
                let that = this;
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                this._MistyWebSocket.RegisterForObjectWithFilter("BatteryCharge", "BatteryCharge", 3000, null, null, null, null, function (data) {
                    callback(data);
                });
            }
            ;
            SubscribeToTimeOfFlightFront(callback) {
                let that = this;
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                this._MistyWebSocket.RegisterForObjectWithFilter("CenterTimeOfFlight", "TimeOfFlight", 3000, "SensorPosition", "=", "Center", null, function (data) {
                    callback(data);
                });
            }
            ;
            SubscribeToTimeOfFlightRight(callback) {
                let that = this;
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                this._MistyWebSocket.RegisterForObjectWithFilter("RightTimeOfFlight", "TimeOfFlight", 3000, "SensorPosition", "=", "Right", null, function (data) {
                    callback(data);
                });
            }
            ;
            SubscribeToTimeOfFlightLeft(callback) {
                let that = this;
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                this._MistyWebSocket.RegisterForObjectWithFilter("LeftTimeOfFlight", "TimeOfFlight", 3000, "SensorPosition", "=", "Left", null, function (data) {
                    callback(data);
                });
            }
            ;
            SubscribeToTimeOfFlightBack(callback) {
                let that = this;
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                this._MistyWebSocket.RegisterForObjectWithFilter("BackTimeOfFlight", "TimeOfFlight", 3000, "SensorPosition", "=", "Back", null, function (data) {
                    callback(data);
                });
            }
            ;
            UnsubscribeFromTimeOfFlightFront(callback) {
                this._MistyWebSocket.UnsubscribeFromObject("CenterTimeOfFlight");
                callback("Unsubscribed from Time of Flight");
            }
            UnsubscribeFromTimeOfFlightRight(callback) {
                this._MistyWebSocket.UnsubscribeFromObject("RightTimeOfFlight");
                callback("Unsubscribed from Time of Flight");
            }
            UnsubscribeFromTimeOfFlightLeft(callback) {
                this._MistyWebSocket.UnsubscribeFromObject("LeftTimeOfFlight");
                callback("Unsubscribed from Time of Flight");
            }
            UnsubscribeFromTimeOfFlightBack(callback) {
                this._MistyWebSocket.UnsubscribeFromObject("BackTimeOfFlight");
                callback("Unsubscribed from Time of Flight");
            }
            UnsubscribeFromBatteryCharge(callback) {
                this._MistyWebSocket.UnsubscribeFromObject("BatteryCharge");
                callback("Unsubscribed from Battery Charge");
            }
            UnsubscribeFromPose(callback) {
                this._MistyWebSocket.UnsubscribeFromObject("PoseSubscriptionX");
                this._MistyWebSocket.UnsubscribeFromObject("PoseSubscriptionY");
                callback("Unsubscribed from pose");
            }
            UnsubscribeFromApiEvent(eventTriggerType, eventName, eventId, callback) {
                this._MistyWebSocket.UnsubscribeFromEvent(eventTriggerType, eventName, eventId);
            }
            SubscribeToNamedObjectWithFilter(eventName, namedObject, debounceMs, property, inequality, value, returnProperty, callback) {
                let that = this;
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                console.log("Calling to subscribe to " + namedObject);
                this._MistyWebSocket.RegisterForObjectWithFilter(eventName, namedObject, debounceMs, property, inequality, value, returnProperty, function (data) {
                    callback(data);
                });
            }
            ;
            SubscribeToNamedObject(namedObject, debounceMs, callback) {
                let that = this;
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                console.log("Calling to subscribe to " + namedObject);
                this._MistyWebSocket.RegisterForObject(namedObject, debounceMs, function (data) {
                    callback(data);
                });
            }
            ;
            UnsubscribeFromNamedObject(eventName, callback) {
                this._MistyWebSocket.UnsubscribeFromObject(eventName);
                callback("Unsubscribed from " + eventName);
            }
            // === Locomotion === //
            ////////////////////////
            DriveTime(id, duration, callback) {
                var motion = apiClient.motions[id];
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.DriveTime(motion, duration, ensuredCallback);
            }
            DriveTimeByValue(linear, angular, duration, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.DriveTimeByValue(linear, angular, duration, ensuredCallback);
            }
            TurnRobot(angular, degree, duration, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.DriveTimeByValue(0, angular, duration, ensuredCallback, degree);
            }
            StopRobot(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.StopRobot(ensuredCallback);
            }
            LocomotionTrack(left, right, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.LocomotionTrack(left, right, ensuredCallback);
            }
            Drive(linear, angular, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.Drive(linear, angular, ensuredCallback);
            }
            // === Move Arm === //
            //////////////////////
            MoveLeftArmSlow(position0To10, callback) {
                this.MoveArm("Left", position0To10, 2, callback);
            }
            MoveLeftArmMedium(position0To10, callback) {
                this.MoveArm("Left", position0To10, 5, callback);
            }
            MoveLeftArmFast(position0To10, callback) {
                this.MoveArm("Left", position0To10, 8, callback);
            }
            MoveRightArmSlow(position0To10, callback) {
                this.MoveArm("Right", position0To10, 2, callback);
            }
            MoveRightArmMedium(position0To10, callback) {
                this.MoveArm("Right", position0To10, 5, callback);
            }
            MoveRightArmFast(position0To10, callback) {
                this.MoveArm("Right", position0To10, 8, callback);
            }
            MoveBothArmsSlow(position0To10, callback) {
                this.MoveArm("Right", position0To10, 2, callback);
                this.MoveArm("Left", position0To10, 2, callback);
            }
            MoveBothArmsMedium(position0To10, callback) {
                this.MoveArm("Right", position0To10, 5, callback);
                this.MoveArm("Left", position0To10, 5, callback);
            }
            MoveBothArmsFast(leftArmPosition0To10, rightArmPosition0To10, callback) {
                this.MoveArm("Left", leftArmPosition0To10, 10, callback);
                this.MoveArm("Right", rightArmPosition0To10, 10, callback);
            }
            MoveArm(leftOrRight, position0To10, speed0To10, callback) {
                if (leftOrRight !== "Left" && leftOrRight !== "Right") {
                    callback({ Status: "Error", ErrorMessage: 'LeftOrRight value must be "Left" or "Right".' });
                    return;
                }
                if (speed0To10 < 0) {
                    speed0To10 = 0;
                }
                else if (speed0To10 > 10) {
                    speed0To10 = 10;
                }
                if (position0To10 < 0) {
                    position0To10 = 0;
                }
                else if (position0To10 > 10) {
                    position0To10 = 10;
                }
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.MoveArm(leftOrRight, position0To10, speed0To10, ensuredCallback);
            }
            // === Move Head === //
            ///////////////////////
            CenterHead(callback) {
                this.MoveHead(0, 0, 0, 8, callback);
            }
            HeadLookUp(callback) {
                this.MoveHead(3, 0, 0, 6, callback);
            }
            HeadLookDown(callback) {
                this.MoveHead(-3, 0, 0, 6, callback);
            }
            HeadLookRight(callback) {
                this.MoveHead(0, 0, 3, 6, callback);
            }
            HeadLookLeft(callback) {
                this.MoveHead(0, 0, -3, 6, callback);
            }
            HeadTiltRight(callback) {
                this.MoveHead(0, 3, 0, 6, callback);
            }
            HeadTileLeft(callback) {
                this.MoveHead(0, -3, 0, 6, callback);
            }
            SetHeadToPosition(axis, position, velocity, theCallback) {
                let ensuredCallback = this._EnsureCallback(theCallback);
                this._MistyAPI.SetHeadPosition(axis, position, velocity, ensuredCallback);
            }
            MoveHead(pitch, roll, yaw, speed0To10, callback) {
                if (speed0To10 < 0) {
                    speed0To10 = 0;
                }
                else if (speed0To10 > 10) {
                    speed0To10 = 10;
                }
                if (pitch < -5) {
                    pitch = -5;
                }
                else if (pitch > 5) {
                    pitch = 5;
                }
                if (roll < -5) {
                    roll = -5;
                }
                else if (roll > 5) {
                    roll = 5;
                }
                if (yaw < -5) {
                    yaw = -5;
                }
                else if (yaw > 5) {
                    yaw = 5;
                }
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.MoveHead(pitch, roll, yaw, speed0To10, ensuredCallback);
            }
            // === General === //
            /////////////////////
            ChangeLED(colorId, callback) {
                if (colorId in apiClient.colors) {
                    var color;
                    if (colorId == "Random LED") {
                        color = new Color({ red: Math.random() * 255, green: Math.random() * 255, blue: Math.random() * 255 });
                    }
                    else {
                        color = apiClient.colors[colorId];
                    }
                    let ensuredCallback = this._EnsureCallback(callback);
                    this._MistyAPI.ChangeLED(color, ensuredCallback);
                }
                else {
                    console.log("Invalid color id");
                }
            }
            ChangeLEDByValue(red, green, blue, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.ChangeLEDByValue(red, green, blue, ensuredCallback);
            }
            ConnectToWiFi(NetworkName, Password, callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.ConnectWiFi(NetworkName, Password, ensuredCallback);
            }
            GetHelp(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.GetHelp(ensuredCallback);
            }
            // === Face === //
            //////////////////
            StartFaceTraining(faceID, callback) {
                if (faceID) {
                    this._MistyAPI.StartFaceTraining(faceID, this._EnsureCallback(callback));
                }
                else {
                    this._MistyAPI.StartFaceTraining(this._RandomAlphaNumericString(25), callback);
                }
            }
            StopFaceTraining(callback) {
                this._MistyAPI.StopFaceTraining(this._EnsureCallback(callback));
            }
            ClearLearnedFaces(callback) {
                this._MistyAPI.ClearLearnedFaces(this._EnsureCallback(callback));
            }
            GetLearnedFaces(callback) {
                this._MistyAPI.GetLearnedFaces(this._EnsureCallback(callback));
            }
            RunFaceDetectionProcess(callback) {
                let that = this;
                this.SubscribeToNamedObjectWithFilter("FaceDetection", "FaceDetection", 500, null, null, null, null, function (data) {
                    callback(data);
                });
                this.StartFaceDetection(function () {
                    //alert("Returned from StartFaceDetection API call");
                });
            }
            RunFaceRecognitionProcess(callback) {
                let that = this;
                if (!this._MistyWebSocket.IsConnected) {
                    console.log("You need to open a websocket connection first");
                    return;
                }
                this.StartFaceRecognition(function () {
                    //alert("Returned from StartFaceRecognition API call");
                });
                this.SubscribeToNamedObjectWithFilter("FaceRecognition", "FaceRecognition", 500, null, null, null, null, function (data) {
                    callback(data);
                });
            }
            // === Face Methods === //
            //////////////////////////
            StartFaceDetection(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.StartFaceDetection(ensuredCallback);
            }
            StopFaceDetection(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this.UnsubscribeFromNamedObject("FaceDetection", function () { console.log("Unsubscribed from Face Detection"); });
                this._MistyAPI.StopFaceDetection(ensuredCallback);
            }
            StartFaceRecognition(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this._MistyAPI.StartFaceRecognition(ensuredCallback);
            }
            StopFaceRecognition(callback) {
                let ensuredCallback = this._EnsureCallback(callback);
                this.UnsubscribeFromNamedObject("FaceRecognition", function () { console.log("Unsubscribed from Face Recognition"); });
                this._MistyAPI.StopFaceRecognition(ensuredCallback);
            }
            // === Private Methods === //
            /////////////////////////////
            _Error2Console(message, methodName = '') {
                if (typeof message === 'string') {
                    console.error(this.constructor.name + " - " + methodName + " - " + message);
                }
                else {
                    console.error(message);
                }
            }
            _EnsureCallback(callback) {
                if (callback) {
                    return callback;
                }
                else {
                    return function (data) { console.log(data); };
                }
            }
            _RandomAlphaNumericString(length) {
                let result = '';
                let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
                for (let i = length; i > 0; i--) {
                    result += chars[Math.floor(Math.random() * chars.length)];
                }
                return result;
            }
        }
        apiClient.MistyRobot = MistyRobot;
    })(apiClient = misty.apiClient || (misty.apiClient = {}));
})(misty || (misty = {}));
//# sourceMappingURL=MistyRobot.js.map