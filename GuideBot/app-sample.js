/**
 * Global variables
 */
var slamFailures = 0;
var worker;
let lastPoseAt = Date.now();
let currentLinearVelocity = 0;
let currentAngularVelocity = 0;
let robo = undefined;
let $audioForm = $('.audio-box');
let $imageForm = $('.image-box');
let robotVersion;

/**
 * Connects to the robort
 */
function connect2Robot() {
	if (robo === undefined || robo.GetAddress !== $("#misty-robot-ip-address").val() || robo.GetPort !== $("#misty-robot-ip-port").val()) {
		robo = new misty.apiClient.MistyRobot($("#misty-robot-ip-address").val(), $("#misty-robot-ip-port").val());
		robo.GetDeviceInformation(function (data) {
			if (data[0].result) {
				showToastMessage("Successfully connected to " + $("#misty-robot-ip-address").val() + ".");
			} else {
				showToastMessage("Having trouble connecting, please recheck the ip or name", 4000);
			}
		});
	} else {
		console.log("You have already connected to the robot. There is no need to connect to the robot again.")
	}
}

/**
 * Display Messages
 */
function need2ConnectMesssage() {
	showToastMessage("Please connect to the robot first!");
	return null;
}
function noWebsocketMessage() {
	showToastMessage("Please connect to websockets first!");
	return null;
}

/**
 * Makes adjustments to the UI based on robot version
 */
function matchPageToRobotVersion() {
	if (robotVersion == 2) {
		$(".robotVersion2").removeClass("hidden");
		$(".robotVersion1").addClass("hidden");
	}
}

/**
 * Display the message
 */
async function showToastMessage(message, timeInMs = 4000) {
	if (message) {
		var element = document.getElementById("toast");
		var snackbar = $('#toast').html(message);
		element.className = "show";
		await sleep(timeInMs);
		element.className = element.className.replace("show", "");
	}
}

/**
 * Pause the process for provide time
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * On ready document function
 */
