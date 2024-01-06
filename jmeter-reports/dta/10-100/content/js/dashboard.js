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

    var data = {"OkPercent": 81.75, "KoPercent": 18.25};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.498125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.34, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.24, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.37, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.48, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.78, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.855, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.065, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 146, 18.25, 1080.3362499999996, 0, 6322, 225.0, 4065.6999999999994, 4804.249999999997, 6060.63, 4.694210972986846E-7, 8.995195823415981E-7, 2.7061621998324803E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 22, 22.0, 859.73, 0, 2529, 715.5, 2034.3000000000002, 2166.8, 2527.6999999999994, 5.8677637235604005E-8, 8.740526866712187E-7, 1.5643549770820206E-9], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 22, 22.0, 2312.4500000000003, 10, 4941, 2213.5, 4532.200000000001, 4743.9, 4941.0, 7.01311452416018, 0.7745930201977698, 0.8921174784346728], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 22, 22.0, 847.7700000000004, 0, 2305, 790.5, 1994.7000000000003, 2123.3499999999995, 2303.6999999999994, 5.867763731820313E-8, 5.274111073015055E-9, 5.408198642667981E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 22, 22.0, 626.0100000000003, 0, 2212, 435.5, 1692.9, 2063.6999999999994, 2211.4999999999995, 5.867763737363649E-8, 5.290155744466914E-9, 1.6984425505415874E-9], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 22, 22.0, 0.91, 0, 5, 1.0, 2.0, 3.0, 4.97999999999999, 5.8677637389061414E-8, 8.939171320989824E-11, 2.681751396296947E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 29, 14.5, 0.6600000000000004, 0, 4, 1.0, 2.0, 2.0, 3.0, 1.1735527432467115E-7, 3.9194827948278843E-10, 3.0375991659916103E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 7, 7.0, 3994.5, 182, 6322, 4211.5, 5895.500000000001, 6151.75, 6321.55, 4.830451164138731, 0.6536675955221717, 0.6273454104675876], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["/No connection; nothing to close.", 29, 19.863013698630137, 3.625], "isController": false}, {"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 66, 45.205479452054796, 8.25], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 29, 19.863013698630137, 3.625], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 22, 15.068493150684931, 2.75], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 146, "Sampler error/Sampler configured for using existing connection, but there is no connection", 66, "/No connection; nothing to close.", 29, "Websocket I/O error/WebSocket I/O error: Connection reset", 29, "Sampler error/Sampler must use existing connection, but there is no connection", 22, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 22, "Sampler error/Sampler configured for using existing connection, but there is no connection", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 22, "Websocket I/O error/WebSocket I/O error: Connection reset", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 22, "Sampler error/Sampler configured for using existing connection, but there is no connection", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 22, "Sampler error/Sampler configured for using existing connection, but there is no connection", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 22, "Sampler error/Sampler must use existing connection, but there is no connection", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 29, "/No connection; nothing to close.", 29, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 7, "Websocket I/O error/WebSocket I/O error: Connection reset", 7, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
