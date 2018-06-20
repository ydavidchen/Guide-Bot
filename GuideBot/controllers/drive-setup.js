/**
 * Start the robort movements
 */
function driveStart() {
    driveForward();
}

/**
 * Stop the robort movements
 */
function driveStop() {
    if (robo === undefined) {
        need2ConnectMesssage();
    } else {
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