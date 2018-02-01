
document.addEventListener('DOMContentLoaded', function () {

});

// Update the relevant fields with the new data
function setDOMInfo(info) {
  if (info && info.tables && info.tables.length) {
    var arr = [];
    arr.push("<ul>");
    info.tables.forEach(v => {
      arr.push("<li>");
      arr.push(v.name);
      arr.push("</li>");
    });
    arr.push("</ul>");
    $("#content").html(arr.join(""));
    $("#content ul li").hover(
      function(){
        highlightTable($(this).text(), "on");
      },
      function(){
        highlightTable($(this).text(), "off");
      }
    );
    $("#content ul li").click(function () {
      var tbl_name = $(this).text();
      var tbl = info.tables.find((itm) => itm.name == tbl_name);
      var tbl2Exprt = $(tbl.html);
      var excel = new ExcelGen({
        "src": tbl2Exprt,
        "show_header": true,
        "type": "table"
      });
      excel.generate();
    })
  } else {
    $("#content").html("No tables found.");
  }
  
}

function highlightTable(tableName, onoff) {
  console.log("highlight " + tableName + " " + onoff);
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {from: 'popup', subject: 'highlight', tableName: tableName, onoff: onoff},
      null
    )
  });
};

function loadTables(tab) {
  chrome.tabs.sendMessage(
    tab.id,
    {from: 'popup', subject: 'loadTables'},
    setDOMInfo);
};

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  // ...query for the active tab...
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ...and send a request for the DOM info...
    loadTables(tabs[0]);
  });
});