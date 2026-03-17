$(document).ready(function () {

  getSideBar();
  isIdle();
  initThemeToggle();

  if (typeof(Storage) !== "undefined") {
    var token = localStorage.getItem("token");
    if (token === '' || token === null) {
        $(location).attr('href', "/");
    }

    const userData = parseJwt(token);
    if (userData.fullname) {
      const initials = getInitials(userData.fullname);
      const avatar = createAvatar(initials);
      // Ganti avatar di header, asumsikan elemennya memiliki ID #profile-avatar
      $('#profile-avatar').replaceWith(avatar);
    }
    
  }

  //solution when search on select2 modal not working
  $('select:not(.normal)').each(function () {
    $(this).select2({
        dropdownParent: $(this).parent()
    });
  });
});

function initThemeToggle() {
  var $toggle = $('#light-dark-mode');
  if (!$toggle.length) {
    return;
  }

  var initialIcon = $toggle.find('i').first();
  if (initialIcon.length) {
    var initialTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
    initialIcon.removeClass('ri-moon-line ri-sun-line');
    initialIcon.addClass(initialTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line');
  }

  $toggle.off('click.themeToggle').on('click.themeToggle', function (event) {
    event.preventDefault();

    var htmlElement = document.documentElement;
    var currentTheme = htmlElement.getAttribute('data-bs-theme') || 'light';
    var nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    htmlElement.setAttribute('data-bs-theme', nextTheme);

    if (window.config && typeof window.config === 'object') {
      window.config.theme = nextTheme;
      try {
        sessionStorage.setItem('__HYPER_CONFIG__', JSON.stringify(window.config));
      } catch (error) {
        console.warn('Unable to persist theme configuration', error);
      }
    }

    var icon = $toggle.find('i').first();
    if (icon.length) {
      icon.removeClass('ri-moon-line ri-sun-line');
      icon.addClass(nextTheme === 'dark' ? 'ri-sun-line' : 'ri-moon-line');
    }
  });
}

function getSideBar() {
  const menuItems = [
    { 
      name: 'Departemen', 
      url: '/department',
      icon: 'ri-building-line'
    },
    { 
      name: 'Karyawan', 
      url: '/employee',
      icon: 'ri-user-line'
    },
    { 
      name: 'Pengeluaran', 
      url: '/spending',
      icon: 'ri-money-dollar-circle-line'
    },
    { 
      name: 'Laporan', 
      url: '/report',
      icon: 'ri-file-chart-line'
    }
  ];

  let menuHtml = '';
  const currentPath = window.location.pathname;

  menuItems.forEach(item => {
    const isActive = currentPath.startsWith(item.url) ? 'active' : '';
    menuHtml += `
      <li class="nav-item">
        <a class="nav-link ${isActive}" href="${item.url}">
          <i class="${item.icon} align-middle me-2"></i>
          <span class="align-middle">${item.name}</span>
        </a>
      </li>
    `;
  });

  $('#sidebarOK').html(menuHtml);
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function getInitials(name) {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function createAvatar(initials) {
  const avatar = document.createElement('div');
  avatar.id = 'profile-avatar';
  avatar.className = 'rounded-circle';
  avatar.style.width = '36px';
  avatar.style.height = '36px';
  avatar.style.backgroundColor = '#fff'; // Warna latar belakang avatar
  avatar.style.color = '#295F99'; // Warna teks inisial
  avatar.style.display = 'flex';
  avatar.style.alignItems = 'center';
  avatar.style.justifyContent = 'center';
  avatar.style.fontSize = '14px';
  avatar.style.fontWeight = 'bold';
  avatar.textContent = initials;
  return avatar;
}
