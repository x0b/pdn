// ==UserScript==
// @name        pyLoad Desktop Notifications
// @description This script enables Desktop Notifications for pyLoad Captchas in Firefox. Note: This app is in pre-alpha state. Do not use it unless you know exactly what you are doing.
// @match       http://localhost:8000/*
// @match       http://localhost:8001/*
// @version     0.1
// @run-at      document-end
// @grant       none
// ==/UserScript==


var SERVER = "localhost:8001";
var FREQUENCY = 5000;
var DONOTDISTURB = 10000;

//initialize variables
var nWait = 0;
var notifSupport;
var pyStatData;


//--- there are no config values after this line ---

function debugLog(logcontent, category) {
   if(ENABLEDEBUG === true) {
      switch(category){
         case "info":
            console.info(logcontent);
            break;
         case "error":
            console.error(logcontent);
            break;
         case "warn":
            console.warn(logcontent);
            break;
         default:   
            console.log(logcontent);
      }
   }
}

debugLog("PDN: match hit");


//MAIN FUNCTIONS -we'll wait a second before we start

setTimeout(function(){setup();}, 1000);

//POWERUP
function setup(){
   testEnvironment();
   requestPermissions();
   captchaTest();
}

// Environment test will probably need more tests
// PLANNED: test for cookies
function testEnvironment() {
  debugLog("PDN: Testing execution environment");
   if(("Notification" in window)) {
     debugLog("PDN: Notifications availible");
     notifSupport = true;
   } else {
     debugLog("PDN: Notifications not availible", "warn");
     notifSupport = false;
   }
}

// Currently we only need notif permission
function requestPermissions() {
   if(notifSupport) {
      if(Notification.permission === "granted") {
         var enableNotif = true;
      } else if (Notification.permission !== 'denied') {
         Notification.requestPermission(function (permission) {
            // If the user is okay, let's create a notification
            if (permission === "granted") {
               var enableNotif = true;
            }
         });
      } else {
      debugLog("Environment insufficient", "warn");
   }
   } 
}

function pyStatus(){
   var http = new XMLHttpRequest();

   var url = "http://" + SERVER + "/json/status";
   http.open("POST", url, true);
   var params;
   //headers
   http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   http.setRequestHeader("Content-length", 0);
   http.setRequestHeader("Connection", "close");
    
   http.onreadystatechange = function(){
     if(http.readyState == 4 && http.status == 200) {
       debugLog("PDN: Status data received... processing...");
        pyStatData = JSON.parse(http.responseText);
        debugLog(pyStatData.captcha);
        if(pyStatData.captcha) {
          debugLog("PDN: notifCapAvail called");
           notifCapAvail();
        }
       debugLog("PDN: status data processed");
     }
   };
   http.send(params);
   debugLog("PDN: request send");
   if(nWait > 0) {
      nWait = nWait - 1;
   }
}

function captchaTest() {
   setInterval(pyStatus, FREQUENCY);
}

function notifCapAvail() {
   if(nWait <= 0) {
      var notification = new Notification("Unsolved Captchas", {body: "pyLoad has unresolved CAPTCHAs", icon: "https://raw.githubusercontent.com/pyload/pyload/stable/icons/logo.png"});
      notification.onclick = letMeSolveIt;
      debugLog("PDN: Notif fired");
   }
}


//GET TO PYLOAD, OPEN CAPTHA WINDOW
//cap_info: id of element
function letMeSolveIt() {
    document.getElementById("cap_info").click();
    nWait = nWait + DONOTDISTURB;
}
