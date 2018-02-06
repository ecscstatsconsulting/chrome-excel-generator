/*require jquery*/

/* content.js

Script that gets injected on the active tab, reads and manipulates the page.

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
 * Inform the background page that 
 * this tab should have a page-action
 */
chrome.runtime.sendMessage({
    from:    'content',
    subject: 'showPageAction'
});

/**
 * Listen for messages from the popup
 */
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
  if (msg.from === 'popup') {
    switch(msg.subject) {
      case "loadTables":
        //Find valid tables and pass them back to the popup
        var tables = [];
        var counter = 1;
        $("table:visible").each(function() {
            var name = "Table " + counter;
            //Adding attribute to the table for identification later.
            $(this).attr("__EXCEL_TABLE_NAME__", name);
            var id = counter++;
            var html = this.outerHTML;
            //create return object with all the info needed by the popup
            var table = {
              "id": id,
              "name": name,
              "html": html
            };
            tables.push(table);
        });
        var tableInfo = {
          "tables": tables
        };
        //return all of the table information from the active tab
        response(tableInfo);
        break;
      case "highlight":
        //Scroll to and highlight selected table
        var tbl = $("[__EXCEL_TABLE_NAME__='" + msg.tableName + "']");
        switch (msg.onoff)
        {
          case "on":
            //highlight table and scroll to it
            tbl.attr("__EXCEL_TABLE_ORIG_BORDER__", (tbl.css("border")) ? tbl.css("border") : "0px solid black");
            tbl.css("border","5px solid green");
            $('html, body').stop().animate({
              scrollTop: (tbl.offset().top - 50)
            },500);
            break;
          case "off":
            //remove highlighting from the table.
            tbl.css("border", tbl.attr("__EXCEL_TABLE_ORIG_BORDER__"));
            break;
        }
          
    break;
    }
  }
});

