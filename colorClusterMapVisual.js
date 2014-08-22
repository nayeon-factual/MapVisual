//Resizing Panes Layout Settings
$(document).ready(function () {
    $('body').layout({ 
        applyDefaultStyles: true,
        east:{size: 650}
    });
    $('#rightDiv').layout({ 
        applyDefaultStyles: true,
        south:{size: 200}
    });
    initMap();
});

function initMap(){
    // LOAD MAP
    var map = L.mapbox.map('map', 'nayeon-factual.ijioib62')
        .setView([38, -102.0], 9);

    // LOAD POINTS
    var featureLayer = L.mapbox.featureLayer()
        .loadURL('map.geojson')
                
    featureLayer.on('ready', function(layer) {
        map.fitBounds(featureLayer.getBounds());

    // Initially populate mapDataTable with first 100 data points
    var featCol = featureLayer._geojson;
    for (i = 0; i < 100; i++) {
        var f = featCol.features[i]
        populate(f);
    }
     
    // Initialize marker and cluster settings
    var markers = new L.MarkerClusterGroup({
        maxClusterRadius: 30,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var stDev = getStDev(cluster);
            var sat = 100;
            if (stDev < 0.01) {
                var hue = stDev * 28 + 5;
                var opac = 1;
            } else if (0.01 < stDev < 0.06) {
                var hue = stDev * 33 + 10;
                var opac = 0.85
            } else {
                var hue = stDev * 38 + 20;
                var opac = 0.7;
            }
            var hslaFinal = "hsla("+hue.toFixed(0)+", " +sat+"%, " +"65%, "+opac+")";
            return new L.DivIcon({
                html: '<div style="background-color:'+hslaFinal+';"><span>'+ childCount +','+ stDev.toFixed(1) + '</span></div></div>',
                className: 'marker-cluster',
                iconSize: new L.Point(40, 40)
            })
        }
    });

    this.eachLayer(function(marker) {
            markers.addLayer(marker);
        });
    map.addLayer(markers);


    // Highlight in DataTable when Mouse Hovers over a Marker
markers.on('mouseover', function (a) {
    var markerID = "("+a.layer._latlng.lng+", "+a.layer._latlng.lat+")";
    $("#mapDataTable tr[class='"+markerID+"']").addClass("active");
    
})
       .on('mouseout', function (a) {
       var markerID = "("+a.layer._latlng.lng+", "+a.layer._latlng.lat+")";
       $("#mapDataTable tr[class='"+markerID+" active']").removeClass("active");
});

// Populate mapDataTable when a Marker is Clicked
markers.on('click', function (a) {
    $("#mapDataTable").html("<tr><th>Name</th><th>Locality</th><th>Latitude</th><th>Longitude</th></tr>");
    populate(a.layer.toGeoJSON());
    $("#mapDataTable tr").click(function(){
       window.open("http://www.factual.com/"+$(this).attr('id'));
    });
});

// Populate mapDataTable when a Marker is Clicked
markers.on('click', function (a) {
    $("#mapDataTable").html("<tr><th>Name</th><th>Locality</th><th>Latitude</th><th>Longitude</th></tr>");
    populate(a.layer.toGeoJSON());
    $("#mapDataTable tr").click(function(){
       window.open("http://www.factual.com/"+$(this).attr('id'));
    });
});

// Populate mapDataTable when Cluster is Clicked
markers.on('clusterclick', function (a) {
    //a.layer.getAllChildMarkers() returns an array; getAllChildMarkers().length is childcount
    $("#mapDataTable").html("<tr><th>Name</th><th>Locality</th><th>Latitude</th><th>Longitude</th></tr>");
    $("#msgTable").html("<tr><th>Issue</th><th>Coordinates</th></tr>");
    
    // dupCount keeps a count of identical lat/lngs
    var dupCount = {};
    var clickedstDev = getStDev(a.layer);
    for (i = 0; i < a.layer.getAllChildMarkers().length; i++) {
        var markerObject = a.layer.getAllChildMarkers()[i].toGeoJSON();
        var clickedName = markerObject.properties.name;
        var clickedLoc = markerObject.properties.locality;
        var clickedLat = markerObject.geometry.coordinates[0];
        var clickedLng = markerObject.geometry.coordinates[1];
        var clickedID = markerObject.properties.factual_id;
        var clickedDens = markerObject.properties.pop_density;
        var clickedPop = markerObject.properties.us_pop;
        var clickedEnviro = markerObject.properties.enviro;
        var clickedCoor = "("+clickedLat+", "+clickedLng+")";
        var latDecLen = clickedLat.toString().split('.')[1].length;
        var lngDecLen = clickedLng.toString().split('.')[1].length;
                                    
        $("#mapDataTable").append('<tr id="'+clickedID+'"class="'+clickedCoor+'"><td>' + clickedName +"</td>"+"<td>"+clickedLoc+"</td>"+"<td>"+clickedLat+"</td>"+"<td>"+clickedLng+"</td></tr>");
        // enable dataTable clicking
        $("#mapDataTable tr:not(':has(th)')").click(function(){
           window.open("http://www.factual.com/"+$(this).attr('id'));
       });
        
        // Error 4a: Potentially wrong location (sparsely populated)
        // if area population < 100 or population density < 500, then alert error.
        // *** TODO *** find more appropriate thresholds for all condition (100 should be a "ridiculously low" threshold
        if ((clickedPop < 100 || clickedDens < 400) && clickedEnviro == "Artificial surfaces and associated areas") {
            $("#mapDataTable tr[class='"+clickedCoor+"']").addClass("danger");
            $("#msgTable").append('<tr id="'+clickedCoor+'" class="badLocationCoor"><td> Potential Error: Area sparsely populated! </td><td>' + clickedCoor + "</td></tr>");
            var error4aCircle = new L.circleMarker([clickedLng, clickedLat], { 
                color: 'blue',
                radius: 8,
                fillOpacity: 0.1
            });
            map.addLayer(error4aCircle);
        // Error 4b: Potentially wrong location (surroundings are water or mountains)
        // if environment indicates water or mountains, then alert error.
        } else if ((clickedPop < 50 || clickedDens < 50) && (clickedEnviro == "Water Bodies" || clickedEnviro == "Tree Cover, needle-leaved, evergreen" || clickedEnviro == "Bare Areas")) {
            $("#mapDataTable tr[class='"+clickedCoor+"']").addClass("danger");
            $("#msgTable").append('<tr id="'+clickedCoor+'" class="badLocationCoor"><td> Potential Error: Check Environment! (Surroundings: Water or Mountains or Rural) </td><td>' + clickedCoor + "</td></tr>");
            var error4bCircle = new L.circleMarker([clickedLng, clickedLat], { 
                color: 'blue',
                radius: 8,
                fillOpacity: 0.1
            });
            map.addLayer(error4bCircle);
        // Error 3: Potentially Truncated Decimal Points
        // if both lat/lng have decimal places < 3, then alert error. 
        } else if (latDecLen < 3 && lngDecLen < 3) {
            $("#mapDataTable tr[class='"+clickedCoor+"']").addClass("danger");
            $("#msgTable").append('<tr id="'+clickedCoor+'" class="truncatedDecimal"><td> Potential Error: Lat/Lng Truncated Decimals! </td><td>' + clickedCoor + "</td></tr>");
            var error3Circle = new L.circleMarker([clickedLng, clickedLat], { 
                color: '#ff00c8',
                radius: 10,
                fillOpacity: 0.1
            });
            map.addLayer(error3Circle);
        // Error 2: Extreme Clustering
        // if st. of deviation in cluster is < 0.05, then alert error. 
        } else if ((clickedPop < 300 || clickedDens < 500) && clickedstDev < 0.05) {
            $("#mapDataTable tr[class='"+clickedCoor+"']").addClass("danger");
            $("#msgTable").append('<tr id="'+clickedCoor+'" class="extrCluster"><td> Potential Error: Possible Extreme Clustering! </td><td>' + clickedCoor + "</td></tr>");
            var error2Circle = new L.circleMarker([clickedLng, clickedLat], { 
                color: '#a32100',
                radius: 10,
                fillOpacity: 0.1
            });
            map.addLayer(error2Circle);
        }
        // Error 1: Repeating Lat/Lngs
        // if there are multiples of the exact same lat/lng, then alert error. 
        if (clickedCoor in dupCount) {
            dupCount[clickedCoor]++;
        } else {
            dupCount[clickedCoor] = 1;
        }
    }
    for (var key in dupCount) {
        if (dupCount[key] > 1) {
            // mark red in the dataTable
            $("#mapDataTable tr[class='"+key+"']").addClass("danger");
            // throw error msg in msgTable
            $("#msgTable").append('<tr id="'+key+'" class="dupCoor"><td> Potential Error: Found Repeating Lat/Lngs! ('+dupCount[key]+') </td><td>' + key + "</td></tr>");
            // show red circles where there is Error 1. 
            var keyCoor = key.toString().slice(1,-1).split(',');
            var error1Circle = new L.circleMarker([keyCoor[1], keyCoor[0]], { 
                color: 'red',
                radius: 8,
                fillOpacity: 0.1
            });
            map.addLayer(error1Circle);
        } 
    }


}

    
    

// populate mapDataTable with name and properties
function populate(markerObject) {
    //markerObject is a marker.toGeoJSON() object
    markerObject.name = markerObject.properties.name;
    markerObject.loc = markerObject.properties.locality;
    markerObject.lat = markerObject.geometry.coordinates[0];
    markerObject.lng = markerObject.geometry.coordinates[1];
    markerObject.id = markerObject.properties.factual_id;
    markerObject.coor = "("+markerObject.lat+", "+markerObject.lng+")";
    $("#mapDataTable").append('<tr id ="'+markerObject.id+'" class="'+markerObject.coor+'"><td>' + markerObject.name +"</td>"+"<td>"+markerObject.loc+"</td>"+"<td>"+markerObject.lat+"</td>"+"<td>"+markerObject.lng+"</td></tr>");
};
            
// generate standard of deviation given cluster [object Object]
function getStDev(clusterObj) {
    var markerObject = clusterObj.toGeoJSON();
    // Cluster Boundary Polygon Object
    var boundPolygon = L.polygon(clusterObj.getConvexHull());
    // Area of Cluster Boundary in km^2
    var boundArea = (LGeo.area(boundPolygon) / 1000000).toFixed(2);
    var clusterDensity = boundArea/clusterObj.getChildCount();
    // All child markers of the cluster
    var clusterMarkers = clusterObj.getAllChildMarkers();
    // Calculating LatLng of the Centroid of the Cluster
    var latXTotal = 0;
    var latYTotal = 0;
    var lonDegreesTotal = 0;
    var currentLatLng;
    for (d = 0; d < clusterMarkers.length; d++) {
        currentLatLng = clusterMarkers[d]._latlng;
        var latDeg = currentLatLng.lat;
        var lonDeg = currentLatLng.lng;
        var latRad = Math.PI * latDeg / 180;
        latXTotal += Math.cos(latRad);
        latYTotal += Math.sin(latRad);
        lonDegreesTotal += lonDeg;
    }
    var centrLatRad = Math.atan2(latYTotal, latXTotal);
    // get Centroid Coordinates: (centrLatDeg, centrLonDeg)
    var centrLatDeg = centrLatRad * 180 / Math.PI;
    var centrLonDeg = lonDegreesTotal / clusterMarkers.length;
    // Calculating Standard of Deviation for all Markers in Cluster
    // Compare and average distances between all points and centroid
    var R = 6371; //earth's radius approx.
    var centrLonRad = Math.PI * centrLonDeg / 180;
    var distSum = 0;
    for (s = 0; s < clusterMarkers.length; s++) {
        // Use Haversine Formula for Distance Between All Markers and Centroid
        var otherLat = clusterMarkers[s]._latlng.lat;
        var otherLon = clusterMarkers[s]._latlng.lng;
        var deltaLat = Math.PI * (otherLat - centrLatDeg) / 180; //deltaLat in Rad
        var deltaLng = Math.PI * (otherLon - centrLonDeg) / 180; //deltaLng in Rad

        var step1 = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) + 
            Math.cos(centrLatRad) * Math.cos(Math.PI *  otherLat/180) 
            * Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
        var step2 = 2*Math.atan2(Math.sqrt(step1), Math.sqrt(1-step1));

        var dist = R * step2
        distSum += dist;
        }
    // return stDev
    return distSum / clusterMarkers.length;
};

// Click on Error Message to Zoom to Location of Error
    $("#msgTable tr:not(':has(th)')").click(function(){
        var msgLat = $(this).attr('id').slice(1,-1).split(", ")[0];
        var msgLng = $(this).attr('id').slice(1,-1).split(", ")[1];
        var latlngObj = L.latLng([msgLng, msgLat]);
        map.setView(latlngObj, 17);
    });

    // Error Message Hover
    $("#msgTable tr:not(':has(th)')").hover(
        function mouseEnter(){
        $(this).css("color","blue");
    }, function mouseLeave() {
        $(this).css("color","red");
    });
});

$("#mapDataTable tr:not(':has(th)')").click(function(){
   window.open("http://www.factual.com/"+$(this).attr('id'));
});

});
            
