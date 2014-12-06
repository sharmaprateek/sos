/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var sos = sos || {};

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        sos.server.initialize();

        if (sos.isRegisteredUser()) {
            app.initializeCountdown();
            app.receivedEvent('deviceready');
            console.debug("SOS APP INITAIALIZED");
        } else {
            sos.gotoSignupPage();
        }
        
        $( document ).on( "mobileinit", function() {
            $.mobile.loader.prototype.options.text = "loading";
            $.mobile.loader.prototype.options.textVisible = false;
            $.mobile.loader.prototype.options.theme = "a";
            $.mobile.loader.prototype.options.html = "";
        });
    },
    
    // initialize the countdown to raise alarm
    initializeCountdown: function() {
        sos.activateCountDown(5);
    },
    
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

};

app.initialize();


// variable init section
sos.countDownCancelled = false;
sos.isAlarmOn = false;
sos.baseURL = "http://192.168.2.216:8000/"


sos.server = {};
sos.user = {};

sos.server.initialize = function() {

//    if (sos.isRegisteredUser()) {
//        sos.userData.AuthToken = "";
//    } else {
//        sos.gotoSignupPage();
//    }

//    $.ajax({
//           type: "POST",
//           dataType: "jsonp",
//           url: "http://localhost:8000/api-auth/login/",
//           data: { username: "prateek", password: "prateek" },
//           success: function(data) {
//               navigator.notification.alert('success');
//               var csrftoken = sos.util.getCookie('csrftoken');
//               navigator.notification.alert(csrftoken);
//           },
//           error:function(xhr, data, error) {
//                navigator.notification.alert(data + ' -- ' + error);
//                var csrftoken = sos.util.getCookie('csrftoken');
//                navigator.notification.alert('cookie: '+csrftoken);
//           }
//           });


};

sos.user.register = function() {

    var signupData = {};
    signupData['fname'] = $("#first_name").val();
    signupData['lname'] = $("#last_name").val();
    signupData['username'] = $("#username").val();
    signupData['password'] = $("#password").val();
    signupData['confirm_password'] = $("#confirm_password").val();
    signupData['email'] = $("#email").val();
    
    for (var field in signupData) {
        if ($.trim(signupData[field]) == '') {
            $("#"+field).focus();
            navigator.notification.alert("Please fill in all the fields.");
            return;
        }
    }
    
    if (signupData['password'] != signupData['confirm_password']) {
        navigator.notification.alert("Passwords do not match."+signupData['password']+" == "+signupData['confirm_password']);
        $("#password").val("");
        $("#confirm_password").val("");
        $("#password").focus();
        return;
    }

    if (!sos.util.isValidEmail(signupData['email'])) {
        navigator.notification.alert("Please enter a valid email address.");
        $("#email").val("");
        $("#email").focus("");
    }
    
    delete(signupData['confirm_password']);
    
    $.ajax({
           url: sos.baseURL + "register/",
           contentType: "application/json",
           type: 'post',
           data: JSON.stringify(signupData),
           success: function(xhr, status, response) {
                console.log(status + " -- " + response);
                localStorage.setItem("username",signupData["username"]);
                localStorage.setItem("email",signupData["email"]);
           
                navigator.notification.alert("User sign up successful.");
                sos.gotoHomePage();
           },
           error: function(xhr, data, error) {
               if (xhr.responseText) {
                    var errorDetail = "";
                    var resp = JSON.parse(xhr.responseText);
                    for (error in resp) {
                        errorDetail += resp[error][0] + "\n";
                    }
                    navigator.notification.alert(errorDetail);
               } else {
                    navigator.notification.alert("User sign up unsuccessful. Please try again later.");
               }
               
               console.log(data + " -- " + error + " --> " + xhr.responseText);
           }
    });
    
};

sos.gotoHomePage = function() {
    $.mobile.changePage("#home");
    sos.cancelCountDown();
};
           
sos.gotoSignupPage = function() {
    $.mobile.changePage("#signup");
}

sos.isRegisteredUser = function() {
    if (localStorage.getItem('username')) {
        sos.user.username = localStorage.getItem('username');
        sos.user.email = localStorage.getItem('email');
//        sos.user.token = localStorage.getItem('toekn');
        return true;
    }
    return false;
}

sos.activateCountDown = function(secs) {
    if (sos.countDownCancelled == true) {
        return;
    }
    $("#countdownDiv").html("Initiating in " + secs);
//    navigator.notification.alert('secs = '+ secs);
    if (secs > 0) {
        setTimeout( function() {
                   sos.activateCountDown(secs-1);
        },1000);
    } else if (secs === 0 && !sos.countDownCancelled) {
        $("#cancelSOSButton").hide();
        sos.soundSOSNow();
    }
};

sos.cancelCountDown = function() {
    sos.countDownCancelled = true;
    sos.isAlarmOn = false;
    $("#countdownDiv").html("Click to Sound Alarm");
    $("#cancelSOSButton").hide();
};


sos.soundSOSNow = function() {
    // Audio player
    var src = "resources/alarm.wav";
    
    if (device.platform == "Android") {
        src = '/android_asset/www/' + src;
    }
    
    var loop = function (status) {
        if (status === Media.MEDIA_STOPPED && sos.isAlarmOn) {
            sos.alarm.play();
        }
    };
    
    sos.alarm = new Media(src, null, function() {navigator.notification.alert('Unable to sound alarm');}, loop);
    sos.alarm.play();

    sos.isAlarmOn = true;
    
    $("#countdownDiv").html("Click to STOP");
    
    
    window.plugins.flashlight.available( function(isAvailable) {

            if (isAvailable) {
                                        
                // switch on
                window.plugins.flashlight.switchOn(); // success/error callbacks may be passed
                        
                // switch off after 3 seconds
                setTimeout(function() {
                    window.plugins.flashlight.switchOff(); // success/error callbacks may be passed
                }, 3000);
            } else {
                // navigator.notification.alert("Flashlight not available on this device");
            }
    });
    
    sos.getCurrentLocation();
    

};

sos.getCurrentLocation = function() {
    var onSuccess = function(position) {
//        navigator.notification.alert('Latitude: '          + position.coords.latitude          + '\n' +
//                                     'Longitude: '         + position.coords.longitude         + '\n' +
//                                     'Altitude: '          + position.coords.altitude          + '\n' +
//                                     'Accuracy: '          + position.coords.accuracy          + '\n' +
//                                     'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
//                                     'Heading: '           + position.coords.heading           + '\n' +
//                                     'Speed: '             + position.coords.speed             + '\n' +
//                                     'Timestamp: '         + position.timestamp                + '\n');
    };
    
    // onError Callback receives a PositionError object
    //
    function onError(error) {
        navigator.notification.alert('code: '    + error.code    + '\n' +
                                     'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

}

sos.sosButton = function() {
    if (sos.isAlarmOn === true) {
        sos.stopSOS();
    } else {
        sos.cancelCountDown();
        sos.soundSOSNow();
    }
};

sos.stopSOS = function() {
    sos.isAlarmOn = false;
    sos.alarm.stop();
    $("#countdownDiv").html("Click to Sound Alarm");
};

sos.util = {
    showContactPicker: function() {
        //navigator.notification.alert('Launching contact picker');
        navigator.contacts.pickContact(function(contact){
               console.log('The following contact has been selected:' + JSON.stringify(contact));
               navigator.notification.alert('The following contact has been selected:' + JSON.stringify(contact));
        }, function(err){
               console.log('Error: ' + err);
        });
    },
    isValidEmail: function ($email) {
        var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        if( !emailReg.test( $email ) ) {
            return false;
        } else {
            return true;
        }
    }

}