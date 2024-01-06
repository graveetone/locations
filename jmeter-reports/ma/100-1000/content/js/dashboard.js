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

    var data = {"OkPercent": 49.5, "KoPercent": 50.5};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.273125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.14, 500, 1500, "Resource 5 | GetTrack"], "isController": false}, {"data": [0.12, 500, 1500, "Resource 5 | Open Connection"], "isController": false}, {"data": [0.14, 500, 1500, "Resource 5 | AddLocation"], "isController": false}, {"data": [0.215, 500, 1500, "Resource 5 | GetLocation"], "isController": false}, {"data": [0.47, 500, 1500, "Resource 5 | PingPong Request"], "isController": false}, {"data": [0.52, 500, 1500, "Resource 5 | CloseConnection"], "isController": false}, {"data": [0.06, 500, 1500, "Location | GetResourcesNearby"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 800, 404, 50.5, 1167.0737499999998, 0, 6288, 2.0, 4527.2, 4955.9, 5066.88, 4.6937933403551673E-7, 4.3640543581952175E-6, 1.6400773995889445E-8], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Resource 5 | GetTrack", 100, 53, 53.0, 740.4900000000001, 0, 3136, 0.0, 2441.5000000000005, 2834.2499999999977, 3135.3999999999996, 5.867241676428502E-8, 4.347598579538161E-6, 9.425402888403209E-10], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 53, 53.0, 3520.860000000001, 8, 5183, 4275.0, 4951.400000000001, 5066.4, 5182.84, 7.036307345904869, 0.468285493772868, 0.5393357066211653], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 53, 53.0, 739.5099999999999, 0, 3225, 0.0, 2522.7000000000007, 2865.849999999999, 3223.059999999999, 5.8672416807935314E-8, 3.6893719904911666E-9, 3.2584964295578917E-9], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 53, 53.0, 530.1899999999995, 0, 2760, 0.0, 1637.0000000000005, 2195.2499999999986, 2758.8899999999994, 5.8672416890382047E-8, 3.7031233433841716E-9, 1.023329458654515E-9], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 53, 53.0, 2.4600000000000004, 0, 40, 0.0, 1.9000000000000057, 23.0, 39.97999999999999, 5.867241698047102E-8, 5.3859445275041765E-11, 1.615783358251253E-10], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 96, 48.0, 2.6649999999999996, 0, 43, 0.0, 7.0, 14.899999999999977, 42.88000000000011, 1.1734483350887918E-7, 2.383566930649109E-10, 1.8472643712530592E-9], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 43, 43.0, 3797.7499999999986, 281, 6288, 4184.0, 5025.2, 5033.0, 6284.269999999998, 6.080136195050769, 0.5042831709430291, 0.48397646607284006], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["/No connection; nothing to close.", 96, 23.762376237623762, 12.0], "isController": false}, {"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 159, 39.35643564356435, 19.875], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset", 96, 23.762376237623762, 12.0], "isController": false}, {"data": ["Sampler error/Sampler must use existing connection, but there is no connection", 53, 13.118811881188119, 6.625], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 800, 404, "Sampler error/Sampler configured for using existing connection, but there is no connection", 159, "/No connection; nothing to close.", 96, "Websocket I/O error/WebSocket I/O error: Connection reset", 96, "Sampler error/Sampler must use existing connection, but there is no connection", 53, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Resource 5 | GetTrack", 100, 53, "Sampler error/Sampler configured for using existing connection, but there is no connection", 53, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | Open Connection", 100, 53, "Websocket I/O error/WebSocket I/O error: Connection reset", 53, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | AddLocation", 100, 53, "Sampler error/Sampler configured for using existing connection, but there is no connection", 53, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | GetLocation", 100, 53, "Sampler error/Sampler configured for using existing connection, but there is no connection", 53, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | PingPong Request", 100, 53, "Sampler error/Sampler must use existing connection, but there is no connection", 53, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Resource 5 | CloseConnection", 200, 96, "/No connection; nothing to close.", 96, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Location | GetResourcesNearby", 100, 43, "Websocket I/O error/WebSocket I/O error: Connection reset", 43, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
