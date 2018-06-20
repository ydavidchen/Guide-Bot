/// <reference types="jquery" />
/// <reference path="MistyAjax.ts" />
var misty;
(function (misty) {
    var apiClient;
    (function (apiClient) {
        class MistyAPI {
            constructor(mistyAjax) {
                this._mistyAjax = mistyAjax;
            }
            // === Audio Commands === //
            ////////////////////////////
            GetListOfAudioClips(theCallback) {
                this.GetAjaxCommand("audio/clips", theCallback);
            }
            //Play an audio clip that has been uploaded to Misty.
            //    audioName - String - Name given to Audio Clip on file
            PlayAudioClip(audioName, theCallback) {
                let payload = {
                    AssetId: audioName
                };
                this.PostAjaxCommand("audio/play", payload, theCallback);
            }
            DeleteAudioClip(audioName, theCallback) {
                let payload = {
                    FileName: audioName
                };
                this.PostAjaxCommand("audio/delete", payload, theCallback, "beta");
            }
            //Save an audio file to Misty.
            //    FileName - String  - Name of audio file uploaded to Misty with file extention (Accepts all audio format types)
            //    audioData           - String  - Series of numbers that represent audio data in bytes
            //    immediatelyApply    - Boolean - True or False used to indicate whether audio file will be immediately updated to audio list.
            SaveAudioAssetToRobot(FileName, audioData, immediatelyApply, overwriteExistingFile, theCallback) {
                let dataString;
                if (typeof audioData === 'string') {
                    dataString = audioData;
                }
                else {
                    dataString = audioData.toString();
                }
                let payload = {
                    FileName: FileName,
                    DataAsByteArrayString: dataString,
                    ImmediatelyApply: immediatelyApply,
                    OverwriteExisting: overwriteExistingFile
                };
                this.PostAjaxCommand("audio ", payload, theCallback);
            }
            GetListOfAudioFiles(theCallback) {
                this.GetAjaxCommand("audio", theCallback);
            }
            GetHelp(theCallback) {
                this.GetAjaxCommand("info/help", theCallback);
            }
            GetHelpAboutCommand(commandString, theCallback) {
                let payload = {
                    Command: commandString
                };
                this.GetAjaxCommand("info/help?command=" + commandString, theCallback);
            }
            GetBatteryLevel(theCallback) {
                this.GetAjaxCommand("info/battery", theCallback);
            }
            GetDeviceInformation(theCallback) {
                this.GetAjaxCommand("info/device", theCallback);
            }
            GetLogInformation(theCallback) {
                this.GetAjaxCommand("info/logs", theCallback);
            }
            ChangeEyes(mood, theCallback) {
                this.ChangeDisplayImage(mood.filename, theCallback);
            }
            ConnectWiFi(networkName, password, theCallback) {
                let payload = {
                    NetworkName: networkName,
                    Password: password
                };
                this.PostAjaxCommand("wifi", payload, theCallback);
            }
            // === Move Commands === //
            ////////////////////////////
            DriveTime(motion, duration, theCallback) {
                this.DriveTimeByValue(motion.linear, motion.angular, duration, theCallback, motion.degrees);
            }
            DriveTimeByValue(linear, angular, duration, theCallback, degrees) {
                let payload = {
                    LinearVelocity: linear,
                    AngularVelocity: angular,
                    TimeMS: duration,
                    Degrees: degrees
                };
                this.PostAjaxCommand("drive/time", payload, theCallback);
            }
            DriveToLocation(locationX, locationY, theCallback) {
                let payload = {
                    X: locationX,
                    Y: locationY
                };
                //TODO Update Robot and this call to not use ActionPlan naming
                this.PostAjaxCommand("drive/location", payload, theCallback);
            }
            LocomotionTrack(left, right, theCallback) {
                let payload = {
                    LeftTrackSpeed: left,
                    RightTrackSpeed: right,
                };
                this.PostAjaxCommand("drive/track", payload, theCallback);
            }
            Drive(linear, angular, theCallback) {
                let payload = {
                    LinearVelocity: linear,
                    AngularVelocity: angular,
                };
                this.PostAjaxCommand("drive", payload, theCallback);
            }
            MoveArm(whichSide, position, velocity, theCallback) {
                let payload = {
                    Arm: whichSide,
                    Position: position,
                    Velocity: velocity
                };
                this.PostAjaxCommand("arms/move", payload, theCallback);
            }
            MoveHead(pitch, roll, yaw, velocity, theCallback) {
                let payload = {
                    Pitch: pitch,
                    Roll: roll,
                    Yaw: yaw,
                    Velocity: velocity
                };
                this.PostAjaxCommand("head/move", payload, theCallback, "beta");
            }
            SetHeadPosition(axis, position, velocity, theCallback) {
                let payload = {
                    Axis: axis,
                    Position: position,
                    Velocity: velocity
                };
                this.PostAjaxCommand("head/position", payload, theCallback, "beta");
            }
            // === SLAM Commands === //
            ////////////////////////////
            StartMapping(theCallback) {
                this.PostAjaxCommand("slam/map/start", {}, theCallback, 'alpha');
            }
            StopMapping(theCallback) {
                this.PostAjaxCommand("slam/map/stop", {}, theCallback, 'alpha');
            }
            StartTracking(theCallback) {
                this.PostAjaxCommand("slam/track/start", {}, theCallback, 'alpha');
            }
            StopTracking(theCallback) {
                this.PostAjaxCommand("slam/track/stop", {}, theCallback, 'alpha');
            }
            StartRecording(theCallback) {
                this.PostAjaxCommand("slam/record/start", {}, theCallback, "alpha");
            }
            StopRecording(theCallback) {
                this.PostAjaxCommand("slam/record/stop", {}, theCallback, "alpha");
            }
            GetMap(theCallback) {
                this.GetAjaxCommand("slam/map/smooth", theCallback, "alpha");
            }
            GetRawMap(theCallback) {
                this.GetAjaxCommand("slam/map/raw", theCallback, 'alpha');
            }
            GetPath(locationX, locationY, theCallback) {
                let payload = {
                    X: locationX,
                    Y: locationY
                };
                this.GetAjaxCommand("slam/path", theCallback, 'alpha');
            }
            FollowPath(path, theCallback) {
                //TODO Update to take an array of points vs asking them to enter path manually
                let payload = {
                    Path: path
                };
                //TODO Update Robot and this call to not use ActionPlan naming
                this.PostAjaxCommand("drive/path", payload, theCallback, 'alpha');
            }
            FollowPathOther(locationX, locationY, theCallback) {
                let payload = {
                    Destination: "(" + locationX + "," + locationY + ")"
                };
                this.PostAjaxCommand("drive/path", payload, theCallback, 'alpha');
            }
            GetStatus(theCallback) {
                this.GetAjaxCommand("slam/status", theCallback, 'alpha');
            }
            StopRobot(theCallback) {
                this.PostAjaxCommand("drive/stop", {}, theCallback);
            }
            ResetMapping(theCallback) {
                this.PostAjaxCommand("slam/reset", {}, theCallback, 'alpha');
            }
            // === Face Commands === //
            ////////////////////////////
            StartFaceDetection(theCallback) {
                this.PostAjaxCommand("faces/detection/start", {}, theCallback, 'beta');
            }
            StopFaceDetection(theCallback) {
                this.PostAjaxCommand("faces/detection/stop", {}, theCallback, 'beta');
            }
            StartFaceRecognition(theCallback) {
                this.PostAjaxCommand("faces/recognition/start", {}, theCallback, 'beta');
            }
            StopFaceRecognition(theCallback) {
                this.PostAjaxCommand("faces/recognition/stop", {}, theCallback, 'beta');
            }
            StartFaceTraining(faceID, theCallback) {
                let payload = {
                    FaceID: faceID
                };
                this.PostAjaxCommand("faces/training/start", payload, theCallback, 'beta');
            }
            StopFaceTraining(theCallback) {
                this.PostAjaxCommand("faces/training/cancel", {}, theCallback, 'beta');
            }
            ClearLearnedFaces(theCallback) {
                this.PostAjaxCommand("faces/clearall", {}, theCallback, 'beta');
            }
            GetLearnedFaces(theCallback) {
                this.GetAjaxCommand("faces", theCallback, 'beta');
            }
            // === Image Commands === //
            ////////////////////////////
            ChangeDisplayImage(FileName, theCallback) {
                let payload = {
                    FileName: FileName
                };
                this.PostAjaxCommand("images/change", payload, theCallback);
            }
            DeleteImage(FileName, theCallback) {
                let payload = {
                    FileName: FileName
                };
                this.PostAjaxCommand("images/delete", payload, theCallback);
            }
            SaveImageAssetToRobot(FileName, imageData, imageWidth, imageHeight, immediatelyApply, overwriteExistingFile, theCallback) {
                let dataString;
                if (typeof imageData === 'string') {
                    dataString = imageData;
                }
                else {
                    dataString = imageData.toString();
                }
                let payload = {
                    FileName: FileName,
                    DataAsByteArrayString: dataString,
                    Width: imageWidth,
                    Height: imageHeight,
                    ImmediatelyApply: immediatelyApply,
                    OverwriteExisting: overwriteExistingFile
                };
                this.PostAjaxCommand("images", payload, theCallback);
            }
            GetListOfImages(theCallback) {
                this.GetAjaxCommand("images", theCallback);
            }
            RevertDisplay(theCallback) {
                this.PostAjaxCommand("images/revert", {}, theCallback);
            }
            // === General Commands === //
            //////////////////////////////
            ChangeLED(color, theCallback) {
                this.ChangeLEDByValue(color.red, color.green, color.blue, theCallback);
            }
            ChangeLEDByValue(red, green, blue, theCallback) {
                let payload = {
                    Red: red,
                    Green: green,
                    Blue: blue
                };
                this.PostAjaxCommand("led/change", payload, theCallback);
            }
            PerformSystemUpdate(theCallback) {
                this.PostAjaxCommand("system/update", {}, theCallback, "alpha");
            }
            GetStoreUpdateAvailable(theCallback) {
                this.GetAjaxCommand("info/updates", theCallback, "alpha");
            }
            // === Private Methods === //
            /////////////////////////////
            GetAjaxCommand(command, theCallback, version = null) {
                this._mistyAjax.GetCommand(command, theCallback, version);
            }
            PostAjaxCommand(command, theData, theCallback, version = null) {
                this._mistyAjax.PostCommand(command, JSON.stringify(theData), theCallback, version);
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
        apiClient.MistyAPI = MistyAPI;
    })(apiClient = misty.apiClient || (misty.apiClient = {}));
})(misty || (misty = {}));
//# sourceMappingURL=MistyAPI.js.map