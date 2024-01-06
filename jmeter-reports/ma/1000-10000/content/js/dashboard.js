/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 4.75, "KoPercent": 95.25};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.025625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.01, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.02, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.01, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.005, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.08, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.04, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.0, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 762, 95.25, 1310.8812500000008, 0, 6006, 0.0, 4978.8, 5055.65, 6004.0, 4.693784308839572E-7, 1.9057039320313005E-9, 1.8243419481622554E-9], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 94, 94.0, 325.25, 0, 6004, 0.0, 0.0, 3642.799999999999, 6004.0, 5.8672304017538726E-8, 4.709827529532894E-10, 1.6043208129795745E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 92, 92.0, 4470.139999999997, 8, 5612, 4641.5, 5037.7, 5234.799999999999, 5611.089999999999, 6.839945280437757, 0.07748375512995896, 0.08923991108071136], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 98, 98.0, 374.56, 0, 6006, 0.0, 0.0, 6003.95, 6006.0, 5.867230422418836E-8, 1.8564283758434597E-10, 5.546366258692805E-10], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 94, 94.0, 380.6600000000002, 0, 6006, 0.0, 0.0, 5112.599999999994, 6006.0, 5.867230443090683E-8, 5.569285147152484E-10, 1.7418340377925464E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 92, 92.0, 0.27999999999999997, 0, 22, 0.0, 0.0, 1.0, 21.799999999999898, 5.867230457053218E-8, 9.16754758914565E-12, 2.7502642767436955E-11], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 192, 96.0, 2.6649999999999983, 0, 452, 0.0, 0.0, 0.0, 31.87000000000012, 1.1734460803287428E-7, 1.8335095005136608E-11, 1.420969862898087E-10], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, 100.0, 4930.830000000002, 4432, 5124, 4959.0, 5088.0, 5100.9, 5123.97, 4.998000799680129, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 276, 36.22047244094488, 34.5], "isController": false}, {"data": ["/No connection; nothing to close.", 192, 25.19685039370079, 24.0], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 10, 1.3123359580052494, 1.25], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 192, 25.19685039370079, 24.0], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 92, 12.073490813648293, 11.5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 762, "Sampler error/Sampler configured for using existing connection, but there is no connection", 276, "/No connection; nothing to close.", 192, "Websocket I/O error/WebSocket I/O error: Connection reset", 192, "Sampler error/Sampler must use existing connection, but there is no connection", 92, "Websocket I/O error/WebSocket I/O error: Read timed out", 10], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 94, "Sampler error/Sampler configured for using existing connection, but there is no connection", 92, "Websocket I/O error/WebSocket I/O error: Read timed out", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 92, "Websocket I/O error/WebSocket I/O error: Connection reset", 92, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 98, "Sampler error/Sampler configured for using existing connection, but there is no connection", 92, "Websocket I/O error/WebSocket I/O error: Read timed out", 6, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 94, "Sampler error/Sampler configured for using existing connection, but there is no connection", 92, "Websocket I/O error/WebSocket I/O error: Read timed out", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 92, "Sampler error/Sampler must use existing connection, but there is no connection", 92, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 192, "/No connection; nothing to close.", 192, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, "Websocket I/O error/WebSocket I/O error: Connection reset", 100, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
