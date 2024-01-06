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

    var data = {"OkPercent": 33.375, "KoPercent": 66.625};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.188125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.11, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.05, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.155, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.155, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.37, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.33, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.005, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 533, 66.625, 1383.2500000000011, 0, 9803, 1.0, 4913.5999999999985, 5008.599999999999, 9583.0, 4.693741033492162E-7, 3.052868298319369E-6, 1.1328692347925665E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 63, 63.0, 684.2299999999997, 0, 3871, 0.0, 2940.4000000000005, 3385.4499999999985, 3869.5499999999993, 5.867176294230116E-8, 3.0420357961301077E-6, 7.419915333035156E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 63, 63.0, 3667.81, 20, 5016, 4243.5, 4860.9, 4961.0, 5015.5599999999995, 6.947339169098235, 0.3639890101778519, 0.41921492896345697], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 64, 64.0, 614.6700000000001, 0, 6006, 0.0, 1377.2000000000003, 3072.85, 5984.849999999989, 5.867176296316196E-8, 2.516468583341868E-9, 2.565170730332774E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 63, 63.0, 501.61000000000024, 0, 5235, 0.0, 2005.2, 2991.7, 5217.249999999991, 5.867176316991105E-8, 2.6001216920415655E-9, 8.055908107118645E-10], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 63, 63.0, 0.6500000000000002, 0, 6, 0.0, 2.0, 2.9499999999999886, 5.989999999999995, 5.867176335011941E-8, 4.239951648348473E-11, 1.271985494504542E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 134, 67.0, 0.7049999999999996, 0, 24, 0.0, 3.0, 3.0, 6.980000000000018, 1.1734352583730405E-7, 1.5126313877464978E-10, 1.1722893255035357E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 83, 83.0, 5595.620000000003, 685, 9803, 4990.5, 9583.0, 9585.9, 9802.279999999999, 3.771165667307765, 0.15736514547271563, 0.15272484396802052], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 189, 35.45966228893058, 23.625], "isController": false}, {"data": ["/No connection; nothing to close.", 134, 25.140712945590995, 16.75], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 13, 2.4390243902439024, 1.625], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 134, 25.140712945590995, 16.75], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 63, 11.819887429643527, 7.875], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 533, "Sampler error/Sampler configured for using existing connection, but there is no connection", 189, "/No connection; nothing to close.", 134, "Websocket I/O error/WebSocket I/O error: Connection reset", 134, "Sampler error/Sampler must use existing connection, but there is no connection", 63, "Websocket I/O error/WebSocket I/O error: Read timed out", 13], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 63, "Sampler error/Sampler configured for using existing connection, but there is no connection", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 63, "Websocket I/O error/WebSocket I/O error: Connection reset", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 64, "Sampler error/Sampler configured for using existing connection, but there is no connection", 63, "Websocket I/O error/WebSocket I/O error: Read timed out", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 63, "Sampler error/Sampler configured for using existing connection, but there is no connection", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 63, "Sampler error/Sampler must use existing connection, but there is no connection", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 134, "/No connection; nothing to close.", 134, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 83, "Websocket I/O error/WebSocket I/O error: Connection reset", 71, "Websocket I/O error/WebSocket I/O error: Read timed out", 12, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
