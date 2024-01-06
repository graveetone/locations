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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.105, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.065, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.085, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.08, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.13, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.24, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.12, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.0, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 678, 84.75, 1309.7637500000021, 0, 6007, 0.0, 4979.0, 5007.0, 6006.0, 4.6937306569910947E-7, 4.180043892226758E-6, 5.472963285593132E-9], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 81, 81.0, 670.27, 0, 6007, 0.0, 1916.7000000000025, 5960.69999999999, 6006.99, 5.867163335128794E-8, 4.175769581958527E-6, 4.812907423347839E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 76, 76.0, 3758.62, 11, 5026, 4405.5, 4904.0, 4992.0, 5025.84, 7.026419336706015, 0.23878846964586847, 0.27501844435075884], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 90, 90.0, 897.4699999999999, 0, 6006, 0.0, 6004.9, 6006.0, 6006.0, 5.867163355803611E-8, 7.047471609021916E-10, 1.6638908579349304E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 79, 79.0, 316.7900000000001, 0, 6006, 0.0, 797.5, 874.95, 6005.99, 5.867163361011903E-8, 1.4931472381637714E-9, 5.225442368401226E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 76, 76.0, 1.63, 0, 16, 0.0, 9.0, 10.0, 15.989999999999995, 5.8671633816832785E-8, 2.7502328351640364E-11, 8.25069850549211E-11], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 176, 88.0, 0.1449999999999999, 0, 18, 0.0, 0.0, 1.0, 1.0, 1.1734326670257588E-7, 5.500465626683244E-11, 4.262860860679514E-10], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, 100.0, 4833.040000000002, 4019, 5033, 4979.0, 5024.4, 5027.0, 5032.99, 5.455537370430988, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 228, 33.6283185840708, 28.5], "isController": false}, {"data": ["/No connection; nothing to close.", 176, 25.958702064896755, 22.0], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 22, 3.2448377581120944, 2.75], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 176, 25.958702064896755, 22.0], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 76, 11.2094395280236, 9.5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 678, "Sampler error/Sampler configured for using existing connection, but there is no connection", 228, "/No connection; nothing to close.", 176, "Websocket I/O error/WebSocket I/O error: Connection reset", 176, "Sampler error/Sampler must use existing connection, but there is no connection", 76, "Websocket I/O error/WebSocket I/O error: Read timed out", 22], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 81, "Sampler error/Sampler configured for using existing connection, but there is no connection", 76, "Websocket I/O error/WebSocket I/O error: Read timed out", 5, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 76, "Websocket I/O error/WebSocket I/O error: Connection reset", 76, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 90, "Sampler error/Sampler configured for using existing connection, but there is no connection", 76, "Websocket I/O error/WebSocket I/O error: Read timed out", 14, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 79, "Sampler error/Sampler configured for using existing connection, but there is no connection", 76, "Websocket I/O error/WebSocket I/O error: Read timed out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 76, "Sampler error/Sampler must use existing connection, but there is no connection", 76, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 176, "/No connection; nothing to close.", 176, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, "Websocket I/O error/WebSocket I/O error: Connection reset", 100, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