$(document).ready(function () {
	let motions = misty.apiClient.motions;
	let moods = misty.apiClient.moods;
	let colors = misty.apiClient.colors;

	/**
	 * Initialize the robot for the application
	 */
	$("#setup").on("submit", function () {
		event.preventDefault();
		var ip = $("#misty-robot-ip-address").val();
		
		if (!ip) {
			showToastMessage("Please enter a valid IP or name");
			return;
		}

		robo = new misty.apiClient.MistyRobot(ip, 80);
		robo.GetDeviceInformation(function (data) {
			console.log(data);
			//Gets the robot version from the robot
			version = data[0].result.robotVersion;
			versionArray = version.split(".");
			robotVersion = parseInt(versionArray[0]);
			matchPageToRobotVersion();
			if (data[0].result) {
				setLEDColor("White LED");
				showToastMessage("Connected successfully.");
				robo.Connect();
			} else {
				showToastMessage("Having trouble connecting, please recheck the ip or name.");
			}
		});
		showToastMessage("Connecting to " + ip + "...", 1000);
	});


	let isAdvancedUpload = function () {
		var div = document.createElement('div');
		return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
	}

	var droppedFiles = false,
		$audioInput = $audioForm.find('input[type="file"]'),
		$imageInput = $imageForm.find('input[type="file"]'),
		$audioLabel = $audioForm.find('label'),
		$imageLabel = $imageForm.find('label'),
		showFiles = function (files, label, input) {
			label.text(files.length > 1 ? (input.attr('data-multiple-caption') || '').replace('{count}', files.length) : files[0].name);
		};

	if (isAdvancedUpload) {
		$imageForm.addClass('has-advanced-upload');
		$audioForm.addClass('has-advanced-upload');
	};

	//**ROBOT SETUP**//

	
	
	$('#red-pose-circle').show();
	$('#green-pose-circle').hide();
	$('#red-pose-circle2').show();
	$('#green-pose-circle2').hide();

	$('#perform-system-update').prop("disabled", true);

	async function workerFunction() {
		function sleep(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}

		while (true) {
			await sleep(1000);
			postMessage(true);
		}
	}

	function startWorker() {
		if (typeof (Worker) !== "undefined") {
			if (typeof (worker) == "undefined") {
				worker = new Worker(URL.createObjectURL(new Blob(["(" + workerFunction.toString() + ")()"], { type: 'text/javascript' })));
			}
			worker.onmessage = function (data) {

				if (((new Date) - lastPoseAt) > 1000) {
					$('#red-pose-circle').show();
					$('#green-pose-circle').hide();
					$('#red-pose-circle2').show();
					$('#green-pose-circle2').hide();
				}
				else {
					$('#red-pose-circle').hide();
					$('#green-pose-circle').show();
					$('#red-pose-circle2').hide();
					$('#green-pose-circle2').show();
				}
			};
		} else {
			//Browser does not support Web Workers
			showToastMessage("Sorry, but your browser does not support web workers, so your pose lights will not work", 5000)
			$('#red-pose-circle').hide();
			$('#green-pose-circle').hide();
			$('#red-pose-circle2').hide();
			$('#green-pose-circle2').hide();
		}
	}

	function stopWorker() {
		if (worker) {
			worker.terminate();
		}
		worker = undefined;
	}

	

	$('#beta-nav-button').on('click', function (e) {
		showToastMessage('The following APIs are in beta and may or may not function as intended. We are updating them weekly so stay tuned for new functionality!');
	});

	$('#alpha-nav-button').on('click', function (e) {
		showToastMessage('The following APIs are in alpha and may or may not function as intended. We are updating them weekly so stay tuned for new functionality!');
	});

	$("#subscribe-to-named-object").submit(function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {

			var eventName = $("#eventName").val();
			var namedObject = $("#namedObject").val();
			var debounce = parseInt($("#debounce").val());
			var property = $("#property").val();
			var inequality = $("#inequality").val();
			var value = $("#value").val();
			var returnProperty = $("#return-property").val();

			showToastMessage("Subscribing to " + namedObject + " as event name " + (eventName ? eventName : namedObject), 4000);
			//If face rec or detect, we  need to start those processes with an api call too...
			if (namedObject == "FaceDetection") {
				robo.RunFaceDetectionProcess(function (data) {
					console.log(JSON.stringify(data));
				});
			}
			else if (namedObject == "FaceRecognition") {
				robo.RunFaceRecognitionProcess(function (data) {
					console.log(JSON.stringify(data));
				});
			}
			else {
				robo.SubscribeToNamedObjectWithFilter(eventName, namedObject, debounce, property, inequality, value, returnProperty, function (data) {
					console.log(namedObject ? namedObject : eventName, JSON.stringify(data));
				});
			}
		}
	});

	$("#unsubscribe-from-named-object").submit(function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			var eventName = $("#event-name").val();
			if (eventName) {
				robo.UnsubscribeFromNamedObject(eventName, function (data) {
					showToastMessage("Unsubscribing from " + eventName);
					console.log(JSON.stringify(data));
				});
			}
			else {
				showToastMessage("You must enter in an event name to unsubscribe");
			}
		}
	});
	
	$("#check-for-system-updates").on("click", function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.GetStoreUpdateAvailable(function (data) {
				$('#perform-system-update').prop("disabled", true);
				console.log(data);
				if (data && data[0]) {
					if (data[0].result == true) {
						showToastMessage("System updates available");
						$('#perform-system-update').prop("disabled", false);
					}
					else if (data[0].result == false) {
						showToastMessage("No system updates available");
					}
					else {
						showToastMessage("Failed to retrieve system update information");
					}
				}
				else {
					showToastMessage("Failed to retrieve system update information");
				}
			});
		}
	});

	$("#perform-system-update").on("click", function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.PerformSystemUpdate(function (data) {
				console.log(data);
				$('#perform-system-update').prop("disabled", true);


				if (data && data[0]) {
					if (data[0].result == true) {
						showToastMessage("System updates queued");
					}
					else if (data[0].result == false) {
						showToastMessage("Failed to queue system updates");
					}
					else {
						showToastMessage("Unknown status returned from update request");
					}
				}
				else {
					showToastMessage("Failed to successfully send update request");
				}

			});
		}
	});

	//**ROBOT INFORMATION**//

	$("#misty-robot-get-device-information").on("click", function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.GetDeviceInformation(function (data) {

				if (data[0].result.ipAddress) {
					var info = JSON.stringify("IP: " + data[0].result.ipAddress + "<br />" +
						"Robot Version: " + data[0].result.robotVersion + "<br />" +
						"More details in console...");
					console.log(data[0].result);
					showToastMessage(info);
				}
				else {
					showToastMessage("Failed retrieving device information");
				}
			});
		}
	});

	$("#misty-robot-get-log-information").on("click", function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.GetLogInformation(function (data) {
				var length = data[0].result.length ? data[0].result.length : 0;
				if (length > 0) {
					var info = JSON.stringify("Log: " + data[0].result[0].name + "<br />" +
						"More details in console...");
					var length = data[0].result.length;
					console.log(JSON.stringify(data[0].result[0].content));			
					showToastMessage(info);
				}
				else
				{
					showToastMessage("Failed retrieving log information");
				}

			});
		}
	});
	
	//**DRIVE & LOCOMOTION**//

	$('#track-locomotion').submit(function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			var left = parseFloat($("#left").val(), 10);
			var right = parseFloat($("#right").val(), 10);
			showToastMessage("Driving by Track Locomotion");
			robo.LocomotionTrack(left, right);
		}
	});

	$('#stop-btn').submit(function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.DriveTime(stop, 5000);
		}
	});
	
	$("#misty-robot-move-loco-start").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Driving by Track Locomotion");
			robo.LocomotionTrack(-10, 10);
		}
	});

	$("#misty-robot-move-loco-stop").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.LocomotionTrack(0, 0);
		}
	});

	$("#misty-robot-drive-time").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Driving by time");
			robo.DriveTimeByValue(20, 8, 500);
		}
	});
	
	//**AUDIO**//
	$("#play-audio-button").on("click", function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			var assetid = $("#audio-asset-id").val();

			if (assetid === null || assetid === "") {
				showToastMessage("You must populate the audio list first");
				return;
			}

			showToastMessage("Playing audio file");
			robo.PlayAudioClip(assetid);
		}
	});

	$("#misty-robot-audio-clip-play").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			if (!lastUploadedAudio) {
				showToastMessage("No audio file has been uploaded through the browser this session")
				return;
			}

			let audioFile = $('input[name="file"]:checked').val().split("'");
			robo.PlayAudioClip(
				audioFile[3],
				function (data) {
					console.log(JSON.stringify(data));

					//$('#misty-robot-audio-clip-list-output1').text(data);
				});
		}
	});
	
	$audioInput.on('change', function (e) {
		var fileList = e.target.files;
		$audioForm.trigger('drop', fileList);
	});

	$audioForm.on('drag dragstart dragend dragover dragenter dragleave drop submit', function (e) {
		e.preventDefault();
		e.stopPropagation();
	})
		.on('dragover dragenter', function () {
			$audioForm.addClass('is-dragover');
		})
		.on('dragleave dragend drop', function () {
			$audioForm.removeClass('is-dragover');
		})
		.on('drop', function (e, fileList) {
			var submittedFiles = [];
			//bizarrely, the jQuery .on eventlistener here converts the file list array to the first index of the array. So,
			//for now, we are only handling one file.
			if (fileList) {
				submittedFiles.push(fileList);
			}
			droppedFiles = (submittedFiles.length) ? submittedFiles : e.originalEvent.dataTransfer.files;
			let files = Array.from(droppedFiles);
			var $list = $("#AudioList");
			$list.html("");
			files.forEach(file => {
				if (validateAudioFile(file)) {
					let index = files.indexOf(file)
					let reader = new FileReader();
					reader.readAsArrayBuffer(file);
					console.log(reader.result);

					reader.onload = function (event) {
						let byteArray = new Uint8Array(reader.result);
						let FileName = file.name;
						let dataAsByteArrayString = byteArray.toString();
						var listHtml = $list.html();
						output = "";
						output = '<li><label class="container">' + FileName + ' (' + file.type + ') - ' +
							file.size + ' bytes, last modified: ' +
							file.lastModifiedDate.toLocaleDateString() +
							'<input type="radio" type="text" name="audio-file" value="{\'FileName\':' + '\'' +
							FileName + '\'' + ', \'DataAsByteArrayString\':' + '\'' +
							dataAsByteArrayString + '\',' +
							'\'ImmediatelyApply\': true, \'OverwriteExisting\': true }" id="payload-' +
							index + '"><span class="checkmark"></span></label>';
						$list.html(listHtml + output);
					};
					showFiles(droppedFiles, $audioLabel, $audioInput);
				}

			});
		});

	$imageInput.on('change', function (e) {
		var fileList = e.target.files;
		$imageForm.trigger('drop', fileList);
	});


	$imageForm.on('drag dragstart dragend dragover dragenter dragleave drop submit', function (e) {
		e.preventDefault();
		e.stopPropagation();
	})
		.on('dragover dragenter', function () {
			$imageForm.addClass('is-dragover');
		})
		.on('dragleave dragend drop', function () {
			$imageForm.removeClass('is-dragover');
		})
		.on('drop submit', function (e, fileList) {
			var submittedFiles = [];
			//bizarrely, the jQuery .on eventlistener here converts the file list array to the first index of the array. So,
			//for now, we are only handling one file.
			if (fileList) {
				submittedFiles.push(fileList);
			}
			droppedFiles = (submittedFiles.length) ? submittedFiles : e.originalEvent.dataTransfer.files;
			let files = Array.from(droppedFiles);
			var $list = $("#ImageList");
			$list.html("");
			files.forEach(file => {
				if (validateImageFile(file)) {
					let index = files.indexOf(file);
					let imageReader = new FileReader();
					imageReader.readAsDataURL(file);
					imageReader.onload = function (e) {
						var img = new Image;
						img.src = imageReader.result;
						img.onload = function () {
							var imageWidth = img.width;
							var imageHeight = img.height;
							var byteReader = new FileReader;
							byteReader.readAsArrayBuffer(file);
							byteReader.onload = function (event) {
								let byteArray = new Uint8Array(byteReader.result);
								let FileName = file.name;
								let dataAsByteArrayString = byteArray.toString();
								var listHtml = $list.html();
								var input = '<input type="radio" type="text" name="image-file" value="{\'FileName\':' + '\'' +
									FileName + '\'' + ', \'DataAsByteArrayString\':' + '\'' +
									dataAsByteArrayString + '\', \'Width\':' + '\'' +
									imageWidth + '\', \'Height\':' + '\'' +
									imageHeight + '\',' +
									'\'ImmediatelyApply\': true, \'OverwriteExisting\': true}" id="payload-' +
									index + '"><span class="checkmark"></span></label>'
								var output = '<li><label class="container">' + FileName + ' (' + file.type + ') - ' + file.size + ' bytes, last modified: ' + file.lastModifiedDate.toLocaleDateString() + input;
								$list.html(listHtml + output);
							}
						}
					}
					showFiles(droppedFiles, $imageLabel, $imageInput);
				}
			});		
		});

	$('#audio-file').on('change', function (e) {
		getFilesSelected(e);
	});

	$('#image-file').on('change', function (e) {
		getFilesSelected(e);
	});

	function getFilesSelected(e) {
		var $input = $(this),
			$label = $input.next('label'),
			labelVal = $label.html();
		var fileName = '';
		if (this.files && this.files.length > 1) {
			fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
		}
		else if (e.target.value) {
			fileName = e.target.value.split('\\').pop();
		}
		if (fileName) {
			$label.find('span').html(fileName);
		}
		else {
			$label.html(labelVal);
		};
	};

	$("#copyAudioBytes").on('click', function () {
		copyBytes("audio-file");
	});

	$("#copyImageBytes").on('click', function () {
		copyBytes("image-file");
	});
	
	function copyBytes(fileId) {
		var Data = $('input[name="' + fileId + '"]:checked').val();
		if (!Data) {
			showToastMessage("You must drag and drop or click to browse for a file and then check the file that you want to copy to the clipboard.");
			return;
		}
		let File = $('input[name="' + fileId + '"]:checked').val().split("'");
		if (!Data) {
			showToastMessage("You must select the file that you want to copy to the clipboard.");
			return;
		}
		var copyText = $('input[name="' + fileId + '"]:checked').val(),
			textarea = document.createElement('textarea');
		textarea.style.width = '.001px';
		textarea.style.height = '.001px';
		textarea.style.position = 'fixed';
		textarea.style.top = '5px';
		textarea.style.zindex = -1;
		textarea.textContent = copyText;
		$("body").append(textarea);
		setTimeout(function () {
			textarea.select();
			document.execCommand("copy");
			showToastMessage("Copied to clipboard.");
		}, 500);
	};

	//**HELP**//

	$("#misty-robot-get-help").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.GetHelp(function (data) {
				console.log(typeof data[0].result);
				console.log(JSON.parse(data[0].result));
			});
		}
	});

	//**SENSOR**//

	$("#misty-robot-get-sensor-values").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.GetSensorValues();
		}
	});

	//**LED**//
	$("#drive-to-location-form").submit(function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			var x = $("#xValue").val();
			var y = $("#yValue").val();

			robo.DriveToLocation(x, y, function (data) { console.log(JSON.stringify(data)); });
		}
	});

	$("#follow-path-form").submit(function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			var path = $("#follow-path-value").val();
			showToastMessage("Attempting to follow path")
			robo.FollowPath(path, function (data) { console.log(JSON.stringify(data)); });
		}
	});

	$("#follow-path-add-waypoint").click(function (e) {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		var x = $("#follow-path-x-value").val();
		var y = $("#follow-path-y-value").val();
		var path = $("#follow-path-value").val();

		if (path.length > 0) {
			path += ',';
		}

		path += x + ":" + y;

		$("#follow-path-value").val(path);
	});

	$("#face-training-form").submit(function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			var faceId = $("#face-id").val();
			
			if (faceId === null || faceId === "") {
				showToastMessage("You must enter in a name");
				return;
			}

			showToastMessage("Starting training, put your face up to camera for 10 seconds", 4000)
			robo.StartFaceTraining(faceId, function (data) { console.log(JSON.stringify(data)); });
		}
	});

	$('#misty-robot-subscribe-to-pose').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			robo.SubscribeToXPose(function (data) {
				$('#current-x-pose').val(data.message);
			}, 1);

			robo.SubscribeToYPose(function (data) {
				$('#current-y-pose').val(data.message);
			}, 1);
		}
	});

	$('#subscribe-to-time-of-flight-front').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Subscribing to Time of Flight - Front");
			robo.SubscribeToTimeOfFlightFront(function (data) {
				console.log("Time of flight - front", JSON.stringify(data));
				$('#current-distance-front').val(data.message.distanceInMeters + " meters");
			});
		}
	});

	$('#subscribe-to-time-of-flight-right').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Subscribing to Time of Flight - Right");
			robo.SubscribeToTimeOfFlightRight(function (data) {
				console.log("TimeOfFlight", JSON.stringify(data));
				$('#current-distance-right').val(data.message.distanceInMeters + " meters");
			});
		}
	});

	$('#subscribe-to-time-of-flight-left').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {

			showToastMessage("Subscribing to Time of Flight - Left");
			robo.SubscribeToTimeOfFlightLeft(function (data) {
				console.log("TimeOfFlight", JSON.stringify(data));
				$('#current-distance-left').val(data.message.distanceInMeters + " meters");
			});
		}
	});

	$('#subscribe-to-time-of-flight-back').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Subscribing to Time of Flight - Back");
			robo.SubscribeToTimeOfFlightBack(function (data) {
				console.log("TimeOfFlight", JSON.stringify(data));
				$('#current-distance-back').val(data.message.distanceInMeters + " meters");
			});
		}
	});

	$('#misty-robot-subscribe-to-battery-charge').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			console.log("Calling to subscribe to Battery");

			showToastMessage("Subscribing to Battery");
			robo.SubscribeToBattery(function (data) {
				console.log("Battery", JSON.stringify(data));
				$('#current-battery-voltage').val(data.message.currentVoltage);
				$('#current-battery-percent').val(data.message.currentCharge + "%");
			});
		}
	});
	
	$('#unsubscribe-from-time-of-flight-front').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Unsubscribing from Time of Flight - Front");
			robo.UnsubscribeFromTimeOfFlightFront(function (data) {
				console.log(JSON.stringify(data));
			});
		}
	});

	$('#unsubscribe-from-time-of-flight-right').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Unsubscribing from Time of Flight - Right");
			robo.UnsubscribeFromTimeOfFlightRight(function (data) {
				console.log(JSON.stringify(data));
			});
		}
	});

	$('#unsubscribe-from-time-of-flight-left').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Unsubscribing from Time of Flight - Left");
			robo.UnsubscribeFromTimeOfFlightLeft(function (data) {
				console.log(JSON.stringify(data));
			});
		}
	});

	$('#unsubscribe-from-time-of-flight-back').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Unsubscribing from Time of Flight - Back");
			robo.UnsubscribeFromTimeOfFlightBack(function (data) {
				console.log(JSON.stringify(data));
			});
		}
	});

	$('#misty-robot-unsubscribe-from-battery-charge').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Unsubscribing from Battery Charge");
			robo.UnsubscribeFromBatteryCharge(function (data) {
				console.log(JSON.stringify(data));
			});
		}
	});

	$('#misty-robot-unsubscribe-from-pose').on('click', function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			robo.UnsubscribeFromPose(function (data) {
				console.log(JSON.stringify(data));
			});
		}
	});

	$("#get-path-form").submit(function (e) {
		e.preventDefault();
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			var x = $("#xValue").val();
			var y = $("#yValue").val();

			robo.GetPath(x, y, function (data) { showToastMessage(JSON.stringify(data)); });
		}
	});

	//**SLAM**//

	$("#misty-robot-slam-get-raw-map").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Retrieving map, this could take a minute...");
			robo.GetRawMap(function (data) {
				ProcessMapData(data);
			});
		}
	});

	//Sample.html + index.html
	$("#misty-robot-slam-get-map").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Retrieving map, this could take a minute...");
			robo.GetMap(function (data) {
				ProcessMapData(data);
			});
		}
	});

	function ProcessMapData(data) {
		if (!(data[0].status === "Success" && data[0].result.isValid)) {
			showToastMessage("Invalid map or no data returned, please attempt to create a new map");
			return;
		}

		console.log("Valid data - meters per cell = " + data[0].result.metersPerCell);

		var pixelPerGrid = $("#pixel-per-grid").val();
		var boxSizeInPixels = pixelPerGrid && pixelPerGrid > 0 ? pixelPerGrid : 5;

		$("#selected-pixel-per-grid").val(boxSizeInPixels);

		//redraw the map here
		var canvas = document.getElementById("mapCanvas");
		var context = canvas.getContext("2d");

		//Clear the old map
		context.clearRect(0, 0, canvas.width, canvas.height);

		var metersPerCell = data[0].result.metersPerCell;

		//TODO Fix orientation, as X & Y are rotated making this code messy
		var originX = data[0].result.originX;
		var originY = data[0].result.originY;

		//Grab the pose from the wbsocket return - use the last pose
		var poseX = parseFloat($("#current-x-pose").val());
		var poseY = parseFloat($("#current-y-pose").val());

		//Hack, if we try to pull a map from memory on a reload
		//TODO?? An API endpoint to get pose upon map load, or return with map?!?!
		poseX = isNaN(poseX) ? 0 : poseX;
		poseY = isNaN(poseY) ? 0 : poseY;

		//create the scaled map
		canvas.width = (data[0].result.width - 1) * boxSizeInPixels;
		canvas.height = (data[0].result.height - 1) * boxSizeInPixels;

		//Fix all of this since rotation is unecessary now ?!?!
	//	context.translate(canvas.width, canvas.height);
//		context.rotate(Math.PI); //rotate 180 degrees
		context.scale(boxSizeInPixels, boxSizeInPixels);

		data[0].result.grid.reverse().forEach(function (item) { item.reverse(); });

		for (var currentX = data[0].result.height - 1; currentX >= 0; currentX--) {
			for (var currentY = data[0].result.width - 1; currentY >= 0; currentY--) {
				context.beginPath();
				context.lineWidth = 1;

				switch (data[0].result.grid[currentX][currentY]) {
					case 0:
						// "Unknown"
						context.fillStyle = 'rgba(133, 133, 133, 1.0)'; // '#858585';
						break;
					case 1:
						// "Open"
						context.fillStyle = 'rgba(255, 255, 255, 1.0)'; // '#FFFFFF';
						break;
					case 2:
						// "Occupied"
						context.fillStyle = 'rgba(42, 42, 42, 1.0)'; // '#2A2A2A';
						break;
					case 3:
						// "Covered"
						context.fillStyle = 'rgba(102, 0, 237, 1.0)'; // 'rgba(33, 27, 45, 0.5)'; // '#6600ED';
						break;
					default:
						context.fillStyle = '#ff9b9b';
						break;
				}

				context.rect(currentY - 1 * boxSizeInPixels, currentX - 1 * boxSizeInPixels, boxSizeInPixels, boxSizeInPixels);
				context.fill();
			}
		}

		//TODO Fix display of robot location, this gets close, but not 100% there
		var robotXLocation = Math.abs((poseX - originX) / metersPerCell);
		var robotYLocation = Math.abs((poseY - originY) / metersPerCell);

		context.beginPath();
		context.fillStyle = 'Red';
		context.rect(robotYLocation, robotXLocation, 1, 1);
		context.fill();

		//TODO calc boundries b4 and where to place markers so from left

		var xLocation = data[0].result.height;
		var xCounter = 0;
		while (xLocation >= 0) {
			context.beginPath();
			context.fillStyle = 'Red';
			context.font = "2px Arial";
			context.fillText(xCounter == 0 ? "" : xCounter, data[0].result.width - 5, xLocation);
			context.fill();
			xLocation = xLocation - 5;
			xCounter += 5;
		}

		context.beginPath();
		context.fillStyle = 'Red';
		context.font = "2px Arial";
		context.fillText("X", data[0].result.width - 10, xLocation+5);
		context.fill();

		var yLocation = data[0].result.width;
		var yCounter = 0;
		while (yLocation >= 0) {
			context.beginPath();
			context.fillStyle = 'Red';
			context.font = "2px Arial";
			context.fillText(yCounter== 0 ? "" : yCounter, yLocation, data[0].result.height - 1);
			context.fill();
			yLocation = yLocation - 5;
			yCounter += 5;
		}

		context.beginPath();
		context.fillStyle = 'Red';
		context.font = "2px Arial";
		context.fillText("Y <---", yLocation+5, data[0].result.height - 5);
		context.fill();
	};

	$("#misty-robot-slam-get-status").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.GetStatus(function (data) {
				if (data[0] && data[0].result && data[0].result.sensorStatus) {

					if (data[0].result.sensorStatus == "Uninitialized" ||
						data[0].result.sensorStatus == "Connected" ||
						data[0].result.sensorStatus == "Booting" ||
						data[0].result.sensorStatus == "Ready") {

						slamFailures = 0;
						showToastMessage("Successfully retrieved slam status of '" + data[0].result.sensorStatus + "'.  Ready to map or track.");						
					}
					else {
						slamFailures++;
						if (slamFailures > 5) {
							showToastMessage("Received status of '" + data[0].result.sensorStatus + "', try resetting or try restarting your robot");
						}
						else {
							showToastMessage("Failed to get ready slam status, instead received '" + data[0].result.sensorStatus + "'");
						}
					}
				}
				else {
					slamFailures++;
					if (slamFailures > 5) {
						showToastMessage("Failed to get ready slam status, try resetting or try restarting your robot");
					}
					else {
						showToastMessage("Failed to get ready slam status");
					}
				}
			});
		}
	});

	$("#misty-robot-slam-get-path").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.GetPath(2, 2, function (data) { showToastMessage(JSON.stringify(data)); });
		}
	});

	$("#misty-robot-slam-map-start").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			
			startWorker();
			robo.StartMapping(function (data) {
				if (data[0].result) {
					showToastMessage("Successfully started mapping, please wait for pose...");
				}
				else {
					showToastMessage("Uninitialized response from call to start mapping, trying to obtain pose...");
				}				
			});

			robo.SubscribeToXPose(function (data) {
				$('#current-x-pose').val(data.message);
				$('#red-pose-circle').hide();
				$('#green-pose-circle').show();
				$('#red-pose-circle2').hide();
				$('#green-pose-circle2').show();
				lastPoseAt = Date.now();
			}, 1);

			robo.SubscribeToYPose(function (data) {
				$('#current-y-pose').val(data.message);
				$('#red-pose-circle').hide();
				$('#green-pose-circle').show();
				$('#red-pose-circle2').hide();
				$('#green-pose-circle2').show();
				lastPoseAt = Date.now();
			}, 1);
