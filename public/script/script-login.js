$(document).ready(function () {
  if (typeof Storage !== "undefined") {
    var isi = localStorage.getItem("token");
    if (isi === "" || isi === null) {
        
    } else {
    $(location).attr("href", "/department");
    }
}
  login();
});

function showPassword() {
  var x = document.getElementById("login_password");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

function loadingButtonStart(id) {
  document.getElementById(id).setAttribute("disabled", true);
  $("#" + id).html('<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Loading...');
}

function loadingButtonEnd(id, label) {
  document.getElementById(id).removeAttribute("disabled");
  $("#" + id).html(label);
}

function login() {
  $("#form_login").submit(function (e) {
    loadingButtonStart("login_button");
    e.preventDefault();
    $.ajax({
      url: "/",
      type: "POST",
      data: new FormData(this),
      contentType: false,
      cache: false,
      processData: false,
      success: function (res) {
        if (res.status === "nok") {
          Swal.fire({
            title: "Failed!",
            text: res.message,
            confirmButtonColor: "#3085d6",
            icon: "error"
          });
          loadingButtonEnd("login_button", "Log In");
        } else {
          localStorage.setItem("statuz", "Sukses");
          localStorage.setItem("token", res.data);
          $(location).attr("href", "/department");
        }
      },
    });
  });
}

