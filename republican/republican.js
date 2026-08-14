/* ===== THE REPUBLICAN SPECTRUM — Natalie & Darren ===== */

(function () {
  'use strict';

  // --- Fade-In on Scroll ---
  const faders = document.querySelectorAll('.fade-trigger');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve — let them stay visible
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  faders.forEach((el) => observer.observe(el));

  // Force visible on anything already in view
  setTimeout(() => {
    faders.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add('visible');
      }
    });
  }, 100);

  // --- Mobile Nav Toggle ---
  const toggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = toggleBtn.querySelector('i');
      if (navLinks.classList.contains('open')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });

    // Close nav on link click
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }

  // --- Smooth scroll for nav links (fallback) ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80; // nav height + padding
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Kind card stagger animation ---
  const kindCards = document.querySelectorAll('.kind-card');
  kindCards.forEach((card, i) => {
    card.style.transitionDelay = `${(i % 5) * 0.06}s`;
  });

  console.log('🇺🇸 The Republican Spectrum — loaded');
})();
