/**
 * Drive the robort in the forward direction
 */
function driveForward() {
    var velocity = $("#drive-time-velocity").val();
    HandleDriveSelection(velocity, 0);
}

/**
 * Turn the robort to the left direction
 */
function driveLeftTurn() {
    var velocity = $("#drive-time-velocity").val();
    if (robotVersion == 2) {
        HandleDriveSelection(velocity, -velocity * 0.8);
    } else {
        HandleDriveSelection(velocity, velocity * 0.25);
    }	
}

/**
 * Turn the robort to the right direction
 */
function driveRightTurn() {
    var velocity = $("#drive-time-velocity").val();
    if (robotVersion == 2) {
        HandleDriveSelection(velocity, velocity * 0.8);
    } else {
        HandleDriveSelection(velocity, -velocity * 0.25);
    }
}

/**
 * Drive the robort in the backward direction
 */
function driveBackward() {
    var velocity = $("#drive-time-velocity").val();
    HandleDriveSelection(-velocity, 0);
}

/**
 * Rotate the robort in the left direction
 */
function driveLeftRotation() {
    var velocity = $("#drive-time-velocity").val();
    if (robotVersion == 2) {
        HandleDriveSelection(0, -velocity);
    } else {
        HandleDriveSelection(0, velocity);
    }
}

/**
 * Rotate the robort in the right direction
 */
function driveRightRotation() {
    var velocity = $("#drive-time-velocity").val();
    if (robotVersion == 2) {
        HandleDriveSelection(0, velocity);
    } else {
        HandleDriveSelection(0, -velocity);
    }
}

/**
 * Rotate the robort in the reverse left direction
 */
function driveLeftBackwardRotation() {
    var velocity = $("#drive-time-velocity").val();
    if (robotVersion == 2) {
        HandleDriveSelection(-velocity, velocity * 0.8);
    } else {
        HandleDriveSelection(-velocity, -velocity * 0.25);
    }
}

/**
 * Rotate the robort in the reverse right direction
 */
function driveRightBackwardRotation() {
    var velocity = $("#drive-time-velocity").val();
    if (robotVersion == 2) {
        HandleDriveSelection(-velocity, -velocity * 0.8);
    } else {
        HandleDriveSelection(-velocity, velocity * 0.25);
    }
}
