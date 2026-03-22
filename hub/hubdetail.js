// Hub data for each city
const hubs = {
  "Ahmedabad": [
    {
      img: "../images/amd.jpg",
      title: "ridebazzar Park, Ahmedabad",
      address: "F.P.98,102 Spinny Park, Swarnim Stone, Near Fun Blast, Chharodi, Gota to Vaishnodevi Road, Ahmedabad-382481",
      open: "10am - 8pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    }
  ],
  "Bangalore": [
    {
      img: "../images/banglore1.webp",
      title: "ridebazzar, Whitefield",
      address: "Whitefield Main Road, Bangalore - 560066",
      open: "9am - 8pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    },
    {
      img: "../images/banglore2.jpg",
      title: "ridebazzar Hub, Koramangala",
      address: "Koramangala 5th Block, Bangalore - 560095",
      open: "10am - 7pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    }
  ],
  "Chandigarh": [
    {
      img: "../images/chandigarh1.avif",
      title: "ridebazzar Hub, Whitefield",
      address: "Whitefield Main Road, Chandigarh - 560066",
      open: "9am - 8pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    },
    {
      img: "../images/chandigarh2.jpg",
      title: "ridebazzar Hub, Koramangala",
      address: "Koramangala 5th Block, Chandigarh - 560095",
      open: "10am - 7pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    }
  ],
  "Delhi": [
     {
      img: "../images/delhi1.avif",
      title: "ridebazzar Hub, Whitefield",
      address: "Whitefield Main Road, Delhi - 560066",
      open: "9am - 8pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    },
    {
      img: "../images/delhi2.jpg",
      title: "ridebazzar Hub, Koramangala",
      address: "Koramangala 5th Block, Delhi - 560095",
      open: "10am - 7pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    }
  ],
  "Hyderabad":[
 {
      img: "../images/Hyderabad1.webp",
      title: "ridebazzar Hub, Whitefield",
      address: "Whitefield Main Road, Hyderabad - 560066",
      open: "9am - 8pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    },
    {
      img: "../images/Hyderabad2.avif",
      title: "ridebazzar Hub, Koramangala",
      address: "Koramangala 5th Block, Hyderabad - 560095",
      open: "10am - 7pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    }
  ],
  "Mumbai": [
    {
      img: "../images/mumbai1.avif",
      title: "ridebazzar Hub, Whitefield",
      address: "Whitefield Main Road, Mumbai - 560066",
      open: "9am - 8pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    },
    {
      img: "../images/mumbai2.avif",
      title: "ridebazzar Hub, Koramangala",
      address: "Koramangala 5th Block, Mumbai - 560095",
      open: "10am - 7pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    },
    {
      img: "../images/mumbai3.avif",
      title: "ridebazzar Hub, Koramangala",
      address: "Koramangala 5th Block, Mumbai - 560095",
      open: "10am - 7pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    },
    {
      img: "../images/mumbai4.avif",
      title: "ridebazzar Hub, Koramangala",
      address: "Koramangala 5th Block, Mumbai - 560095",
      open: "10am - 7pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    }
  ],
  "Pune": [
    {
      img: "../images/pune.jpg",
      title: "ridebazzar Hub, Koramangala",
      address: "Koramangala 5th Block, Pune - 560095",
      open: "10am - 7pm (Mon - Sun)",
      link: "../all-cars.html",
      linkText: "View Hub Details"
    }
  ]
  
  // Add more cities and hubs as needed
};

// Show all hubs grouped by city
function showAllHubs() {
  const cardsDiv = document.querySelector('.hub-cards');
  const section = document.querySelector('.hub-cards-section');
  section.querySelector('h2').textContent = "All Car Hubs";
  cardsDiv.innerHTML = '';
  Object.keys(hubs).forEach(city => {
    const hubCount = hubs[city].length;
    cardsDiv.innerHTML += `<h3 style="margin:32px 0 12px 0; color:#3d0066; font-size:1.3rem; font-weight:700;">${hubCount} Car Hub${hubCount > 1 ? 's' : ''} in ${city}</h3>`;
    cardsDiv.innerHTML += `<div class="hub-city-cards" style="display:flex;flex-wrap:wrap;gap:24px;margin-bottom:24px;">${
      hubs[city].map(hub => `
        <div class="hub-card">
          <img src="${hub.img}" alt="${hub.title}">
          <div class="hub-card-content">
            <div class="hub-title">${hub.title}</div>
            <div class="hub-address"><strong>Full address:</strong> ${hub.address}</div>
            <div class="hub-open"><strong>Open:</strong> ${hub.open}</div>
            <a href="${hub.link}" class="hub-link">${hub.linkText}</a>
          </div>
        </div>
      `).join('')
    }</div>`;
  });
}

// Show hubs for a specific city
function showCityHubs(city, li) {
  const cardsDiv = document.querySelector('.hub-cards');
  const section = document.querySelector('.hub-cards-section');
  let count = li.querySelector('.hub-count') ? li.querySelector('.hub-count').textContent : '';
  section.querySelector('h2').textContent = count + " in " + city;
  cardsDiv.innerHTML = '';
  if (hubs[city]) {
    cardsDiv.innerHTML += `<div class="hub-city-cards" style="display:flex;flex-wrap:wrap;gap:24px;margin-bottom:24px;">${
      hubs[city].map(hub => `
        <div class="hub-card">
          <img src="${hub.img}" alt="${hub.title}">
          <div class="hub-card-content">
            <div class="hub-title">${hub.title}</div>
            <div class="hub-address"><strong>Full address:</strong> ${hub.address}</div>
            <div class="hub-open"><strong>Open:</strong> ${hub.open}</div>
            <a href="${hub.link}" class="hub-link">${hub.linkText}</a>
          </div>
        </div>
      `).join('')
    }</div>`;
  } else {
    cardsDiv.innerHTML = '<div style="padding:2rem;">No hubs found for this city.</div>';
  }
}

// Sidebar click event
document.querySelectorAll('.hub-location-list li').forEach(li => {
  li.addEventListener('click', function() {
    document.querySelectorAll('.hub-location-list li').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    if (this.id === "show-all-hubs") {
      showAllHubs();
    } else {
      const city = this.childNodes[0].nodeValue.trim();
      showCityHubs(city, this);
    }
  });
});

// On page load, show all hubs
showAllHubs();

window.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city');
  if (city && hubs[city]) {
    document.querySelectorAll('.hub-location-list li').forEach(li => {
      if (li.textContent.trim().toLowerCase().startsWith(city.toLowerCase())) {
        li.click();
      }
    });
  } else {
    showAllHubs();
  }
});
