var isStopped = false;
/**
 * Start the robort movements
 */
function driveStart() {
    if (robo === undefined) {
        need2ConnectMesssage();
    } else {
        setLEDColor("Green LED");
        //playMedia("assets/media/navStart.wav");
        run();
    }
}

function run() {
    driveForward();
    flightSensor();
}

/**
 * Stop the robort movements
 */
function driveStop() {
    if (robo === undefined) {
        need2ConnectMesssage();
    } else {
        setLEDColor("Yellow LED");
        //playMedia("assets/media/navEnd.wav");
        robo.StopRobot();
    }
}

/**
 * Handles the drive event of the robort
 * @param {Number} linearVelocity 
 * @param {Number} angularVelocity 
 */
function HandleDriveSelection(linearVelocity, angularVelocity) {
    if (robo === undefined) {
        need2ConnectMesssage();
    } else {
        var velocity = $("#drive-time-velocity").val();
        robo.Drive(linearVelocity, angularVelocity);
    }
}

/**
 * Set the LED color of the robort
 */
function setLEDColor(color) {
    if (robo === undefined) {
        need2ConnectMesssage();
    } else {
        robo.ChangeLED(color, function (data) { 
            console.log(JSON.stringify(data)); 
            showToastMessage("Changing LED"); 
        });
    }
}

/**
 * Plays the audio on the robort 
 */
function playMedia(media) {
    if (robo === undefined) {
        need2ConnectMesssage();
    } else if (media === null || media === "") {
        showToastMessage("You must populate the audio list first");
        return;
    } else {
        showToastMessage("Playing audio file");
        robo.PlayAudioClip(media);
    }
}

/**
 * 
 */
function flightSensor() {
    if (robo === undefined) {
        need2ConnectMesssage();
    } else if (!robo.IsWebsocketConnected) {
        noWebsocketMessage();
    } else {
        showToastMessage("Subscribing to Time of Flights");
        frontSensor(); 
        leftSensor(); 
        rightSensor(); 
        backSensor();
    }
}

function frontSensor() {
    robo.SubscribeToTimeOfFlightFront(function (data) {
        var frontDist = data.message.distanceInMeters;
        console.log("front>>" + leftDist);
        if (frontDist <= 0.400) {
            showToastMessage("Object is too near");
            driveStop();
            isStopped = true;
        }
    });
}

function leftSensor() {
    robo.SubscribeToTimeOfFlightLeft(function (data) {
        var leftDist = data.message.distanceInMeters;
        console.log("left>>" + leftDist);
        if (leftDist <= 0.500) {
            if (isStopped) {
                driveStop();
            } else {
                showToastMessage("Object at left");
                driveRightRotation();
                setTimeout(() => {
                    driveLeftRotation();
                }, 1500);
                driveForward();
            }
        }
    });
}

function rightSensor() {
    robo.SubscribeToTimeOfFlightRight(function (data) {
        var rightDist = data.message.distanceInMeters;
        console.log("right>>" +rightDist);
        if (rightDist <= 0.500) {
            if (isStopped) {
                driveStop();
            } else {
                showToastMessage("Object at right");
                driveLeftRotation();
                setTimeout(() => {
                    driveRightRotation();
                }, 1500);
                driveForward();
            }
        }
    });
}

function backSensor() {
    robo.SubscribeToTimeOfFlightBack(function (data) {
        var backDist = data.message.distanceInMeters;
        console.log("back>>" + backDist);
        if (backDist >= 0.600) {
            showToastMessage("Object missed");
            driveStop();
            isStopped = true;
        }
    });
}