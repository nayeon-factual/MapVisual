mapbox.auto('map', 'ktingvoar.map-6t840i3d');

// props
var boundsRotateX     = {max: 10, min: -30},
    boundsRotateZ     = {max: 20, min: -20}, 
    targetRotation    = {x: 20, y: 0, z: 0},
    currentRotation   = targetRotation;

// interpolate
function lerp(start, stop, t) {
  return (stop - start) * t + start;
}

// re-maps a number from one range to another
function map(value, fromLow, fromHigh, toLow, toHigh) {
  var fromDiff   = fromHigh - fromLow,
      toDiff     = toHigh - toLow,
      ratio      = toDiff / fromDiff;
  return toLow + (value - fromLow) * ratio;
}

// main animation loop; interpolates to the value of targetRotation
(function tick() {
  currentRotation = { x: lerp(currentRotation.x, targetRotation.x, 0.05),
                      y: lerp(currentRotation.y, targetRotation.y, 0.05),
                      z: lerp(currentRotation.z, targetRotation.z, 0.05)};
  // render rotation of the device
  $("#map").css("transform", "rotateX(" + currentRotation.x + "deg) rotateY(" + currentRotation.y + "deg) rotateZ(" + currentRotation.z + "deg)  translateX(0px) translateY(-50px) translateZ(-50px)");
  requestAnimationFrame(tick);
})();

// update the target rotation value when the user moves the mouse. y position controls x rotation, x position controls z rotation, currently not modifying the y rotation.
$("html").on("mousemove", function(e) {
  targetRotation  = {x: map(e.clientY, 0, $("html").height(), boundsRotateX.min, boundsRotateX.max) * -1,
                     y: 0,
                     z: map(e.clientX, 0, $("html").width(), boundsRotateZ.min, boundsRotateZ.max) * -1};
});