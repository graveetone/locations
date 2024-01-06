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

    var data = {"OkPercent": 39.5, "KoPercent": 60.5};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.228125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.07, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.085, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.08, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.135, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.4, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.525, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.005, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 484, 60.5, 1669.0249999999994, 0, 10584, 1.0, 5001.9, 7775.849999999988, 10581.0, 4.6944838380998645E-7, 2.4903858543427744E-6, 1.5604345081965247E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 68, 68.0, 1211.4800000000002, 0, 6006, 0.0, 3628.6000000000004, 6004.0, 6005.98, 5.868104812517818E-8, 2.476467449561072E-6, 8.022799548364205E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 60, 60.0, 3582.02, 7, 5005, 4208.0, 4892.1, 4969.599999999999, 5004.93, 7.655795437145919, 0.4336290384320931, 0.49942103047006586], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 70, 70.0, 1126.63, 0, 6006, 0.0, 5714.700000000016, 6005.0, 6006.0, 5.86810483254157E-8, 2.097389031943569E-9, 2.7735964247559765E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 61, 61.0, 835.0899999999997, 0, 6006, 0.0, 3427.5000000000005, 4399.649999999996, 5998.529999999996, 5.8681048506232076E-8, 2.740932177786211E-9, 8.710468137643823E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 60, 60.0, 0.5000000000000001, 0, 6, 0.0, 1.0, 2.0, 5.97999999999999, 5.86810487130466E-8, 4.584456930706766E-11, 1.37533707921203E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 95, 47.5, 3.01, 0, 40, 0.0, 7.0, 21.899999999999977, 38.98000000000002, 1.1736209595249661E-7, 2.406839858400809E-10, 1.8653008902606274E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 70, 70.0, 6590.459999999998, 1446, 10584, 5284.5, 10568.800000000001, 10582.0, 10584.0, 2.943254061690605, 0.27434921893395336, 0.26716354007240406], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 180, 37.1900826446281, 22.5], "isController": false}, {"data": ["/No connection; nothing to close.", 95, 19.628099173553718, 11.875], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 54, 11.15702479338843, 6.75], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 95, 19.628099173553718, 11.875], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 60, 12.396694214876034, 7.5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 484, "Sampler error/Sampler configured for using existing connection, but there is no connection", 180, "/No connection; nothing to close.", 95, "Websocket I/O error/WebSocket I/O error: Connection reset", 95, "Sampler error/Sampler must use existing connection, but there is no connection", 60, "Websocket I/O error/WebSocket I/O error: Read timed out", 54], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 68, "Sampler error/Sampler configured for using existing connection, but there is no connection", 60, "Websocket I/O error/WebSocket I/O error: Read timed out", 8, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 60, "Websocket I/O error/WebSocket I/O error: Connection reset", 60, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 70, "Sampler error/Sampler configured for using existing connection, but there is no connection", 60, "Websocket I/O error/WebSocket I/O error: Read timed out", 10, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 61, "Sampler error/Sampler configured for using existing connection, but there is no connection", 60, "Websocket I/O error/WebSocket I/O error: Read timed out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 60, "Sampler error/Sampler must use existing connection, but there is no connection", 60, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 95, "/No connection; nothing to close.", 95, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 70, "Websocket I/O error/WebSocket I/O error: Read timed out", 35, "Websocket I/O error/WebSocket I/O error: Connection reset", 35, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
