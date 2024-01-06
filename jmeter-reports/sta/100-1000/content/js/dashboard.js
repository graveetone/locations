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

    var data = {"OkPercent": 60.5, "KoPercent": 39.5};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.295625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.115, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.12, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.17, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.2, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.66, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.55, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.0, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 316, 39.5, 1599.9624999999999, 0, 9263, 7.0, 4979.3, 5053.499999999999, 7412.050000000004, 4.6945013072697535E-7, 5.75608209116759E-6, 1.9440461712380264E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 34, 34.0, 1549.1300000000006, 0, 5739, 1296.0, 3774.1000000000026, 4971.949999999998, 5738.21, 5.8681266554196194E-8, 5.7373442209424165E-6, 1.3237668529315743E-9], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 34, 34.0, 3344.9800000000005, 14, 4988, 3719.5, 4691.0, 4887.8, 4988.0, 7.095217823187172, 0.6630979938271605, 0.7637059653043848], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 34, 34.0, 1456.34, 0, 5652, 800.0, 4349.5, 5126.899999999998, 5651.46, 5.868126665546926E-8, 4.576451128032984E-9, 4.576451128032984E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 34, 34.0, 1353.4500000000003, 0, 5781, 909.0, 4596.100000000001, 5219.299999999998, 5780.139999999999, 5.868126673966262E-8, 4.592496793473206E-9, 1.4372325877253306E-9], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 34, 34.0, 0.8899999999999999, 0, 4, 1.0, 3.0, 3.0, 4.0, 5.868126691173387E-8, 7.564382062840694E-11, 2.2693146188522082E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 90, 45.0, 0.9950000000000002, 0, 7, 0.0, 3.0, 6.0, 7.0, 1.1736253268174384E-7, 2.5214606630843403E-10, 1.954132013890364E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 56, 56.0, 5092.920000000001, 1506, 9263, 4999.0, 6857.100000000001, 8097.949999999998, 9258.109999999997, 3.706037134492088, 0.23727323685283325, 0.22771860986547085], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 102, 32.278481012658226, 12.75], "isController": false}, {"data": ["/No connection; nothing to close.", 90, 28.481012658227847, 11.25], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 90, 28.481012658227847, 11.25], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 34, 10.759493670886076, 4.25], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 316, "Sampler error/Sampler configured for using existing connection, but there is no connection", 102, "/No connection; nothing to close.", 90, "Websocket I/O error/WebSocket I/O error: Connection reset", 90, "Sampler error/Sampler must use existing connection, but there is no connection", 34, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 34, "Sampler error/Sampler configured for using existing connection, but there is no connection", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 34, "Websocket I/O error/WebSocket I/O error: Connection reset", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 34, "Sampler error/Sampler configured for using existing connection, but there is no connection", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 34, "Sampler error/Sampler configured for using existing connection, but there is no connection", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 34, "Sampler error/Sampler must use existing connection, but there is no connection", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 90, "/No connection; nothing to close.", 90, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 56, "Websocket I/O error/WebSocket I/O error: Connection reset", 56, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
