// Inform the background page that 
// this tab should have a page-action
chrome.runtime.sendMessage({
    from:    'content',
    subject: 'showPageAction'
  });
  
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    // First, validate the message's structure
    if (msg.from === 'popup') {
      switch(msg.subject) {
        case "loadTables":
          var tables = [];
          var counter = 1;
          $("table:visible").each(function() {
              var name = "Table " + counter;
              $(this).attr("__EXCEL_TABLE_NAME__", name);
              var id = counter++;
              var html = this.outerHTML;
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
      
          response(tableInfo);
          break;
        case "highlight":
          var tbl = $("[__EXCEL_TABLE_NAME__='" + msg.tableName + "']");
          switch (msg.onoff)
          {
            case "on":
              tbl.attr("__EXCEL_TABLE_ORIG_BORDER__", (tbl.css("border")) ? tbl.css("border") : "0px solid black");
              tbl.css("border","5px solid green");
              $('html, body').stop().animate({
                scrollTop: (tbl.offset().top - 50)
              },500);
              break;
            case "off":
              tbl.css("border", tbl.attr("__EXCEL_TABLE_ORIG_BORDER__"));
              break;
          }
          
          break;
      }
 

    }
  });

