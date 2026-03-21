const slides = document.querySelectorAll('.slide');
    let current = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) slide.classList.add('active');
      });
    }

    setInterval(() => {
      current = (current + 1) % slides.length;
      showSlide(current);
    }, 3000);
window.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city');
  if (city && hubs[city]) {
    // Find the sidebar li for this city and simulate a click
    document.querySelectorAll('.hub-location-list li').forEach(li => {
      if (li.textContent.trim().startsWith(city)) {
        li.click();
      }
    });
  } else {
    showAllHubs();
  }
});