document.ondragover = document.ondrop = function(e) {
  e.preventDefault();
}

var img = document.getElementById("myimg");

var canvas = document.createElement("canvas");

var zoom_txt = document.getElementById("zoom_txt");
var pos_txt  = document.getElementById("pos_txt");
var col_txt  = document.getElementById("col_txt");

document.addEventListener("drop", function(e) {
  img.src = e.dataTransfer.files[0].path

  img.onload = function() {
    canvas.width  = img.width;
    canvas.height = img.height;

    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  }
}, false);

size = 1.0;

function zoom() {
  swt=event.wheelDelta;
  if (swt<=-120 && size>0.2) {
    size=size-0.1;
  } else {
    size=size+0.1;
  }
  img.style.zoom=size;

  // かなり微妙な実装（zoomときに真ん中に注目したい
  var ofst = -1;
  if (swt >= 120) {ofst = 1;};

  moveX = 60 * ofst;
  moveY = 30 * ofst;
  scrollBy(moveX, moveY);

  zoom_txt.textContent = String(Math.floor(size * 100 + 0.5)) + "%";
}

document.addEventListener("keypress", function (e) {
  for (var i = 1; i <= 9; i++) {
    if (e.key == String(i)) {
      size = Number(e.key)
      img.style.zoom = size;
      zoom_txt.textContent = String(size * 100) + "%";
    }
  }
});

mouse_down_flg = 0;
img.onmousedown = function(e) {
  mouse_down_flg = 1;
  mouseX_sta = e.pageX;
  mouseY_sta = e.pageY;

  img.ondragstart = function() { return false; };

  img.onmouseup = function(e) {
    mouse_down_flg = 0;
    mouseX_end = e.pageX;
    mouseY_end = e.pageY;

    scrollBy(mouseX_sta - mouseX_end, mouseY_sta - mouseY_end);
  }
}

img.onmousemove = function(e) {
  pos_txt.textContent = "X: " + String(Math.floor(e.pageX / size)) + " Y: " + String(Math.floor(e.pageY / size));

  var getImageData = canvas.getContext("2d").getImageData(Math.floor(e.pageX / size), Math.floor(e.pageY / size), 1, 1);
  var R = getImageData.data[0]
  var G = getImageData.data[1]
  var B = getImageData.data[2]
  col_txt.textContent = "R: " + String(R) + " G: " + String(G) + " B: " + String(B);
}