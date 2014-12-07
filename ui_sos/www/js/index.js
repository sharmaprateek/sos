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
//        localStorage.clear();
        
        if (sos.isRegisteredUser()) {
            sos.server.initialize();
            app.initializeCountdown();
            app.receivedEvent('deviceready');
            console.debug("SOS APP INITAIALIZED");
        } else {
            sos.gotoLoginPage();
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
sos.user.AuthToken = "";

sos.server.initialize = function() {
    sos.user.getAuthToken();
};

sos.user.signout = function() {
    localStorage.clear();
    sos.gotoLoginPage();
}

sos.user.getAuthToken = function() {
    sos.user.AuthToken = localStorage.getItem("AuthToken");
    if (sos.user.AuthToken == null || sos.user.AuthToken == "undefined") {
        if (sos.user.username != "" && sos.user.password != "") {

            $.ajax({
                   url: sos.baseURL + "api-token-auth/",
                   contentType: "application/json",
                   type: 'post',
                   async: false,
                   data: JSON.stringify({username: sos.user.username, password: sos.user.password}),
                   success: function(response, status) {

                       console.log(status + " - autToken call - " + response.token);

                       localStorage.setItem("AuthToken", response.token);
                       sos.user.AuthToken = response.token;

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
                           navigator.notification.alert("User login unsuccessful. Please try again.");
                           sos.gotoLoginPage();
                       }
                       
                       console.log(data + " -- " + error + " --> " + xhr.responseText);
                   }
           });

        } else {
            sos.gotoLoginPage();
        }
    }
//    navigator.notification.alert('token val: ' + sos.user.AuthToken + 'token type: '+ typeof sos.user.AuthToken);
    return sos.user.AuthToken;
    
}


sos.user.login = function() {
    var loginData = {};
    sos.user.username = $("#login_username").val();
    sos.user.password = $("#login_password").val();
    var token = sos.user.getAuthToken();
    
    if (token) {
        localStorage.setItem("username",sos.user.username);
        localStorage.setItem("password",sos.user.password);
    }
}

sos.user.register = function() {

    var signupData = {};
    signupData['first_name'] = $("#first_name").val();
    signupData['last_name'] = $("#last_name").val();
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
        navigator.notification.alert("Passwords do not match.");
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
                console.log(status + " - register call - " + response);
           
                localStorage.setItem("username",signupData["username"]);
                sos.user.username = signupData["username"];

           
                localStorage.setItem("password",signupData["password"]);
                sos.user.password = signupData["password"];

           
                localStorage.setItem("email",signupData["email"]);
                sos.user.email = signupData["email"];
           
                // navigator.notification.alert("User sign up successful.");
                sos.gotoHomePage();
                sos.user.getAuthToken();

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

sos.gotoLoginPage = function() {
    $("#login_username").val("");
    $("#login_password").val("");
    $.mobile.changePage("#login");
};

sos.gotoContactsPage = function() {
    $.mobile.changePage("#contacts");
    sos.showContactList();
};

sos.isRegisteredUser = function() {
    if (localStorage.getItem('username')) {
        sos.user.username = localStorage.getItem('username');
        sos.user.email = localStorage.getItem('email');
        sos.user.password = localStorage.getItem('password');
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
    
    sos.sendSOSMessage();
    
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

sos.sendSOSMessage = function() {
    console.log("sending message now");

    var contacts = localStorage.getItem("userContacts");
    contacts = JSON.parse(contacts);
    console.log(contacts);
    var pnos = "";
    for (var i=0; i<contacts.length; i++) {
        console.log("This is single contact: ");
        console.log(contacts[i]);
        console.log(contacts[i].phone);
        pnos += contacts[i].phone.toString() + ",";
    }
    pnos = pnos.substring(0,pnos.length-1);
    pnos = pnos.split(',');

    var data = JSON.stringify({phoneNumbers: pnos, geolocation: 'Cali'});
    console.log("Final data: " + data);

    $.ajax({
           url: sos.baseURL + "sendsos/",
           type: 'post',
           data: data,
           contentType: 'application/json',
           headers: { 'Authorization': 'Token ' + sos.user.AuthToken },
           success: function(resp) {
                console.log("message sent, resp: "+resp);
           }, error:function(xhr, data, error) {
                navigator.notification.alert(data + " -- " + error + " --> " + xhr.responseText);
                console.log(data + " -- " + error + " --> " + xhr.responseText);
           },

    });
    
//    var messageInfo = {
//    phoneNumber: "5107717282",
//    textMessage: "This is a test message"
//    };
//    
//    sms.sendMessage(messageInfo, function(message) {
//                    console.log("success: " + message);
//                    }, function(error) {
//                    console.log("code: " + error.code + ", message: " + error.message);
//                    });

};

sos.getCurrentLocation = function() {
    var onSuccess = function(position) {
        navigator.notification.alert('Latitude: '          + position.coords.latitude          + '\n' +
                                     'Longitude: '         + position.coords.longitude         + '\n' +
                                     'Altitude: '          + position.coords.altitude          + '\n' +
                                     'Accuracy: '          + position.coords.accuracy          + '\n' +
                                     'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                                     'Heading: '           + position.coords.heading           + '\n' +
                                     'Speed: '             + position.coords.speed             + '\n' +
                                     'Timestamp: '         + position.timestamp                + '\n');
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


sos.addContact = function() {
    navigator.contacts.pickContact(function(contact) {
        //console.log('The following contact has been selected:' + JSON.stringify(contact));

//        navigator.notification.alert('The following contact has been selected:' + JSON.stringify(contact.phoneNumbers[0].value));
        var c = {};
        c.name = contact.name.formatted;
//                                   navigator.notification.alert(contact.phoneNumbers.length);
        if (contact.phoneNumbers.length > 0) {
            var nums = [];

            for (var i=0; i<contact.phoneNumbers.length; i++) {
                nums.push(contact.phoneNumbers[i].value);
            }
        }
        c.phone = nums;
        if (contact.emails.length > 0) {
            var emails = [];
            for (var i=0; i < contact.emails.length; i++) {
                emails.push(contact.emails[i].value);
            }
        }
        c.emails = emails;
                                   

        var userContacts = [];
       if (localStorage.getItem("userContacts") !== null) {
                                   userContacts = localStorage.getItem("userContacts");
                                   userContacts = JSON.parse(userContacts);
       }
        console.log(userContacts);
        c.id = userContacts.length + 1;
//        navigator.notification.alert(userContacts.length);

        userContacts.push(c);
        localStorage.setItem("userContacts",JSON.stringify(userContacts));
                                   console.log("done processing contact add");

                                   sos.showContactList();

    }, function(err) {
        console.log('Error: ' + err);
    });

};

sos.showContactList = function() {
    var userContacts = localStorage.getItem("userContacts") || [];
    userContacts = JSON.parse(userContacts);
    var contactList = $("#contactList");
    contactList.empty();
    console.log(userContacts);
    for (var i=0;i<userContacts.length; i++) {
        var text = '<a href="#">'+ userContacts[i].name +'</a>';
        var l = $('<li />', {html: text});
        l.attr("data-icon","delete");
        l.appendTo('#contactList')

    }
    $("#contactList").listview("refresh");
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