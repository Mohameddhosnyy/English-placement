window.InitUserScripts = function()
{
var player = GetPlayer();
var object = player.object;
var once = player.once;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
var update = player.update;
var pointerX = player.pointerX;
var pointerY = player.pointerY;
var showPointer = player.showPointer;
var hidePointer = player.hidePointer;
var slideWidth = player.slideWidth;
var slideHeight = player.slideHeight;
window.Script1 = function()
{
  var player = GetPlayer();

// Length of the password
var length = 4;

// Allowed characters
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789";

var pwd = "";
for (var i = 0; i < length; i++) {
  var index = Math.floor(Math.random() * chars.length);
  pwd += chars.charAt(index);
}

// Current time in ISO format (for expiry checks)
var nowIso = new Date().toISOString();

// Save into Storyline variables
player.SetVar("GeneratedPassword", pwd);
player.SetVar("PasswordUsed", false);
player.SetVar("EnteredPassword", "");
player.SetVar("PasswordGeneratedAt", nowIso);

console.log("New password:", pwd, "generated at:", nowIso);

}

window.Script2 = function()
{
  // ✅ Web App base URL (no ?action here)
var baseUrl = "https://script.google.com/macros/s/AKfycbxYgh9xF22xIcFrOrPKTZ8x12oQNKQ_tQ7fs6cbXk_DKsheOvrd5ukkxLDZD0zdu4o5/exec";

var player = GetPlayer();
var pwd = player.GetVar("EnteredPassword");

// Build full URL: we are checking a learner password
var url = baseUrl + "?action=check&password=" + encodeURIComponent(pwd);

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    var responseText = xhr.responseText;

    // 🔍 Optional: uncomment this line once for debugging
    // alert(responseText);

    var result = "error";

    try {
      var data = JSON.parse(responseText);
      // Expecting: { "status": "ok" | "wrong" | "expired" | "used", ... }
      if (data && data.status) {
        result = data.status;
      }
    } catch (e) {
      result = "error";
    }

    // Send result back into Storyline
    player.SetVar("LoginResult", result);
  }
};

xhr.send();

}

window.Script3 = function()
{
  // Start 60-minute countdown only once
if (!window.quizTimer) {
  var player = GetPlayer();

  var remaining = player.GetVar("TimeRemaining");
  if (isNaN(remaining) || remaining <= 0) {
    remaining = 3600; // fallback to 60 minutes
    player.SetVar("TimeRemaining", remaining);
  }

  function updateDisplay(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    var mm = String(mins).padStart(2, "0");
    var ss = String(secs).padStart(2, "0");
    var display = mm + ":" + ss;
    player.SetVar("TimeDisplay", display);
  }

  // Initial display
  updateDisplay(remaining);

  // Interval every second
  window.quizTimer = setInterval(function () {
    var p = GetPlayer();
    var rem = p.GetVar("TimeRemaining");

    if (rem <= 0) {
      p.SetVar("TimeRemaining", 0);
      updateDisplay(0);
      p.SetVar("TimeUp", true);
      clearInterval(window.quizTimer);
      window.quizTimer = null;
      return;
    }

    rem = rem - 1;
    p.SetVar("TimeRemaining", rem);
    updateDisplay(rem);
  }, 1000);
}

}

window.Script4 = function()
{
  // === 1) Get variables from Storyline ===
var player = GetPlayer();
var learnerName  = player.GetVar("LearnerName");
var learnerEmail = player.GetVar("LearnerEmail");
var quizScore    = player.GetVar("QuizScore");    // your % score variable
var level        = player.GetVar("Level");        // Beginner / Intermediate / Advanced

// === 2) Google Form POST URL ===
var formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSc_nfEpH9CLhMIcz06omILQy-kQPxV9u0Rc8RW4i5GEdT8wSg/formResponse";

// === 3) Create a hidden form + iframe target ===
var iframeId = "hidden_iframe_for_google_form";
var iframe = document.getElementById(iframeId);
if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = iframeId;
    iframe.name = iframeId;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
}

var form = document.createElement("form");
form.setAttribute("method", "POST");
form.setAttribute("action", formUrl);
form.setAttribute("target", iframeId);

// helper to add a hidden input
function addField(name, value) {
    var input = document.createElement("input");
    input.type  = "hidden";
    input.name  = name;
    input.value = value;
    form.appendChild(input);
}

// === 4) Map Storyline values to your Google Form entry IDs ===
// !! Replace these with your real entry IDs from the form !!
addField("entry.1165646741", learnerName);   // Learner Name
addField("entry.236769250", learnerEmail);  // Learner Email
addField("entry.201120810", quizScore);     // Score
addField("entry.1835766775", level);         // Level

// === 5) Submit the form ===
document.body.appendChild(form);
form.submit();

}

};
