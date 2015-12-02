// To make sure we can uniquely identify each screenshot tab, add an id as a
// query param to the url that displays the screenshot.
// Note: It's OK that this is a global variable (and not in localStorage),
// because the event page will stay open as long as any screenshot tabs are
// open.
//

var id = 100;
function captureVisibleTab() {
  chrome.tabs.captureVisibleTab({format: "png", quality: 100}, function(screenshotUrl) {
    var viewTabUrl = chrome.extension.getURL('index.html?id=' + id++);
    var targetId = null;

    chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
      // We are waiting for the tab we opened to finish loading.
      // Check that the tab's id matches the tab we opened,
      // and that the tab is done loading.
      if (tabId != targetId || changedProps.status != "complete")
        return;

      // Passing the above test means this is the event we were waiting for.
      // There is nothing we need to do for future onUpdated events, so we
      // use removeListner to stop getting called when onUpdated events fire.
      chrome.tabs.onUpdated.removeListener(listener);

      // Look through all views to find the window which will display
      // the screenshot.  The url of the tab which will display the
      // screenshot includes a query parameter with a unique id, which
      // ensures that exactly one view will have the matching URL.
      var views = chrome.extension.getViews();
      for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.location.href == viewTabUrl) {
          view.setScreenshotUrl(screenshotUrl);
          break;
        }
      }
    });

    chrome.tabs.create({url: viewTabUrl}, function(tab) {
      targetId = tab.id;
    });
  });
}

function gotStream(stream) {
  console.log("Received local stream");
  var video = document.querySelector("video");
  video.src = URL.createObjectURL(stream);
  localstream = stream;
  stream.onended = function() { console.log("Ended"); };
}

function getUserMediaError() {
  console.log("getUserMedia() failed.");
}

function onAccessApproved(id) {
  if (!id) {
    console.log("Access rejected.");
    return;
  }

  navigator.webkitGetUserMedia({
    audio:false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: id,
        maxWidth:screen.width,
        maxHeight:screen.height} }
  }, gotStream, getUserMediaError);
}

function captureDesktop() {
  chrome.desktopCapture.chooseDesktopMedia(
      ["screen", "window"], onAccessApproved);
}
