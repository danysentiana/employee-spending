

$(".current-year").html(new Date().getFullYear());



function isIdle(){
  var idleState = false;
  var idleTimer = null;
  $("*").bind("mousemove click mouseup mousedown keydown keypress keyup submit change mouseenter scroll resize dblclick load", function () {
    clearTimeout(idleTimer);
    if (idleState == false) {
      idleTimer = setTimeout(function () {
        $("#modal-token-expired").modal("show");
        localStorage.removeItem("token");
        $("#button-token-expired").click(function () {
          localStorage.removeItem("token");
          location.reload();
          idleState = true;
        });
      }, 3600000);
      // }, 5000); //5 detik
    }
  });
}

function menus() {
  showLoading();
  var statuz = localStorage.setItem("statuz", "");
}

var target = $("#target");

function showPreload() {
  target.append('<div id="preloader">' + '    <div id="status">' + '        <div class="bouncing-loader">' + "            <div></div>" + "            <div></div>" + "            <div></div>" + "        </div>" + "    </div>" + "</div>");
}

function hidePreload() {
  const element = document.getElementById("preloader");
  element.remove();
}

function showLoading() {
  target.loadingOverlay();
}

function hideLoading() {
  if (target.hasClass("loading")) {
    target.loadingOverlay("remove");
  }
}

var status = localStorage.getItem("status");
if (status !== "null") {
  swal("Sukses", status, "success");
  localStorage.removeItem("status");
}

var statuz = localStorage.getItem("statuz");
if (statuz !== "null") {
  localStorage.removeItem("statuz");
}

function logOut() {
  localStorage.removeItem("token");
  $(location).attr("href", "/");
}

function loadingButtonStart(id) {
  document.getElementById(id).setAttribute("disabled", true);
  $("#" + id).html('<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Loading...');
}

function loadingButtonEnd(id, label) {
  document.getElementById(id).removeAttribute("disabled");
  $("#" + id).html(label);
}


