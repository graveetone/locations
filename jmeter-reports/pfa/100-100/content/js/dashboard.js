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

    var data = {"OkPercent": 78.0, "KoPercent": 22.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.42, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.275, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.115, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.285, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.31, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.76, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.8, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.015, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 176, 22.0, 1244.8137500000003, 0, 6552, 372.5, 4257.7, 4597.0999999999985, 5144.570000000001, 4.693743765544916E-7, 8.818365369849829E-7, 2.5705581090992082E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 24, 24.0, 930.3900000000001, 0, 2139, 957.0, 1947.0, 2021.6, 2138.8199999999997, 5.8671797209829406E-8, 8.57431019544694E-7, 1.524091607208459E-9], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 24, 24.0, 2936.349999999999, 6, 4967, 3401.0, 4569.8, 4760.9, 4966.82, 6.910850034554251, 0.7437262439530062, 0.8565674671734623], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 24, 24.0, 952.7300000000001, 0, 2166, 1018.5, 1999.3, 2056.2999999999997, 2165.0399999999995, 5.867179722772977E-8, 5.225456940594683E-9, 5.2690024150996385E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 24, 24.0, 873.0099999999996, 0, 2177, 805.0, 1842.8000000000002, 2049.2999999999997, 2176.74, 5.867179727478711E-8, 5.24092704758279E-9, 1.6547280325154803E-9], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 24, 24.0, 0.88, 0, 3, 1.0, 2.0, 2.0, 3.0, 5.8671797345355895E-8, 8.709094918451266E-11, 2.6127284755353796E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 40, 20.0, 0.6349999999999996, 0, 6, 0.0, 1.0, 2.0, 4.0, 1.173435941386229E-7, 3.666987316831966E-10, 2.8419151705447735E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 16, 16.0, 4263.880000000002, 817, 6552, 4363.5, 5095.6, 5444.199999999999, 6548.859999999999, 4.95589255624938, 0.6057417112696997, 0.5813494275944098], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["/No connection; nothing to close.", 40, 22.727272727272727, 5.0], "isController": false}, {"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 72, 40.90909090909091, 9.0], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 40, 22.727272727272727, 5.0], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 24, 13.636363636363637, 3.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 176, "Sampler error/Sampler configured for using existing connection, but there is no connection", 72, "/No connection; nothing to close.", 40, "Websocket I/O error/WebSocket I/O error: Connection reset", 40, "Sampler error/Sampler must use existing connection, but there is no connection", 24, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 24, "Sampler error/Sampler configured for using existing connection, but there is no connection", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 24, "Websocket I/O error/WebSocket I/O error: Connection reset", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 24, "Sampler error/Sampler configured for using existing connection, but there is no connection", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 24, "Sampler error/Sampler configured for using existing connection, but there is no connection", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 24, "Sampler error/Sampler must use existing connection, but there is no connection", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 40, "/No connection; nothing to close.", 40, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 16, "Websocket I/O error/WebSocket I/O error: Connection reset", 16, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
