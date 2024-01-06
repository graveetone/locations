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

    var data = {"OkPercent": 4.0, "KoPercent": 96.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.038125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.03, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.055, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.03, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.04, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.07, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.04, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.0, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 768, 96.0, 1235.6237500000025, 0, 6607, 0.0, 4983.0, 4999.0, 6004.0, 4.6932460915011135E-7, 2.484504336868913E-7, 1.695801810405676E-9], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 97, 97.0, 247.73000000000002, 0, 6006, 0.0, 0.0, 326.5999999999992, 6006.0, 5.866557628834763E-8, 2.472662375590902E-7, 1.4036197451801926E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 93, 93.0, 4231.81, 12, 4983, 4478.5, 4874.9, 4959.0, 4982.9, 6.911327666044648, 0.06850583575229802, 0.07889982462506048], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 97, 97.0, 245.6400000000001, 0, 6005, 0.0, 0.0, 224.29999999999984, 6005.0, 5.866557649505313E-8, 2.0452744930404263E-10, 4.852513993291992E-10], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 96, 96.0, 190.22, 0, 6006, 0.0, 0.0, 280.8999999999993, 6005.99, 5.8665576701689784E-8, 2.887446353286294E-10, 1.5239300197899886E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 93, 93.0, 0.11, 0, 3, 0.0, 0.0, 1.0, 2.989999999999995, 5.8665576908395284E-8, 8.020684342944667E-12, 2.4062053028834002E-11], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 192, 96.0, 0.05999999999999999, 0, 2, 0.0, 0.0, 0.0, 2.0, 1.1733115257662643E-7, 1.833299259009788E-11, 1.4208069257325858E-10], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, 100.0, 4969.359999999999, 4199, 6607, 4995.0, 5001.0, 5002.0, 6590.959999999992, 4.332943368430175, 0.0061355155119372584, 0.006050887711772607], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 279, 36.328125, 34.875], "isController": false}, {"data": ["/No connection; nothing to close.", 192, 25.0, 24.0], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 12, 1.5625, 1.5], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 192, 25.0, 24.0], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 93, 12.109375, 11.625], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 768, "Sampler error/Sampler configured for using existing connection, but there is no connection", 279, "/No connection; nothing to close.", 192, "Websocket I/O error/WebSocket I/O error: Connection reset", 192, "Sampler error/Sampler must use existing connection, but there is no connection", 93, "Websocket I/O error/WebSocket I/O error: Read timed out", 12], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 97, "Sampler error/Sampler configured for using existing connection, but there is no connection", 93, "Websocket I/O error/WebSocket I/O error: Read timed out", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 93, "Websocket I/O error/WebSocket I/O error: Connection reset", 93, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 97, "Sampler error/Sampler configured for using existing connection, but there is no connection", 93, "Websocket I/O error/WebSocket I/O error: Read timed out", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 96, "Sampler error/Sampler configured for using existing connection, but there is no connection", 93, "Websocket I/O error/WebSocket I/O error: Read timed out", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 93, "Sampler error/Sampler must use existing connection, but there is no connection", 93, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 192, "/No connection; nothing to close.", 192, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 100, "Websocket I/O error/WebSocket I/O error: Connection reset", 99, "Websocket I/O error/WebSocket I/O error: Read timed out", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
