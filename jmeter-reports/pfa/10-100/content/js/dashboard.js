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

    var data = {"OkPercent": 85.25, "KoPercent": 14.75};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.498125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.17, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.405, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.425, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.85, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.855, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.025, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 118, 14.75, 1117.3212499999988, 0, 5899, 473.0, 3904.3999999999996, 4390.9, 4953.700000000001, 4.6937439354167257E-7, 1.0054232134178957E-6, 2.795734150204147E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 15, 15.0, 878.7100000000002, 0, 1806, 886.5, 1618.0, 1694.3499999999997, 1805.2899999999997, 5.867179927381154E-8, 9.789235007802215E-7, 1.7045761996053647E-9], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 15, 15.0, 2607.4000000000005, 12, 4681, 2487.5, 4432.2, 4557.7, 4680.91, 7.137249304118193, 0.8590488054028977, 0.9893872448433374], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 15, 15.0, 878.17, 0, 1813, 882.5, 1620.0, 1662.8, 1812.2299999999996, 5.867179930437989E-8, 5.795559081677759E-9, 5.892963435991671E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 15, 15.0, 858.9599999999999, 0, 1829, 854.0, 1671.4, 1744.0499999999995, 1828.5199999999998, 5.8671799332779515E-8, 5.8110291878227525E-9, 1.8506827328601352E-9], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 15, 15.0, 1.01, 0, 5, 1.0, 2.0, 2.0, 4.989999999999995, 5.867179937680756E-8, 9.740435443415318E-11, 2.922130633024595E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 29, 14.5, 0.9499999999999995, 0, 5, 1.0, 2.0, 3.0, 4.990000000000009, 1.1734359838541814E-7, 3.919092836700489E-10, 3.037296948442879E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 14, 14.0, 3712.4200000000005, 611, 5899, 3935.0, 4862.5, 5350.749999999997, 5896.569999999999, 5.2789948793749675, 0.6605960975030354, 0.633994912368685], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 45, 38.13559322033898, 5.625], "isController": false}, {"data": ["/No connection; nothing to close.", 29, 24.576271186440678, 3.625], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 29, 24.576271186440678, 3.625], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 15, 12.711864406779661, 1.875], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 118, "Sampler error/Sampler configured for using existing connection, but there is no connection", 45, "/No connection; nothing to close.", 29, "Websocket I/O error/WebSocket I/O error: Connection reset", 29, "Sampler error/Sampler must use existing connection, but there is no connection", 15, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 15, "Sampler error/Sampler configured for using existing connection, but there is no connection", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 15, "Websocket I/O error/WebSocket I/O error: Connection reset", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 15, "Sampler error/Sampler configured for using existing connection, but there is no connection", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 15, "Sampler error/Sampler configured for using existing connection, but there is no connection", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 15, "Sampler error/Sampler must use existing connection, but there is no connection", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 29, "/No connection; nothing to close.", 29, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 14, "Websocket I/O error/WebSocket I/O error: Connection reset", 14, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
