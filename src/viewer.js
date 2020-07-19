// get or create Element ///////////////////////////////////////////////////////
var img      = document.createElement("img");
var canvas   = document.getElementById("mycanvas");
var zoom_txt = document.getElementById("zoom_txt");
var pos_txt  = document.getElementById("pos_txt");
var col_txt  = document.getElementById("col_txt");

// addEventListener ////////////////////////////////////////////////////////////
// document
document.ondragover = document.ondrop = function(e) { e.preventDefault(); }
document.addEventListener("drop", doc_drop, false);
document.addEventListener("keypress", key_zoom, false);
// canvas
canvas.addEventListener("mousedown" , mouse_down    , false);
canvas.addEventListener("mouseup"   , mouse_up      , false);
canvas.addEventListener("mousemove" , get_image_info, false);

// init var ////////////////////////////////////////////////////////////////////
var size = 1.0
var mouse_down_flg = 0;
var objX = 0
var objY = 0
var relX, relY;
var ctx = canvas.getContext("2d");

// function ////////////////////////////////////////////////////////////////////
function doc_drop(e) {
  img.src = e.dataTransfer.files[0].path

  img.onload = function() {
    size = 1.0;
    img.style.zoom=size;
    zoom_txt.textContent = String(Math.floor(size * 100 + 0.5)) + "%";
    draw_canvas_image();
  }
}

function draw_canvas_image() {
  canvas.width  = screen.width;
  canvas.height = screen.height;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.scale(size, size);
  ctx.drawImage(img, objX, objY);
  ctx.scale(1/size, 1/size);
}

function zoom() {
  swt=event.wheelDelta;

  // zoom倍率を上げる
  var                   scale_up = 1;
  if      (size >= 10)  scale_up = 10;
  else if (size >= 100) scale_up = 100;

  if   (swt<=-120 && size>0.2) { size=size-(0.1 * scale_up); }
  else                         { size=size+(0.1 * scale_up); }

  set_zoom();
  draw_canvas_image();
}

function set_zoom() {
  img.style.zoom=size;
  zoom_txt.textContent = String(Math.floor(size * 100 + 0.5)) + "%";
}

function key_zoom(e) {
  for (var i = 1; i <= 9; i++) {
    if (e.key == String(i)) {
      size = Number(e.key)
      objX = 0; objY = 0;
      set_zoom();
      draw_canvas_image();
    }
  }
}

function not_proc() {
  return false;
}

function mouse_up() {
  mouse_down_flg = 0;
}

function mouse_down(e) {
  mouse_down_flg = 1;

  var offsetX = canvas.getBoundingClientRect().left;
  var offsetY = canvas.getBoundingClientRect().top;

  var x = e.clientX - offsetX;
  var y = e.clientY - offsetY;

  relX = objX - (x/size);
  relY = objY - (y/size);
}

function get_image_info(e) {
  var offsetX = canvas.getBoundingClientRect().left;
  var offsetY = canvas.getBoundingClientRect().top;

  var x = e.clientX - offsetX;
  var y = e.clientY - offsetY;

  var posx = Math.floor(Math.min(Math.max((x/size - objX) , 0), img.width ))
  var posy = Math.floor(Math.min(Math.max((y/size - objY) , 0), img.height))

  pos_txt.textContent = "X: " + String(posx) + " Y: " + String(posy);

  var getImageData = ctx.getImageData(x, y, 1, 1);
  var R = getImageData.data[0]
  var G = getImageData.data[1]
  var B = getImageData.data[2]

  col_txt.textContent = "R: " + String(R) + " G: " + String(G) + " B: " + String(B);

  if (mouse_down_flg == 1) {
    objX = (x/size) + relX;
    objY = (y/size) + relY;
    draw_canvas_image();
  }
}