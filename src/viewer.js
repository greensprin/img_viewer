// get Element //////////////////////////////////////////////////////////////////
var pdiv     = document.getElementById("mybox1")
var canvas   = document.getElementById("mycanvas");
var zoom_txt = document.getElementById("zoom_txt");
var pos_txt  = document.getElementById("pos_txt");
var col_txt  = document.getElementById("col_txt");
var button   = document.getElementById("btn1");

// create Element //////////////////////////////////////////////////////////////
var img = document.createElement("img");
img.classList.add("imgClass");

var img_div = document.createElement("div");
img_div.appendChild(img);

// addEventListener ////////////////////////////////////////////////////////////
// document
document.ondragover = document.ondrop = function(e) { e.preventDefault(); }
document.addEventListener("drop", doc_drop, false);
document.addEventListener("keydown", key_press, false);
// canvas
canvas.addEventListener("mousedown" , mouse_down    , false);
canvas.addEventListener("mouseup"   , mouse_up      , false);
canvas.addEventListener("mousemove" , get_image_info, false);
// button
button.addEventListener("mousedown", cmp_image_down,false);
button.addEventListener("mouseup"  , cmp_image_up  ,false);
button.addEventListener("mouseover", cmp_image_over,false);
button.addEventListener("mouseout" , cmp_image_out ,false);
button.style.opacity = 0.5;

// window //////////////////////////////////////////////////////////////////////
window.addEventListener("resize", function(e) {
  clearTimeout(timeoutID)
  
  timeoutID = setTimeout( function() {
    var child_num = pdiv.childElementCount;
    win_width  = window.innerWidth  / child_num;
    draw_canvas_image();
  }, 100);
} , false);

// init var ////////////////////////////////////////////////////////////////////
var size = 1.0
var mouse_down_flg = 0;
var objX = 0
var objY = 0
var relX, relY;
var timeoutID;
var win_width  = window.innerWidth;
var win_height = window.innerHeight;
var img_tmp_ary = ["", ""];

// function ////////////////////////////////////////////////////////////////////
function doc_drop(e) {
  var img_child = img_div.getElementsByClassName("imgClass");

  var x = e.clientX;
  var y = e.clientY;

  var img_index = Math.floor(x / win_width);

  img_child[img_index].src = e.dataTransfer.files[0].path;
  img_tmp_ary[img_index]   = e.dataTransfer.files[0].path;

  // img.src = e.dataTransfer.files[0].path

  set_zoom();

  img_child[img_index].onload = function() {
    draw_canvas_image();
  }
}

function draw_canvas_image() {
  var num = pdiv.childElementCount;
  canvas_child = pdiv.getElementsByClassName("canvas_box");
  img_child    = img_div.getElementsByClassName("imgClass");
  for (var i = 0; i < num; i++) {
    canvas_child[i].width  = win_width;
    canvas_child[i].height = win_height;
    var ctx = canvas_child[i].getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0,0,canvas_child[i].width,canvas_child[i].height);
    ctx.scale(size, size);
    ctx.drawImage(img_child[i], objX, objY);
    ctx.scale(1/size, 1/size);
  }
}

function zoom() {
  swt=event.wheelDelta;

  // zoom倍率を上げる
  var scale_up = (size / 10) / 2;

  if   (swt<=-120 && size>0.2) { size=size-(0.1 + scale_up); }
  else                         { size=size+(0.1 + scale_up); }

  set_zoom();
  draw_canvas_image();
}

function set_zoom() {
  img.style.zoom=size;
  zoom_txt.textContent = String(Math.floor(size * 100 + 0.5)) + "%";
}

function key_press(e) {
  for (var i = 1; i <= 9; i++) {
    if (e.key == String(i)) {
      size = Number(e.key)
      objX = 0; objY = 0;
      set_zoom();
      draw_canvas_image();
    }
  }

  if (e.keyCode == 112) {
    if (pdiv.childElementCount == 2) {
      // remove canvas
      var canvas_child = document.getElementsByClassName("canvas_box");
      pdiv.removeChild(canvas_child[1]);

      win_width  = innerWidth;
      draw_canvas_image();
    }
  }

  if (e.keyCode == 113) {
    if (pdiv.childElementCount == 1) {
      console.log("add new canvas")
      // set win size
      win_width  = innerWidth  / 2;

      // add new canvas
      var canvas_child = document.createElement("canvas");
      canvas_child.setAttribute("class", "canvas_box");
      canvas_child.width  = win_width;
      canvas_child.height = win_height;
      canvas_child.addEventListener("mousedown" , mouse_down    , false);
      canvas_child.addEventListener("mouseup"   , mouse_up      , false);
      canvas_child.addEventListener("mousemove" , get_image_info, false);
      pdiv.appendChild(canvas_child);

      // add new img
      var img_child = document.createElement("img");
      img_child.classList.add("imgClass");
      img_div.appendChild(img_child);

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

  var canvas_child = pdiv.getElementsByClassName("canvas_box");

  var img_child = img_div.getElementsByClassName("imgClass");
  var canvas_num_x = Math.floor(e.clientX / win_width );
  // var canvas_num_y = Math.floor(e.clientY / win_height);

  var x = e.clientX - offsetX;
  var y = e.clientY - offsetY;

  var show_x = e.clientX - win_width * canvas_num_x - offsetX;
  var show_y = y;

  var posx = Math.floor(Math.min(Math.max((show_x/size - objX), 0), img_child[canvas_num_x].width ))
  var posy = Math.floor(Math.min(Math.max((show_y/size - objY), 0), img_child[canvas_num_x].height))

  pos_txt.textContent = "X: " + String(posx) + " Y: " + String(posy);

  var ctx = canvas_child[canvas_num_x].getContext("2d");
  var getImageData = ctx.getImageData(show_x, show_y, 1, 1);
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

function cmp_image_up() {
  img_num = img_div.childElementCount;
  img_child = img_div.getElementsByClassName("imgClass");

  if (img_num == 2) {
    img_child[1].src = img_tmp_ary[1];
    draw_canvas_image();
  }
}

function cmp_image_down() {
  img_num = img_div.childElementCount;
  img_child = img_div.getElementsByClassName("imgClass");

  if (img_num == 2) {
    img_child[1].src = img_tmp_ary[0];
    draw_canvas_image();
  }
}

function cmp_image_over() {
  button.style.opacity = 1.0;
}

function cmp_image_out() {
  button.style.opacity = 0.5;
}