/*
			robo.SubscribeToNamedObjectWithFilter("ApiMappingLocomotionCommand", "LocomotionCommand", 250, null, null, null, null, function (data) {
				$('#current-locomotion').val(JSON.stringify(data.message));
			});

			robo.SubscribeToNamedObjectWithFilter("ApiMappingHaltCommand", "HaltCommand", 250, null, null, null, null, function (data) {
				$('#current-halt').val(JSON.stringify(data.message));
			});

		*/
		}
	});

	$("#misty-robot-slam-mapping-stop").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Stopping mapping");
			stopWorker();
			$('#red-pose-circle').show();
			$('#green-pose-circle').hide();
			$('#red-pose-circle2').show();
			$('#green-pose-circle2').hide();

			robo.StopMapping(function (data) {  });

			robo.UnsubscribeFromNamedObject("PoseSubscriptionY", function (data) {
				console.log(JSON.stringify(data));
			});

			robo.UnsubscribeFromNamedObject("PoseSubscriptionX", function (data) {
				console.log(JSON.stringify(data));
			});
			/*
			robo.UnsubscribeFromNamedObject("ApiMappingLocomotionCommand", function (data) {
				console.log(JSON.stringify(data));
			});

			robo.UnsubscribeFromNamedObject("ApiMappingHaltCommand", function (data) {
				console.log(JSON.stringify(data));
			});
			*/
		}
	});

	$("#misty-robot-square-drive").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Doing square drive");

			var mappingVelocity = $("#mapping-velocity").val();

			if (!mappingVelocity || mappingVelocity > 100 || mappingVelocity < -100) {
				mappingVelocity = 20;
			}

			robo.DriveTimeByValue(mappingVelocity, 0, 3000,
				function (data) {
					robo.DriveTimeByValue(0, mappingVelocity, 1000,
						function (data) {
							robo.DriveTimeByValue(mappingVelocity, 0, 3000,
								function (data) {
									robo.DriveTimeByValue(0, mappingVelocity, 1000,
										function (data) {
											robo.DriveTimeByValue(mappingVelocity, 0, 3000,
												function (data) {
													robo.DriveTimeByValue(0, mappingVelocity, 1000,
														function (data) {
															robo.DriveTimeByValue(mappingVelocity, 0, 3000);
														});
												});
										});
								});
						});
				});
		}
	});

	$("#misty-robot-circle-drive").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Doing circle drive");

			var mappingVelocity = $("#mapping-velocity").val();

			if (!mappingVelocity || mappingVelocity > 100 || mappingVelocity < -100) {
				mappingVelocity = 25;
			}
			robo.DriveTimeByValue(mappingVelocity, mappingVelocity / 2, 15000, function (data) { robo.TurnRobot(mappingVelocity, 45, 10000); });			
		}
	});

	$("#misty-robot-turn").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Turning robot");
			var mappingVelocity = $("#mapping-velocity").val();

			if (!mappingVelocity || mappingVelocity > 100 || mappingVelocity < -100) {
				mappingVelocity = 25;
			}

			robo.TurnRobot(mappingVelocity, 45, 10000, function (data) { console.log(JSON.stringify(data)); });
		}
	});

	$("#misty-robot-stop").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Stopping");
			robo.StopRobot(function (data) { console.log(JSON.stringify(data)); });
		}
	});

	$("#misty-robot-stop2").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Stopping");
			robo.StopRobot(function (data) { console.log(JSON.stringify(data)); });
		}
	});
	
	$("#misty-robot-slam-tracking-start").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {

			startWorker();
			robo.StartTracking(function (data) {
				if (data[0].result) {
					showToastMessage("Successfully started tracking, please wait for pose...");
				}
				else {
					showToastMessage("Uninitialized response from call to start tracking, trying to obtain pose...");
				}
			});

			robo.SubscribeToXPose(function (data) {
				$('#current-x-pose').val(data.message);
				$('#red-pose-circle').hide();
				$('#green-pose-circle').show();
				$('#red-pose-circle2').hide();
				$('#green-pose-circle2').show();
				lastPoseAt = Date.now();
			}, 1);

			robo.SubscribeToYPose(function (data) {
				$('#current-y-pose').val(data.message);
				$('#red-pose-circle').hide();
				$('#green-pose-circle').show();
				$('#red-pose-circle2').hide();
				$('#green-pose-circle2').show();
				lastPoseAt = Date.now();
			}, 1);
/*
			robo.SubscribeToNamedObjectWithFilter("ApiMappingLocomotionCommand", "LocomotionCommand", 250, null, null, null, null, function (data) {
				$('#current-locomotion').val(JSON.stringify(data.message));
			});

			robo.SubscribeToNamedObjectWithFilter("ApiMappingHaltCommand", "HaltCommand", 250, null, null, null, null, function (data) {
				$('#current-halt').val(JSON.stringify(data.message));
			});
			*/
		}
	});

	$("#misty-robot-slam-tracking-stop").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else if (!robo.IsWebsocketConnected) {
			noWebsocketMessage();
		}
		else {
			showToastMessage("Stopping tracking");
			stopWorker();
			$('#red-pose-circle').show();
			$('#green-pose-circle').hide();
			$('#red-pose-circle2').show();
			$('#green-pose-circle2').hide();

			robo.StopTracking(function (data) { });

			robo.UnsubscribeFromNamedObject("PoseSubscriptionY", function (data) {
				console.log(JSON.stringify(data));
			});

			robo.UnsubscribeFromNamedObject("PoseSubscriptionX", function (data) {
				console.log(JSON.stringify(data));
			});
			/*
			robo.UnsubscribeFromNamedObject("ApiMappingLocomotionCommand", function (data) {
				console.log(JSON.stringify(data.message));
			});

			robo.UnsubscribeFromNamedObject("ApiMappingHaltCommand", function (data) {
				console.log(JSON.stringify(data));
			});*/			
		}
	});

	$("#misty-robot-slam-recording-start").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Starting recording");
			robo.StartRecording(function (data) { console(JSON.stringify(data)); });
		}
	});

	$("#misty-robot-slam-recording-stop").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			showToastMessage("Stopping recording");
			robo.StopRecording(function (data) { console(JSON.stringify(data)); });
		}
	});

	$("#misty-robot-slam-reset").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.ResetMapping(function (data) {
				if (data[0].result) {
					showToastMessage("Successfully reset slam");
					slamFailures = 0;
				}
				else {
					if (slamFailures > 5) {
						showToastMessage("Failed to reset slam again, you may want to try restarting your robot");
					}
					else {
						showToastMessage("Failed to successfully reset slam");
					}
					slamFailures++;
				}
				
			});
		}
	});

	$("#misty-robot-slam-sensor-reboot").click(function () {
		if (robo === undefined) {
			need2ConnectMesssage();
		}
		else {
			robo.SensorReboot(function (data) { alert(JSON.stringify(data)); });
		}
	});

});