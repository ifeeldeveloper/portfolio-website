// This script manages the rotating hero roles and active nav states.

const root = document.documentElement;
const navLinks = document.querySelectorAll('.nav-link');
const navCollapse = document.getElementById('mainNavbar');
const mobileOffcanvas = document.getElementById('mobileSidebarNav');
const rotatingWords = Array.from(document.querySelectorAll('.role-word'));
const backToTopButton = document.querySelector('.back-to-top');

function rotateRoleWords() {
  if (!rotatingWords.length) return;

  let index = 0;

  setInterval(() => {
    rotatingWords.forEach((word, wordIndex) => {
      word.classList.toggle('is-visible', wordIndex === index);
    });

    index = (index + 1) % rotatingWords.length;
  }, 2200);
}

function setActiveLink(targetId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${targetId}`;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function closeMobileMenuOnLinkClick(callback) {
  if (mobileOffcanvas && window.bootstrap?.Offcanvas) {
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(mobileOffcanvas);
    if (offcanvasInstance) {
      offcanvasInstance.hide();
    }
  }

  if (navCollapse) {
    navCollapse.classList.remove('show');
    const navToggle = document.querySelector('.navbar-toggler');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (typeof callback === 'function') {
    setTimeout(callback, 180);
  }
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      event.preventDefault();
      const targetId = href.substring(1);
      setActiveLink(targetId);
      closeMobileMenuOnLinkClick(() => {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  });
});

const sections = document.querySelectorAll('main section[id]');
const observer = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry) return;

    const id = visibleEntry.target.getAttribute('id');
    if (id) {
      setActiveLink(id);
    }
  },
  {
    rootMargin: '-20% 0px -55% 0px',
    threshold: [0.2, 0.4, 0.6],
  }
);

sections.forEach((section) => observer.observe(section));

if (backToTopButton) {
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

root.setAttribute('data-theme', 'dark');
rotateRoleWords();

const CONTACT_API_URL = '/api/contact';

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const requiredFields = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.setAttribute('aria-invalid', 'true');
        isValid = false;
      } else {
        field.setAttribute('aria-invalid', 'false');
      }
    });

    if (!isValid) {
      const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    const payload = {
      name: contactForm.querySelector('#name')?.value?.trim() || '',
      email: contactForm.querySelector('#email')?.value?.trim() || '',
      enquiryType: contactForm.querySelector('#enquiry-type')?.value || '',
      message: contactForm.querySelector('#message')?.value?.trim() || '',
    };

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Apps Script response:', response.status, responseText);

      let result = null;
      try {
        result = JSON.parse(responseText);
      } catch (error) {
        result = { status: 'error', message: responseText || 'Unknown server error' };
      }

      if (response.ok && result.status === 'success') {
        alert('Your message has been sent successfully.');
        contactForm.reset();
      } else {
        const message = result.message || responseText || 'Something went wrong while sending your message.';
        alert(message);
      }
    } catch (error) {
      console.error('Contact form submit failed:', error);
      alert('Something went wrong. Please try again.');
    }
  });
}
