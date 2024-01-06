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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.155, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.105, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.18, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.195, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.61, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.625, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.005, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 316, 39.5, 1584.1274999999998, 0, 9637, 7.0, 4854.9, 5755.299999999997, 9527.220000000001, 4.693743471397714E-7, 4.972251713624335E-6, 2.0291043859384603E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 39, 39.0, 1090.3, 0, 5484, 888.0, 2545.4000000000005, 3190.0499999999993, 5483.169999999999, 5.8671793533746676E-8, 4.953114636690457E-6, 1.2232839765092692E-9], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 39, 39.0, 3405.179999999999, 7, 4955, 4061.5, 4703.0, 4775.05, 4954.98, 7.352400558782443, 0.6350779584221748, 0.7314346141827807], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 42, 42.0, 1484.4900000000005, 0, 6005, 544.5, 5496.8, 5961.449999999997, 6005.0, 5.8671793624315674E-8, 4.021080543510229E-9, 4.229067468174551E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 39, 39.0, 1211.6399999999996, 0, 5448, 645.5, 3044.100000000001, 5409.099999999999, 5447.96, 5.867179373037539E-8, 4.243964610946197E-9, 1.328136893232521E-9], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 39, 39.0, 0.8099999999999999, 0, 4, 1.0, 2.0, 2.0, 3.989999999999995, 5.8671793917916226E-8, 6.990194197251737E-11, 2.0970582591755212E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 75, 37.5, 1.7500000000000013, 0, 60, 0.0, 6.0, 7.0, 10.980000000000018, 1.1734358678494285E-7, 2.864833661741769E-10, 2.220246087849871E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 43, 43.0, 5477.099999999999, 1176, 9637, 4900.0, 9159.6, 9629.5, 9636.99, 3.544590954203885, 0.3291208085211967, 0.3167978165319722], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 117, 37.0253164556962, 14.625], "isController": false}, {"data": ["/No connection; nothing to close.", 75, 23.734177215189874, 9.375], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 10, 3.1645569620253164, 1.25], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 75, 23.734177215189874, 9.375], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 39, 12.341772151898734, 4.875], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 316, "Sampler error/Sampler configured for using existing connection, but there is no connection", 117, "/No connection; nothing to close.", 75, "Websocket I/O error/WebSocket I/O error: Connection reset", 75, "Sampler error/Sampler must use existing connection, but there is no connection", 39, "Websocket I/O error/WebSocket I/O error: Read timed out", 10], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 39, "Sampler error/Sampler configured for using existing connection, but there is no connection", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 39, "Websocket I/O error/WebSocket I/O error: Connection reset", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 42, "Sampler error/Sampler configured for using existing connection, but there is no connection", 39, "Websocket I/O error/WebSocket I/O error: Read timed out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 39, "Sampler error/Sampler configured for using existing connection, but there is no connection", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 39, "Sampler error/Sampler must use existing connection, but there is no connection", 39, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 75, "/No connection; nothing to close.", 75, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 43, "Websocket I/O error/WebSocket I/O error: Connection reset", 36, "Websocket I/O error/WebSocket I/O error: Read timed out", 7, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
