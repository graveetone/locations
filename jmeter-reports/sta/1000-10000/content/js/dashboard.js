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

    var data = {"OkPercent": 15.25, "KoPercent": 84.75};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.083125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.02, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.01, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.035, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.0, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.3, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.15, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.0, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 678, 84.75, 1655.82125, 0, 6006, 0.0, 4999.0, 6004.0, 6006.0, 4.694213358635534E-7, 8.508112726263082E-7, 6.841907654065952E-9], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 92, 92.0, 1459.15, 0, 6006, 0.0, 6005.9, 6006.0, 6006.0, 5.86776671470064E-8, 8.465084370890859E-7, 6.016752978941085E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 70, 70.0, 4015.19, 13, 4994, 4295.5, 4889.7, 4989.8, 4994.0, 6.954102920723227, 0.2954135518080667, 0.34023491828929064], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 85, 85.0, 1327.5199999999998, 0, 6006, 0.0, 6004.0, 6004.0, 6006.0, 5.8677667349872E-8, 1.0572294556690804E-9, 2.080077465625345E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 91, 91.0, 1590.49, 0, 6006, 0.0, 6005.0, 6006.0, 6006.0, 5.8677667556559403E-8, 6.498093262611169E-10, 6.53247470844509E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 70, 70.0, 0.33999999999999997, 0, 4, 0.0, 1.0, 1.9499999999999886, 3.989999999999995, 5.867766776335011E-8, 3.438144595508796E-11, 1.0314433786526387E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 170, 85.0, 0.10499999999999997, 0, 1, 0.0, 1.0, 1.0, 1.0, 1.1735533429394394E-7, 6.876289118785777E-11, 5.329124067058977E-10], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, 100.0, 4853.6699999999955, 4083, 5001, 4995.0, 4999.0, 5000.0, 5001.0, 4.350474201687984, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 210, 30.97345132743363, 26.25], "isController": false}, {"data": ["/No connection; nothing to close.", 170, 25.073746312684367, 21.25], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 58, 8.55457227138643, 7.25], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 170, 25.073746312684367, 21.25], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 70, 10.32448377581121, 8.75], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 678, "Sampler error/Sampler configured for using existing connection, but there is no connection", 210, "/No connection; nothing to close.", 170, "Websocket I/O error/WebSocket I/O error: Connection reset", 170, "Sampler error/Sampler must use existing connection, but there is no connection", 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 58], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 92, "Sampler error/Sampler configured for using existing connection, but there is no connection", 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 22, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 70, "Websocket I/O error/WebSocket I/O error: Connection reset", 70, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 85, "Sampler error/Sampler configured for using existing connection, but there is no connection", 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 15, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 91, "Sampler error/Sampler configured for using existing connection, but there is no connection", 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 21, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 70, "Sampler error/Sampler must use existing connection, but there is no connection", 70, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 170, "/No connection; nothing to close.", 170, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, "Websocket I/O error/WebSocket I/O error: Connection reset", 100, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
