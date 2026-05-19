document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Scroll Effects ---
  const header = document.querySelector('header');
  const menuBtn = document.getElementById('menu-btn');
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.navbar ul li a');
  const scrollTopBtn = document.getElementById('scroll-top');
  
  // Toggle Mobile Menu
  if (menuBtn && navbar) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('fa-times');
      navbar.classList.toggle('active');
    });
  }

  // Close Mobile Menu on Link Click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuBtn && navbar) {
        menuBtn.classList.remove('fa-times');
        navbar.classList.remove('active');
      }
    });
  });

  // Scroll Event listener
  window.addEventListener('scroll', () => {
    // Header shadow on scroll
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Top Button visibility
    if (window.scrollY > 200) {
      scrollTopBtn.classList.add('active');
    } else {
      scrollTopBtn.classList.remove('active');
    }

    // Scroll spy: Active link highlights
    let fromTop = window.scrollY + 150;
    document.querySelectorAll('section').forEach(section => {
      let id = section.getAttribute('id');
      let top = section.offsetTop;
      let height = section.offsetHeight;

      if (fromTop >= top && fromTop < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // --- Theme Toggle (Dark/Light Mode) ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn.querySelector('i');
  
  // Check local storage for theme preference
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.className = 'fas fa-moon';
  } else {
    document.body.classList.remove('light-mode');
    themeIcon.className = 'fas fa-sun';
  }

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    
    // Save selection
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
    themeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';

    // Update Particles.js colors if it exists
    updateParticlesTheme(isLight);
  });

  // --- Typed JS Effect ---
  if (typeof Typed !== 'undefined') {
    new Typed(".typing-text", {
      strings: ["frontend development", "backend development", "web designing", "web development"],
      loop: true,
      typeSpeed: 50,
      backSpeed: 25,
      backDelay: 1000,
    });
  }

  // Initialize mouse spotlight glow on load for static cards
  initGlowEffect();

  // --- ScrollReveal Scroll Animations ---
  let sr;
  if (typeof ScrollReveal !== 'undefined') {
    sr = ScrollReveal({
      origin: 'top',
      distance: '60px',
      duration: 1000,
      delay: 200,
      reset: false
    });

    // Reveal Hero static elements
    sr.reveal('.home-content', { origin: 'left', distance: '80px' });
    sr.reveal('.home-image-container', { origin: 'right', distance: '80px', delay: 350 });

    // Reveal Section Titles
    sr.reveal('.section-title', { delay: 100 });

    // About section elements
    sr.reveal('.about-img', { origin: 'left', delay: 150 });
    sr.reveal('.about-info', { origin: 'right', delay: 250 });

    // Timeline elements
    sr.reveal('.timeline-item', { interval: 150 });

    // Education elements
    sr.reveal('.edu-card', { interval: 100 });

    // Contact elements
    sr.reveal('.contact-card', { interval: 100 });
    sr.reveal('.contact-form-wrapper', { delay: 200 });
  }

  // --- Data Fetching (Skills & Projects) ---
  let allProjects = [];

  // Fetch Skills
  fetchData('skills.json')
    .then(skills => {
      renderSkills(skills);
    })
    .catch(err => console.error('Error loading skills:', err));

  // Fetch Projects
  fetchData('./projects/projects.json')
    .then(projects => {
      allProjects = projects;
      renderProjects(projects);
      setupProjectsFilter();
    })
    .catch(err => console.error('Error loading projects:', err));

  async function fetchData(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  }

  // Render Skills
  function renderSkills(skills) {
    const container = document.getElementById('skillsContainer');
    if (!container) return;

    // Filter skills into categories
    const frontend = skills.filter(s => s.category === 'frontend');
    const backend = skills.filter(s => s.category === 'backend' || s.category === 'framework');
    const database = skills.filter(s => s.category === 'database');
    const tools = skills.filter(s => s.category === 'tools');

    const categories = [
      { name: 'Frontend Development', icon: 'fas fa-laptop-code', data: frontend },
      { name: 'Backend & Frameworks', icon: 'fas fa-server', data: backend },
      { name: 'Databases & Servers', icon: 'fas fa-database', data: database },
      { name: 'Tools & Utilities', icon: 'fas fa-tools', data: tools }
    ];

    container.className = 'skills-categories-grid';
    container.innerHTML = categories.map(cat => `
      <div class="skills-category-card glass-card">
        <h3><i class="${cat.icon}"></i> ${cat.name}</h3>
        <div class="skills-mini-grid">
          ${cat.data.map(skill => `
            <div class="skill-card-inner">
              <img src="${skill.icon}" alt="${skill.name}" loading="lazy" onerror="this.src='https://img.icons8.com/color/48/code.png'">
              <span>${skill.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Reinitialize glow effect for new dynamic category cards
    initGlowEffect();

    if (sr) {
      // 3D Entrance for Category Cards
      sr.reveal('.skills-category-card', { 
        interval: 150,
        rotate: { x: 15, y: 15, z: 0 },
        scale: 0.85,
        duration: 1200,
        origin: 'top',
        distance: '60px'
      });
      
      // Staggered fade-up for inner skill badges
      sr.reveal('.skill-card-inner', {
        interval: 35,
        delay: 350,
        scale: 0.9,
        duration: 800,
        origin: 'bottom',
        distance: '20px'
      });
    }
  }

  // Render Projects
  function renderProjects(projects) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No projects found in this category.</div>`;
      return;
    }

    container.innerHTML = projects.map(project => {
      // Handle project category labels
      let categoryLabel = 'Project';
      if (project.category === 'lamp') categoryLabel = 'LAMP Stack';
      else if (project.category === 'laravel') categoryLabel = 'Laravel';
      else if (project.category === 'basicweb') categoryLabel = 'Basic Web';

      // Fallback for image
      const imagePath = `./assets/images/projects/${project.image}.jpg`;

      return `
        <div class="project-card glass-card" data-category="${project.category}">
          <div class="project-img-wrapper">
            <img src="${imagePath}" alt="${project.name}" loading="lazy" onerror="this.src='./assets/images/lapy.jpg'">
            <div class="project-overlay">
              <a href="${project.links.view}" class="project-overlay-link" target="_blank" title="Live View" aria-label="Live Demo"><i class="fas fa-eye"></i></a>
              <a href="${project.links.code}" class="project-overlay-link" target="_blank" title="Code Repo" aria-label="GitHub Repository"><i class="fas fa-code"></i></a>
            </div>
          </div>
          <div class="project-info">
            <span class="project-tag">${categoryLabel}</span>
            <h3>${project.name}</h3>
            <p>${project.desc}</p>
            <div class="project-actions">
              <a href="${project.links.view}" class="project-btn view" target="_blank"><i class="fas fa-eye"></i> Demo</a>
              <a href="${project.links.code}" class="project-btn code" target="_blank"><i class="fab fa-github"></i> Code</a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Reinitialize Tilt Effect
    if (typeof VanillaTilt !== 'undefined') {
      VanillaTilt.init(document.querySelectorAll(".project-card"), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
      });
    }

    // Reinitialize glow effect for dynamic project cards
    initGlowEffect();

    if (sr) {
      sr.reveal('.project-card', { interval: 100 });
    }
  }

  // Set up projects category filter
  function setupProjectsFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active class
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');
        if (category === 'all') {
          renderProjects(allProjects);
        } else {
          const filtered = allProjects.filter(p => p.category === category);
          renderProjects(filtered);
        }
      });
    });
  }

  // --- Contact Form Submission (EmailJS) ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Feedback UI
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

      // Check if emailjs is loaded
      if (typeof emailjs !== 'undefined') {
        emailjs.init("user_TTDmetQLYgWCLzHTDgqxm");
        emailjs.sendForm('contact_service', 'template_contact', '#contact-form')
          .then(() => {
            alert("Message Sent Successfully! 🚀");
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, (error) => {
            console.error('EmailJS Error:', error);
            alert("Submission Failed. Please try again or email directly.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          });
      } else {
        // Fallback simulation
        setTimeout(() => {
          alert("Simulation: Message Sent Successfully! (EmailJS script failed to load)");
          contactForm.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }, 1500);
      }
    });
  }

  // --- Visibility Change Title Alert ---
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === "visible") {
      document.title = "Portfolio | Ebin Benny";
      document.getElementById("favicon").setAttribute("href", "./assets/images/favicon.png");
    } else {
      document.title = "Come Back To Portfolio";
      document.getElementById("favicon").setAttribute("href", "./assets/images/favhand.png");
    }
  });

  // --- Spotlight Glow Effect initialization ---
  function initGlowEffect() {
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
      if (card.dataset.glowInitialized === 'true') return;
      card.dataset.glowInitialized = 'true';
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // Helper to update Particles JS colors dynamically
  function updateParticlesTheme(isLight) {
    if (window.pJSDom && window.pJSDom.length > 0) {
      const pJS = window.pJSDom[0].pJS;
      const color = isLight ? "#6d28d9" : "#8b5cf6";
      pJS.particles.color.value = color;
      pJS.particles.line_linked.color = color;
      pJS.fn.particlesRefresh();
    }
  }
});
