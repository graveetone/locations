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

    var data = {"OkPercent": 28.125, "KoPercent": 71.875};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.205, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.095, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.12, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.14, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.21, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.3, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.385, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.005, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 575, 71.875, 1466.8049999999982, 0, 10706, 0.0, 5001.0, 6707.899999999967, 9729.97, 4.6942105359682745E-7, 1.4539274231942068E-7, 1.1528091743482633E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 77, 77.0, 772.8199999999999, 0, 6007, 0.0, 4314.900000000001, 6004.95, 6006.99, 5.867763192075146E-8, 1.3522271736612157E-7, 6.016749366873929E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 70, 70.0, 3546.81, 8, 5014, 4303.5, 4896.1, 4986.0, 5013.84, 6.945891505174689, 0.29506472702646386, 0.3398331683684101], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 75, 75.0, 631.6599999999997, 0, 6005, 0.0, 2294.3000000000075, 5977.2499999999945, 6005.0, 5.867763197535846E-8, 1.690420061790112E-9, 2.0800762116264765E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 73, 73.0, 384.07999999999987, 0, 6006, 0.0, 1043.6000000000029, 3376.5499999999743, 6006.0, 5.867763212657786E-8, 1.8411253127216273E-9, 6.532470764091675E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 70, 70.0, 0.2400000000000001, 0, 2, 0.0, 1.0, 1.0, 2.0, 5.8677632333368305E-8, 3.438142519533299E-11, 1.0314427558599898E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 123, 61.5, 1.3099999999999996, 0, 12, 0.0, 7.0, 9.0, 11.0, 1.1735526339920686E-7, 1.7649131409646342E-10, 1.3678076842475915E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 87, 87.0, 6396.210000000003, 1058, 10706, 5003.0, 9727.0, 10652.09999999999, 10705.99, 4.348204191668841, 0.2915929510174798, 0.28539336300982693], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 210, 36.52173913043478, 26.25], "isController": false}, {"data": ["/No connection; nothing to close.", 123, 21.391304347826086, 15.375], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 49, 8.521739130434783, 6.125], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 123, 21.391304347826086, 15.375], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 70, 12.173913043478262, 8.75], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 575, "Sampler error/Sampler configured for using existing connection, but there is no connection", 210, "/No connection; nothing to close.", 123, "Websocket I/O error/WebSocket I/O error: Connection reset", 123, "Sampler error/Sampler must use existing connection, but there is no connection", 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 49], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 77, "Sampler error/Sampler configured for using existing connection, but there is no connection", 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 70, "Websocket I/O error/WebSocket I/O error: Connection reset", 70, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 75, "Sampler error/Sampler configured for using existing connection, but there is no connection", 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 5, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 73, "Sampler error/Sampler configured for using existing connection, but there is no connection", 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 70, "Sampler error/Sampler must use existing connection, but there is no connection", 70, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 123, "/No connection; nothing to close.", 123, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 87, "Websocket I/O error/WebSocket I/O error: Connection reset", 53, "Websocket I/O error/WebSocket I/O error: Read timed out", 34, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
