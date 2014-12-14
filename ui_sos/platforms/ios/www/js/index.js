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
            sos.hideFalseAlertButton();
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
                   console.log(response.token);
                        console.log(status + " - authToken call - " + response.token);

                        localStorage.setItem("AuthToken", response.token);
                        sos.user.AuthToken = response.token;
                   console.log("going to home page");
                        sos.gotoHomePage();
                   console.log("going to settings page");
                        sos.gotoSettingsPage();
                   console.log("calling timed out alert");
                        setTimeout(function(){navigator.notification.alert("Please add a few contacts to reach out to when in emeregency.", function(){sos.addContact()});},2000);
                  console.log("going to contacts page");
                        sos.gotoContactsPage();
                   
                   },
                   error: function(xhr, data, error) {
                        console.log('error while getting token');
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
            return false;
        }
    }
//    navigator.notification.alert('token val: ' + sos.user.AuthToken + 'token type: '+ typeof sos.user.AuthToken);
    console.log("returning token: "+sos.user.AuthToken);
    return sos.user.AuthToken;
    
}


sos.user.login = function() {
    var loginData = {};
    sos.user.username = $("#login_username").val();
    sos.user.password = $("#login_password").val();
    var token = sos.user.getAuthToken();
    
    if (token) {
        console.log("storing user info locally");
        localStorage.setItem("username",sos.user.username);
        localStorage.setItem("password",sos.user.password);
        sos.user.registerDevice();
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
                //sos.gotoHomePage();
           
                sos.gotoContactsPage();
                sos.user.getAuthToken();
                sos.user.registerDevice();

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

sos.user.registerDevice = function() {
    var dateField = sos.util.getCurrentDate();
    var data = JSON.stringify({device_uuid: device.uuid, date_added:dateField, phone_number: "000"});
    console.log(data);
    $.ajax({
           url: sos.baseURL + 'mobile-info/',
           type: 'post',
           contentType: 'application/json',
           data: data,
           headers: { 'Authorization': 'Token ' + sos.user.AuthToken },
           success: function(response) {
               console.log('mobile device registered successfully.');
           },
           error: function(xhr) {
               console.log(xhr.responseText);
           },
    });
}

sos.gotoHomePage = function() {
    $.mobile.changePage("#home");
    sos.hideFalseAlertButton();
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

sos.gotoIncidentReportsPage = function() {
    $.mobile.changePage("#reports");
    sos.showIncidentsList();
};

sos.gotoReportIncidentPage = function() {
    $.mobile.changePage("#report_incident");
};

sos.gotoSettingsPage = function() {
    $.mobile.changePage("#settings");
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
    
    window.plugins.flashlight.available( function(isAvailable) {

            if (isAvailable) {
                                        
                // switch on
                window.plugins.flashlight.switchOn(); // success/error callbacks may be passed
                        
                // switch off after 3 seconds
                setTimeout(function() {
                    sos.toggleFlashLight(); // success/error callbacks may be passed
                }, 1000);
            } else {
                // navigator.notification.alert("Flashlight not available on this device");
            }
    });
    
    sos.initiateSOS();

};

sos.toggleFlashLight = function() {
    if (sos.isAlarmOn) {
        window.plugins.flashlight.toggle();
        setTimeout(function() {
           sos.toggleFlashLight(); // success/error callbacks may be passed
        }, 1000);
    }
}

sos.sendSOSMessage = function(address) {
    console.log("sending message now");

    var contacts = localStorage.getItem("userContacts");
    contacts = JSON.parse(contacts);

    var pnos = "";
    for (var i=0; i<contacts.length; i++) {
        pnos += contacts[i].phone.toString() + ",";
    }
    pnos = pnos.substring(0,pnos.length-1);
    pnos = pnos.split(',');

    var data = JSON.stringify({phoneNumbers: pnos, geolocation: address});

    console.log("Final data: " + data);

    $.ajax({
           url: sos.baseURL + "sendsos/",
           type: 'post',
           data: data,
           contentType: 'application/json',
           headers: { 'Authorization': 'Token ' + sos.user.AuthToken },
           success: function(resp) {
                console.log("message sent, resp: "+resp);
                sos.showFalseAlertButton();
           }, error:function(xhr, data, error) {
                //navigator.notification.alert(data + " -- " + error + " --> " + xhr.responseText);
                console.log(data + " -- " + error + " --> " + xhr.responseText);
           },

    });
    
};



sos.getCurrentLocationOnMap = function() {
    sos.clearMap();
    
    var onSuccess = function(location) {
        var msg = ["Current your location:\n",
                   "latitude:" + location.latLng.lat,
                   "longitude:" + location.latLng.lng,
                   "speed:" + location.speed,
                   "time:" + location.time,
                   "bearing:" + location.bearing].join("\n");
    
        
        var request = {
            'position': location.latLng
        };

        plugin.google.maps.Geocoder.geocode(request, function(results) {
            if (sos.marker && sos.marker.remove) {
                sos.marker.remove();
            };
            if (results.length) {
                var result = results[0];
                var position = result.position;
                var address = [
                               result.subThoroughfare || "",
                               result.thoroughfare || "",
                               result.locality || "",
                               result.adminArea || "",
                               result.postalCode || "",
                               result.country || ""].join(", ");
                map.addMarker({
                              'position': position,
                              'title':  address,
                              }, function(marker) {
                              sos.marker = marker;
                              map.animateCamera({
                                                'target': position,
                                                'zoom': 13
                                                }, function() {
                                                marker.showInfoWindow();
                                                });
                              
                              });
                                            
// red = #880000, yellow = #F0E68C, green = #ADFF2F
                map.addCircle({
                              'center': position,
                              'radius': 1000,
                              'strokeColor' : '#AA00FF',
                              'strokeWidth': 1,
                              'fillColor' : sos.color.green
                              }, function(circle) {
                              sos.circle = circle;
                              });
            } else {
                console.log("Not found");
            }
        });
        

    };
    
    var onError = function(msg) {
        console.log("error: " + msg);
    };
    map.showDialog();
    
    map.getMyLocation(onSuccess, onError);


};

sos.color = {};
sos.color.red = "#880000";
sos.color.green = "#00CC00";
sos.color.yellow = "#F0E68C";

sos.locateAddressOnMap = function() {
    sos.clearMap();
    var address = $("#find_address").val();
    var request = {
        'address': address
    };
    plugin.google.maps.Geocoder.geocode(request, function(results) {
        if (results.length) {
        var result = results[0];
        var position = result.position;
        map.showDialog();
        map.addMarker({
                      'position': position,
                      'title':  address
                      }, function(marker) {
                      
                      map.animateCamera({
                                        'target': position,
                                        'zoom': 13
                                        }, function() {
                                        marker.showInfoWindow();
                                        });
                              });
                      map.addCircle({
                                    'center': position,
                                    'radius': 1000,
                                    'strokeColor' : '#AA00FF',
                                    'strokeWidth': 1,
                                    'fillColor' : sos.color.yellow
                                    }, function(circle) {
                                    sos.circle = circle;

                      });
        } else {
            navigator.notification.alert("Location not found");
            console.log("Location Not found");
        }
    });
    var onError = function(msg) {
        console.log("error: " + msg);
    };

    
//    map.getMyLocation(onSuccess, onError);

};

sos.clearMap = function() {
    if (sos.marker && sos.marker.remove) {
        console.log("removing marker");
        sos.marker.remove();
    };
    if (sos.circle && sos.circle.remove) {
        console.log("removing circle");
        sos.circle.remove();
    };
}

sos.initiateSOS = function() {
    
    
    var onSuccess = function(location) {
        var msg = ["Current your location:\n",
                   "latitude:" + location.latLng.lat,
                   "longitude:" + location.latLng.lng,
                   "speed:" + location.speed,
                   "time:" + location.time,
                   "bearing:" + location.bearing].join("\n");
        
        
        var request = {
            'position': location.latLng
        };
        plugin.google.maps.Geocoder.geocode(request, function(results) {
            if (results.length) {
                var result = results[0];
                var position = result.position;
                var completeAddress = [
                               result.subThoroughfare || "",
                               result.thoroughfare || "",
                               result.locality || "",
                               result.adminArea || "",
                               result.postalCode || "",
                               result.country || ""].join(", ");
                                            
                var address = (result.subThoroughfare || "") + (result.thoroughfare || "");
                var city = result.locality || "";
                var state = result.adminArea || "";
                var zip = result.postalCode || "";
                var country = result.country || "";

                sos.sendSOSMessage(completeAddress);

                var dateField = sos.util.getCurrentDate();
                var incidentData = {longitude: location.latLng.lng, latitude: location.latLng.lat, address: address, city: city, state: state, zip: zip, country: country, summary: "SOS initiated on mobile device.", description: "SOS was triggered on mobile device, user might be in some trouble.", date_recorded: dateField};
                
                sos.registerIncident(incidentData);
            } else {
                console.log("Not found");
            }
        });

        
    };
    
    var onError = function(msg) {
        console.log("error: " + msg);
    };
    
    map.getMyLocation(onSuccess, onError);
}

sos.registerIncident = function (incidentData) {
    console.log(incidentData);
    console.log(JSON.stringify(incidentData));
    $.ajax({
           url: sos.baseURL + "incident/",
           contentType: "application/json",
           headers: { 'Authorization': 'Token ' + sos.user.AuthToken },
           type: 'post',
           data: JSON.stringify(incidentData),
           success: function(xhr, status, response) {
               console.log(status + " - incident register call - " + response);
           },
           error: function(xhr, data, error) {
               if (xhr.responseText) {
                   var errorDetail = "";
                   var resp = JSON.parse(xhr.responseText);
                   for (error in resp) {
                        errorDetail += resp[error][0] + "\n";
                    }
                    navigator.notification.alert("Error while registering incident: " + errorDetail);
               }
               console.log(data + " -- " + error + " --> " + xhr.responseText);
           }
   });

};

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
    window.plugins.flashlight.switchOff();
    $("#countdownDiv").html("Click to Sound Alarm");
};

sos.flagFalseAlert = function() {
    
    function onPrompt(results) {
        console.log("You selected button number " + results.buttonIndex + " and entered " + results.input1);
        
        if (results.buttonIndex == 1) {
            
            if (sos.isValidPassword(results.input1)) {
                sos.sendFalseAlertMessage($("#false_alert_message").val());
            } else {
                sos.flagFalseAlert();
                return;
            }
            
        } else {
            sos.gotoHomePage();
        }
    }
    
    navigator.notification.prompt(
                                  'Please enter your password',  // message
                                  onPrompt,                  // callback to invoke
                                  'Security',            // title
                                  ['Ok','Cancel'],             // buttonLabels
                                  ''                 // defaultText
                                  );
    

};

sos.sendFalseAlertMessage = function(message) {

    
    console.log("sending false alert message now");
    
    var contacts = localStorage.getItem("userContacts");
    contacts = JSON.parse(contacts);
    
    var pnos = "";
    for (var i=0; i<contacts.length; i++) {
        pnos += contacts[i].phone.toString() + ",";
    }
    pnos = pnos.substring(0,pnos.length-1);
    pnos = pnos.split(',');
    
    var data = JSON.stringify({phoneNumbers: pnos, message: message});
    
    console.log("Final data: " + data);
    
    $.ajax({
           url: sos.baseURL + "sendfalsealert/",
           type: 'post',
           data: data,
           contentType: 'application/json',
           headers: { 'Authorization': 'Token ' + sos.user.AuthToken },
           success: function(resp) {
                console.log("message sent, resp: "+resp);
                sos.gotoHomePage();
           }, error:function(xhr, data, error) {
           //navigator.notification.alert(data + " -- " + error + " --> " + xhr.responseText);
           console.log(data + " -- " + error + " --> " + xhr.responseText);
           },
           
           });

    
};

sos.isValidPassword = function(password) {
    var storedPass = localStorage.getItem("password");
    console.log(password + " === " + storedPass);
    if (password == storedPass) {
        return true;
    } else {
        return false;
    }
};

sos.showFalseAlertButton = function() {
    $("#falseAlertButton").show();
    setTimeout(function(){ sos.hideFalseAlertButton(); },300000);
};

sos.hideFalseAlertButton = function() {
    $("#falseAlertButton").hide();
};

sos.addContact = function() {
    navigator.contacts.pickContact(function(contact) {
        console.log('The following contact has been selected:' + JSON.stringify(contact));

        var c = {};
        c.name = contact.name.formatted;

        var nums = [];
        if (contact.phoneNumbers != null && contact.phoneNumbers.length > 0) {

            for (var i=0; i<contact.phoneNumbers.length; i++) {
                nums.push(contact.phoneNumbers[i].value);
            }
            c.phone = nums;
        } else {
            navigator.notification.alert("This contact has no phone number stored in it. Hence not adding.");
            return false;
        }

        var emails = [];
        if (contact.emails != null && contact.emails.length > 0) {
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

        c.id = userContacts.length + 1;
        userContacts.push(c);

        localStorage.setItem("userContacts",JSON.stringify(userContacts));
                                   
        console.log("done processing contact add");
                                   
        sos.showContactList();

    }, function(err) {
        console.log('Error: ' + err);
    });

};

sos.removeContact = function(contactId) {
    console.log("going to remove contact: "+contactId);
    var contacts = localStorage.getItem("userContacts");
    contacts = JSON.parse(contacts);
    for (var i=0; i<contacts.length; i++) {
        if (contacts[i] == null) {
            delete(contacts[i]);
            continue;
        }
        if (contacts[i].id == contactId) {
            console.log("Contact found, deleting: "+contactId);
            delete(contacts[i]);
            localStorage.setItem("userContacts",JSON.stringify(contacts));
            sos.showContactList();
            return true;
        }
    }
    console.log("Unable to remove contact: "+contactId);
    return false;
}

sos.showContactList = function() {
    var userContacts = localStorage.getItem("userContacts") || [];
    if (typeof userContacts == "string") {
        userContacts = JSON.parse(userContacts);
    }
    
    var contactList = $("#contactList");
    contactList.empty();
    console.log(userContacts);
    for (var i=0;i<userContacts.length; i++) {
        if (userContacts[i] == null) {
            delete(userContacts[i]);
            continue;
        }
        console.log(userContacts[i]);
        var text = '<a href="#" onclick="sos.removeContact('+ userContacts[i].id +')">'+ userContacts[i].name +'</a>';
        var l = $('<li />', {html: text});
        l.attr("data-icon","delete");
        l.appendTo('#contactList')

    }
    if (userContacts.length != 0) {
        $("#contactList").listview("refresh");
    }
    
};

sos.showIncidentsList = function() {
    $.ajax({
        url: sos.baseURL + 'incident/',
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        headers: { 'Authorization': 'Token ' + sos.user.AuthToken },
        success: function(response) {
            console.log('Incidents retrieved.');
           console.log(response);
            var incidentList = $("#incidentsReportedList");
           sos.sortedIncidentList = {};
            incidentList.empty();

            for (var i=0 ; i<response.length ; i++) {
                var text = '<a href="#" onclick="sos.showIncidentDetail('+response[i].id+')">' + response[i].date_recorded + ': ' + response[i].summary +'</a>';
           
                sos.sortedIncidentList[response[i].id] = response[i];
           
                var l = $('<li />', {html: text});
                l.appendTo('#incidentsReportedList');

            }
            incidentList.listview("refresh");
        },
        error: function(xhr) {
           console.log("Error retreiving incidets..");
            console.log(xhr.responseText);
        },
    });


};

sos.showIncidentDetail = function(id) {
    console.log("Popping up records for: "+id);
    var incident = sos.sortedIncidentList[id];
    console.log(incident);
    if (incident) {
        var htmlContent = "Date: " + incident.date_recorded + "<br><br>Summary: " + incident.summary + "<br><br>Detail: " + incident.description;
        htmlContent += "<br><br>Location:" + incident.address + ", " + incident.city + ", " + incident.state + ", " + incident.zip + ", " + incident.country
        console.log(htmlContent);
        $("#popupContent").html(htmlContent);
        $.mobile.changePage("#popup");
        console.log("popup called");
    }
    
};

sos.reportIncident = function() {
    var address = $("#incident_address").val();
    var city = $("#incident_city").val();
    var state = $("#incident_state").val();
    var country = $("#incident_country").val();
    var zip = $("#incident_zip").val();
    var summary = $("#incident_summary").val();
    var description = $("#incident_details").val();
    var dateField = $("#incident_date").val();
    
    if (address == "" || city == "" || state == "" || zip == "" || country == "" || summary == "" || description == "" || dateField == "") {
        navigator.notification.alert("All fields are required.");
        return false;
    }
    
    var incidentData = {longitude: 0, latitude: 0, address: address, city: city, state: state, zip: zip, country: country, summary: summary, description: description, date_recorded: dateField};
    sos.registerIncident(incidentData);
    sos.gotoIncidentReportsPage();
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
    },
    getCurrentDate: function() {
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();
        var dateField = curr_year + "-" + curr_month + "-" + curr_date;
        return dateField;
    }

}