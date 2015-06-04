// chrome.systemIndicator.setIcon({
//   path: {
//     "19": "icon/quick-screenshot-19.png",
//     "38": "icon/quick-screenshot-38.png"
//   }
// });

// chrome.systemIndicator.enable();
//
// chrome.systemIndicator.onClicked.addListener(function(tab) {
//   chrome.tabs.create({url: 'index.html'});
// });

// To make sure we can uniquely identify each screenshot tab, add an id as a
// query param to the url that displays the screenshot.
// Note: It's OK that this is a global variable (and not in localStorage),
// because the event page will stay open as long as any screenshot tabs are
// open.
//

// var storage = {
//   get: (function(key) {
//     return JSON.parse(localStorage.getItem(key));
//   }),
//
//   set: (function(key, value) {
//     value = JSON.stringify(value);
//     localStorage.setItem(key, value);
//   }),
//
//   has: (function(key) {
//     if(localStorage.hasOwnProperty(key)) {
//       return true;
//     } else {
//       return false;
//     }
//   }),
//
//   remove: (function(key) {
//     if(localStorage.hasOwnProperty(key)) {
//       localStorage.removeItem(key);
//     }
//   }),
// };

// chrome.runtime.onStartup.addListener(function(){
//   storage.set("id", 100);
// });

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
