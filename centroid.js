geolocations = {
(38.89521640271775,-77.03701257705688),
(38.895170476571984,-77.0360255241394), 
(38.89482394196919,-77.03512966632843), 
(38.894214370974396,-77.03468441963196),
(38.89337933372204,-77.03484535217285),
(38.89286995617712,-77.03549981117249),
(38.89261944129033,-77.03654050827026),
(38.892794801803866,-77.0375382900238),
(38.89326242772328,-77.03823566436766),
(38.89391375869455,-77.03853607177734),
(38.89448993111317,-77.03836441040039),
(38.895015997500096,-77.03767776489258),
}


var latXTotal = 0;
var latYTotal = 0;
var lonDegreesTotal = 0;

var currentLatLong;
for (var i = 0; currentLatLong = geolocations[i]; i++) { 
    var latDegrees = currentLatLong.lat();
    var lonDegrees = currentLatLong.lng();

    var latRadians = Math.PI * latDegrees / 180;
    latXTotal += Math.cos(latRadians);
    latYTotal += Math.sin(latRadians);

    lonDegreesTotal += lonDegrees;
}

var finalLatRadians = Math.atan2(latYTotal, latXTotal);
var finalLatDegrees = finalLatRadians * 180 / Math.PI;

var finalLonDegrees = lonDegreesTotal / google_latlngs.length;