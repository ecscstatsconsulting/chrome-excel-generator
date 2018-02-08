/*require excel-gen.js jszip.js FileSaver.js jquery*/

/* main.js

Script for the functionality of the Chrome Extension popup window.

---------------
- MIT License -
---------------
Copyright 2018 ECSC, ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to the following 
conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Author Paul Warren */

/**
 * Standard Google Analytics
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-113470385-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/**
 * Takes table information gathered from the Active Tab and populates the popup window.
 */
function setTableInfo(info) {
  if (info && info.tables && info.tables.length) {
    //create list of tables
    var arr = [];
    arr.push("<ul>");
    info.tables.forEach(v => {
      arr.push("<li>");
      arr.push(v.name);
      arr.push("</li>");
    });
    arr.push("</ul>");
    $("#content").html(arr.join(""));
    
    //Add hover effect
    $("#content ul li").hover(
      function(){
        highlightTable($(this).text(), "on");
      },
      function(){
        highlightTable($(this).text(), "off");
      }
    );
    
    $("input[type='radio']").click(function() {
      var val = $(this).val();
      var tb = $("#tbFilename");
      if (val === "xlsx") {
        $("#excelTblField").show();
        $("#authorField").show();
        if (tb.val().endsWith(".csv")) tb.val(tb.val().replace(/\.csv$/,".xlsx"));
      } else {
        $("#excelTblField").hide();
        $("#authorField").hide();
        if (tb.val().endsWith(".xlsx")) tb.val(tb.val().replace(/\.xlsx$/,".csv"));
      }
    })

    //Create Excel spreadsheet on clicking
    $("#content ul li").click(function () {
      var tbl_name = $(this).text();
      var tbl = info.tables.find((itm) => itm.name == tbl_name);
      var tbl2Exprt = $(tbl.html);
      var format = $("input:radio[name='format']:checked").val()
      var filename = $("#tbFilename").val();
      var author = $("#tbAuthor").val();
      var excel = new ExcelGen({
        "src": tbl2Exprt,
        "file_name": filename,
        "author": author,
        "format": format,
        "show_header": true,
        "type": "table"
      });
      excel.generate();
      _gaq.push(['_trackEvent', "Generate Excel", "Clicked"]);
    })
  } else {
    $("#content").html("No tables found.");
  }
  
}

/**
 * Highlight the Table on the popup and make a call to scroll to the table
 * on the active tab and draw a border around it
 */
function highlightTable(tableName, onoff) {
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

/**
 * Call to the active tab to get a list of all HTML tables
 */
function loadTables(tab) {
  chrome.tabs.sendMessage(
    tab.id,
    {from: 'popup', subject: 'loadTables'},
    setTableInfo);
};

/**
 * Popup loaed event, make call to list tables on the active tab
 */
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
