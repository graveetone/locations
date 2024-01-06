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

    var data = {"OkPercent": 12.25, "KoPercent": 87.75};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.07, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.03, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.03, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.03, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.23, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.12, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.0, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 702, 87.75, 1485.7812500000016, 0, 8924, 0.0, 4997.9, 6003.0, 6006.0, 4.6932387539151604E-7, 2.4884752682392483E-6, 5.344058971743239E-9], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 97, 97.0, 1259.2099999999998, 0, 6006, 0.0, 6004.0, 6005.0, 6006.0, 5.8665484582289324E-8, 2.48466602879415E-6, 4.6118862391350495E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 77, 77.0, 4031.97, 22, 5077, 4343.5, 4911.8, 4998.9, 5076.25, 6.802258349772124, 0.221538394496973, 0.25515111642065164], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 96, 96.0, 1172.09, 0, 6006, 0.0, 6005.0, 6006.0, 6006.0, 5.866548478892533E-8, 2.749944599480875E-10, 1.5943949625740158E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 79, 79.0, 499.3800000000001, 0, 6009, 0.0, 2042.9000000000005, 2474.7999999999993, 6008.96, 5.866548499556135E-8, 1.4591893582392065E-9, 5.007190809191466E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 77, 77.0, 0.4099999999999999, 0, 4, 0.0, 2.0, 2.0, 4.0, 5.866548520223178E-8, 2.6353635930690058E-11, 7.906090779207017E-11], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 176, 88.0, 0.285, 0, 26, 0.0, 0.0, 1.0, 5.980000000000018, 1.1733096916450981E-7, 5.499889179586397E-11, 4.2624141141794576E-10], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, 100.0, 4922.619999999999, 4031, 8924, 4991.5, 5007.5, 5085.0, 8885.65999999998, 3.901982206961136, 0.005525267773528953, 0.005449057183549243], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 231, 32.9059829059829, 28.875], "isController": false}, {"data": ["/No connection; nothing to close.", 176, 25.071225071225072, 22.0], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 42, 5.982905982905983, 5.25], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 176, 25.071225071225072, 22.0], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 77, 10.968660968660968, 9.625], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 702, "Sampler error/Sampler configured for using existing connection, but there is no connection", 231, "/No connection; nothing to close.", 176, "Websocket I/O error/WebSocket I/O error: Connection reset", 176, "Sampler error/Sampler must use existing connection, but there is no connection", 77, "Websocket I/O error/WebSocket I/O error: Read timed out", 42], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 97, "Sampler error/Sampler configured for using existing connection, but there is no connection", 77, "Websocket I/O error/WebSocket I/O error: Read timed out", 20, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 77, "Websocket I/O error/WebSocket I/O error: Connection reset", 77, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 96, "Sampler error/Sampler configured for using existing connection, but there is no connection", 77, "Websocket I/O error/WebSocket I/O error: Read timed out", 19, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 79, "Sampler error/Sampler configured for using existing connection, but there is no connection", 77, "Websocket I/O error/WebSocket I/O error: Read timed out", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 77, "Sampler error/Sampler must use existing connection, but there is no connection", 77, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 176, "/No connection; nothing to close.", 176, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, "Websocket I/O error/WebSocket I/O error: Connection reset", 99, "Websocket I/O error/WebSocket I/O error: Read timed out", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
