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
          // Decode token to get user role
          const tokenData = parseJwt(res.data);
          localStorage.setItem("role", tokenData.roleName);
          $(location).attr("href", "/department");
        }
      },
    });
  });
}

// Helper function to decode JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return {};
  }
}

