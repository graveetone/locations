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

    var data = {"OkPercent": 48.0, "KoPercent": 52.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.266875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.14, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.105, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.155, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.225, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.42, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.54, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.01, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 416, 52.0, 1124.4924999999994, 0, 6102, 1.0, 4437.9, 4833.0, 5017.0, 4.6937913840680677E-7, 3.8982980254782834E-6, 1.6157826785976502E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 58, 58.0, 669.02, 0, 3272, 0.0, 2664.4000000000005, 2852.1499999999996, 3270.5499999999993, 5.8672392353003955E-8, 3.882254796659405E-6, 8.422696949112873E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 58, 58.0, 3503.6200000000013, 9, 5046, 4186.0, 4841.6, 4936.85, 5045.85, 7.022965095863474, 0.41767438900203663, 0.4810456756092422], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 58, 58.0, 637.48, 0, 3406, 0.0, 2558.8, 2887.8999999999996, 3403.4299999999985, 5.867239238556953E-8, 3.296884236196944E-9, 2.911846661166644E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 58, 58.0, 432.0000000000002, 0, 3164, 0.0, 1420.7000000000005, 1623.1499999999994, 3158.329999999997, 5.867239247720754E-8, 3.3266788156510446E-9, 9.144642421252268E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 58, 58.0, 0.6300000000000002, 0, 11, 0.0, 1.0, 2.0, 10.969999999999985, 5.867239258612665E-8, 4.8129697043307014E-11, 1.4438909112992105E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 92, 46.0, 2.649999999999998, 0, 31, 0.0, 11.0, 16.94999999999999, 26.0, 1.1734478460170169E-7, 2.475241550192145E-10, 1.918312201398912E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 34, 34.0, 3747.890000000002, 766, 6102, 4063.5, 5016.0, 5017.0, 6092.909999999995, 6.358087487283825, 0.610599925292472, 0.5860120088377416], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["/No connection; nothing to close.", 92, 22.115384615384617, 11.5], "isController": false}, {"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 174, 41.82692307692308, 21.75], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 92, 22.115384615384617, 11.5], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 58, 13.942307692307692, 7.25], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 416, "Sampler error/Sampler configured for using existing connection, but there is no connection", 174, "/No connection; nothing to close.", 92, "Websocket I/O error/WebSocket I/O error: Connection reset", 92, "Sampler error/Sampler must use existing connection, but there is no connection", 58, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 58, "Sampler error/Sampler configured for using existing connection, but there is no connection", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 58, "Websocket I/O error/WebSocket I/O error: Connection reset", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 58, "Sampler error/Sampler configured for using existing connection, but there is no connection", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 58, "Sampler error/Sampler configured for using existing connection, but there is no connection", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 58, "Sampler error/Sampler must use existing connection, but there is no connection", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 92, "/No connection; nothing to close.", 92, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 34, "Websocket I/O error/WebSocket I/O error: Connection reset", 34, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
