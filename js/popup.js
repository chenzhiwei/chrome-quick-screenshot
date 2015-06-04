$(document).ready(function(){
  $("#entire").click(function(){
    window.close();
  });

  $("#visible").click(function(){
    chrome.runtime.getBackgroundPage(function(backgroundPage){
      backgroundPage.captureVisibleTab();
    });
  });

  $("#select").click(function(){
    window.close();
  });

  $("#desktop").click(function(){
    window.close();
  });

  $("#option").click(function(){
    chrome.tabs.query({active: true}, function(tabs){
      chrome.tabs.create({url: 'options.html', index: tabs[0]['index'] + 1});
      window.close();
    });
  });
});
