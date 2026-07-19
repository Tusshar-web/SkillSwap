// Learnova Landing Page Actions

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject global navbar
  const navContainer = document.getElementById("navbar-container");
  if (navContainer) {
    navContainer.innerHTML = getGlobalNavbarHTML("landing");
    // Re-initialize navbar interactive parts
    setupDropdowns();
  }

  // 2. Animate Stats Counters on Scroll
  const statNumbers = document.querySelectorAll(".stat-number");
  
  const countUp = (element) => {
    const target = parseFloat(element.getAttribute("data-target"));
    const isDecimal = element.getAttribute("data-decimal") === "true";
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      
      let currentValue = easeProgress * target;
      
      if (isDecimal) {
        element.textContent = currentValue.toFixed(1);
      } else {
        element.textContent = Math.floor(currentValue).toLocaleString() + "+";
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        if (isDecimal) {
          element.textContent = target.toFixed(1);
        } else {
          element.textContent = target.toLocaleString() + "+";
        }
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(num => countUp(num));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // 3. Testimonial Carousel Auto-Slider
  const track = document.getElementById("testimonials-track");
  const dots = document.querySelectorAll("#carousel-dots .dot");
  
  if (track && dots.length > 0) {
    let activeIndex = 0;
    const slideCount = dots.length;
    let autoSlideInterval;
    
    const updateCarousel = (index) => {
      activeIndex = index;
      
      // Calculate responsive card width adjustments
      let percentage = 0;
      if (window.innerWidth <= 640) {
        percentage = 100; // 1 slide at a time
      } else if (window.innerWidth <= 1024) {
        percentage = 50; // 2 slides at a time
      } else {
        percentage = 33.333; // 3 slides at a time
      }
      
      const offset = -index * (percentage === 100 ? 100 : percentage === 50 ? 52 : 34);
      // Wait, let's keep it simple: we can translate based on dots:
      // slide 1: offset = 0
      // slide 2: offset = -33.33% (or -100% on mobile)
      // Since it's CSS flex gap, translating by card-width + gap works perfectly.
      // Let's use index multiplied by offset percentages.
      const multiplier = window.innerWidth <= 640 ? 100 : window.innerWidth <= 1024 ? 50 : 33.33;
      track.style.transform = `translateX(-${index * multiplier}%)`;
      
      dots.forEach((dot, idx) => {
        if (idx === index) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    };
    
    const startAutoSlide = () => {
      autoSlideInterval = setInterval(() => {
        let nextIndex = (activeIndex + 1) % (window.innerWidth <= 640 ? 3 : window.innerWidth <= 1024 ? 2 : 1);
        // Wait, if 3 cards are visible on desktop, we don't need to slide!
        // Number of max sliding index is: 
        // Desktop (3 visible): max index = 0 (no sliding needed)
        // Tablet (2 visible, 3 total): max index = 1
        // Mobile (1 visible, 3 total): max index = 2
        let maxIndex = 0;
        if (window.innerWidth <= 640) maxIndex = 2;
        else if (window.innerWidth <= 1024) maxIndex = 1;
        
        if (maxIndex > 0) {
          nextIndex = (activeIndex + 1) > maxIndex ? 0 : activeIndex + 1;
          updateCarousel(nextIndex);
        }
      }, 4000);
    };
    
    const stopAutoSlide = () => {
      clearInterval(autoSlideInterval);
    };
    
    // Dot click triggers
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        stopAutoSlide();
        updateCarousel(index);
        startAutoSlide();
      });
    });
    
    // Start auto slide
    startAutoSlide();
    
    // Reset layout on resize
    window.addEventListener("resize", () => {
      updateCarousel(0);
    });
  }
});
