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

    var data = {"OkPercent": 46.375, "KoPercent": 53.625};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.26125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.09, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.12, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.105, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.22, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.64, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.455, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.005, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 429, 53.625, 1834.9624999999987, 0, 10259, 6.0, 5122.4, 6005.0, 9947.97, 4.6942096324587527E-7, 2.6188543996861605E-6, 1.7288123121494212E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 61, 61.0, 2289.5000000000005, 0, 6007, 1429.5, 6004.9, 6006.0, 6006.99, 5.867762073027755E-8, 2.604146616404474E-6, 1.2835729534748212E-9], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 36, 36.0, 3458.4700000000007, 15, 4937, 4036.5, 4636.1, 4814.65, 4936.73, 6.98616738857063, 0.6331214195892133, 0.7291812211820595], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 53, 53.0, 1823.5600000000004, 0, 6006, 937.0, 6004.9, 6006.0, 6006.0, 5.867762090718213E-8, 3.204921227869821E-9, 4.437495081105649E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 47, 47.0, 1447.2900000000002, 0, 6006, 472.5, 6003.0, 6005.0, 6006.0, 5.867762111390365E-8, 3.6301047827790976E-9, 1.3935935014552115E-9], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 36, 36.0, 0.7200000000000002, 0, 3, 1.0, 2.0, 2.9499999999999886, 3.0, 5.867762132059074E-8, 7.334702665073841E-11, 2.2004107995221525E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 109, 54.5, 1.55, 0, 122, 0.0, 3.0, 6.0, 7.0, 1.1735524081146882E-7, 2.0858060378600905E-10, 1.6164996793415702E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 87, 87.0, 5657.060000000001, 1428, 10259, 4971.5, 9905.3, 9951.8, 10257.769999999999, 2.7137042062415193, 0.10512953697421981, 0.10232042910447761], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 108, 25.174825174825173, 13.5], "isController": false}, {"data": ["/No connection; nothing to close.", 109, 25.407925407925408, 13.625], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 67, 15.617715617715618, 8.375], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 109, 25.407925407925408, 13.625], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 36, 8.391608391608392, 4.5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 429, "/No connection; nothing to close.", 109, "Websocket I/O error/WebSocket I/O error: Connection reset", 109, "Sampler error/Sampler configured for using existing connection, but there is no connection", 108, "Websocket I/O error/WebSocket I/O error: Read timed out", 67, "Sampler error/Sampler must use existing connection, but there is no connection", 36], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 61, "Sampler error/Sampler configured for using existing connection, but there is no connection", 36, "Websocket I/O error/WebSocket I/O error: Read timed out", 25, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 36, "Websocket I/O error/WebSocket I/O error: Connection reset", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 53, "Sampler error/Sampler configured for using existing connection, but there is no connection", 36, "Websocket I/O error/WebSocket I/O error: Read timed out", 17, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 47, "Sampler error/Sampler configured for using existing connection, but there is no connection", 36, "Websocket I/O error/WebSocket I/O error: Read timed out", 11, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 36, "Sampler error/Sampler must use existing connection, but there is no connection", 36, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 109, "/No connection; nothing to close.", 109, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 87, "Websocket I/O error/WebSocket I/O error: Connection reset", 73, "Websocket I/O error/WebSocket I/O error: Read timed out", 14, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
