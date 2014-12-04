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
        app.initializeCountdown();
        app.receivedEvent('deviceready');
        console.debug("SOS APP INITAIALIZED");
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
    
    
    window.plugins.flashlight.available(function(isAvailable) {
                                        if (isAvailable) {
                                        
                                        // switch on
                                        window.plugins.flashlight.switchOn(); // success/error callbacks may be passed
                                        
                                        // switch off after 3 seconds
                                        setTimeout(function() {
                                                   window.plugins.flashlight.switchOff(); // success/error callbacks may be passed
                                                   }, 3000);
                                        
                                        } else {
                                        alert("Flashlight not available on this device");
                                        }
                                        });

};

sos.sosButton = function() {
    if (sos.isAlarmOn === true) {
        sos.stopSOS();
    } else {
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
    }
}