
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(
    "#home, #about, #skills, #projects, #contact"
);

let isClicking = false;
let scrollTimeout = null;

function setActiveLink(id) {
    navLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
}

// Update active link immediately when clicked, and temporarily lock out the observer
navLinks.forEach(link => {
    link.addEventListener("click", () => {
        const targetId = link.getAttribute("href").replace("#", "");

        isClicking = true;
        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");

        // Release the lock after the smooth scroll completes
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isClicking = false;
        }, 800); // 800ms gives ample time for smooth scroll to settle
    });
});

// Update active link while scrolling (only when user manually scrolls)
const observer = new IntersectionObserver(
    entries => {
        if (isClicking) return; // Do not fight the click animation

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveLink(entry.target.id);
            }
        });
    },
    {
        // -20% from top accounts for navbar height, -50% prevents premature trigger
        rootMargin: "-20% 0px -50% 0px",
        threshold: 0.1
    }
);

sections.forEach(section => observer.observe(section));
// 1. Keep track of previous scroll position before reloading
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('scrollPosOnRefresh', window.scrollY.toString());
});

// 2. On reload, hold position briefly and smoothly glide to home
window.addEventListener('DOMContentLoaded', () => {
    const savedPos = sessionStorage.getItem('scrollPosOnRefresh');

    // Clean hash from URL so the browser doesn't force an instant jump
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
    }

    // Set Home nav link active
    const navLinks = document.querySelectorAll('.nav-link');
    const homeLink = document.querySelector('.nav-link[href="#home"]') || navLinks[0];
    if (homeLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        homeLink.classList.add('active');
    }

    // If the user refreshed while scrolled down, animate smoothly back to top
    if (savedPos && parseInt(savedPos, 10) > 100) {
        // First restore where they were without animation
        window.scrollTo(0, parseInt(savedPos, 10));

        // Wait 150ms for layout to settle, then glide smoothly to #home
        setTimeout(() => {
            const homeSection = document.getElementById('home') || document.body;
            homeSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Clean up storage so regular site navigations aren't affected
            sessionStorage.removeItem('scrollPosOnRefresh');
        }, 150);
    }
});

document.addEventListener('DOMContentLoaded', () => {
  initResumeModal();
  initCertModal();
});

function initResumeModal() {
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtns = document.querySelectorAll('.open-resume-modal-btn');
  const closeResumeBtn = document.getElementById('close-resume-modal-btn');
  const closeResumeBottomBtn = document.getElementById('close-resume-bottom-btn');

  // Open modal when any resume button is clicked
  openResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(resumeModal);
    });
  });

  // Close via top-right 'X' button
  closeResumeBtn?.addEventListener('click', () => {
    closeModal(resumeModal);
  });

  // Close via bottom 'Close' button
  closeResumeBottomBtn?.addEventListener('click', () => {
    closeModal(resumeModal);
  });

  // Close when clicking outside the dialog on the backdrop
  resumeModal?.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      closeModal(resumeModal);
    }
  });

  // Close when pressing the 'Escape' key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
      closeModal(resumeModal);
    }
  });
}

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('active');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('active');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

//CERTIFICATES MODAL (DYNAMIC)//

function initCertModal() {
  const certModal = document.getElementById('cert-modal');
  const openCertBtns = document.querySelectorAll('.open-cert-modal-btn');
  const closeCertBtn = document.getElementById('close-cert-modal-btn');
  const closeCertBottomBtn = document.getElementById('close-cert-bottom-btn');

  const certTitleEl = document.getElementById('cert-modal-title');
  const certFrame = document.getElementById('cert-frame');
  const certDownloadBtn = document.getElementById('cert-download-btn');
  const certFallbackLink = document.getElementById('cert-fallback-link');

  openCertBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const title = btn.getAttribute('data-title') || 'Certificate Preview';
      const fileSrc = btn.getAttribute('data-src') || '';

      // Update modal title, iframe src, and download link dynamically
      if (certTitleEl) certTitleEl.textContent = title;
      if (certFrame) certFrame.src = fileSrc ? `${fileSrc}#toolbar=0&navpanes=0` : '';
      if (certDownloadBtn) {
        certDownloadBtn.href = fileSrc;
        certDownloadBtn.setAttribute('download', fileSrc.split('/').pop());
      }
      if (certFallbackLink) certFallbackLink.href = fileSrc;

      openModal(certModal);
    });
  });

  closeCertBtn?.addEventListener('click', () => closeCertModal(certModal, certFrame));
  closeCertBottomBtn?.addEventListener('click', () => closeCertModal(certModal, certFrame));

  certModal?.addEventListener('click', (e) => {
    if (e.target === certModal) closeCertModal(certModal, certFrame);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('active')) {
      closeCertModal(certModal, certFrame);
    }
  });
}

function closeCertModal(modalEl, iframeEl) {
  closeModal(modalEl);
  // Clear the src after closing to stop background loading
  if (iframeEl) iframeEl.src = '';
}

/* ========================================================
   SHARED MODAL UTILITIES
   ======================================================== */
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('active');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('active');
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ========================================================
   CONTACT FORM & EMAIL DISPATCH
   ======================================================== */
if (typeof emailjs !== 'undefined') {
  emailjs.init({
    publicKey: "5nqH9c8tYghkAEe7j",
  });
} else {
  console.error("EmailJS SDK failed to load. Ensure the script tag is included in HTML.");
}

const contactForm = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const formToast = document.getElementById("form-toast");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const btnText = submitBtn ? submitBtn.querySelector("span") : null;
    const originalText = btnText ? btnText.textContent : "SEND MESSAGE";
    if (btnText) btnText.textContent = "SENDING...";
    if (submitBtn) submitBtn.disabled = true;

    emailjs
      .sendForm("service_fi4qpbb", "template_2pvwiei", contactForm)
      .then(() => {
        if (formToast) {
          formToast.classList.remove("hidden");
          setTimeout(() => {
            formToast.classList.add("hidden");
          }, 5000);
        }
        contactForm.reset();
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        alert("Failed to send message: " + (error.text || JSON.stringify(error)));
      })
      .finally(() => {
        if (btnText) btnText.textContent = originalText;
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

// Project detail button //

const projectsData = {
  "rag-chatbot": {
    title: "AI-Powered RAG Chatbot",
    domain: "Natural Language Processing & Generative AI",
    description: "An enterprise-grade conversational AI pipeline built using Retrieval-Augmented Generation (RAG) to query complex documents with grounded citations and minimal hallucination.",
    features: [
      "Dynamic document ingestion, recursive chunking, and embedding generation via vector databases.",
      "Hybrid search combining semantic vector retrieval with keyword-based re-ranking.",
      "Context-aware response streaming with source attribution and link citations.",
      "Conversation session state tracking and guardrails to prevent hallucination."
    ],
    tech: ["Python", "LangChain", "Google Gemini API", "ChromaDB", "FastAPI", "RAG Architecture"],
    liveDemo: null,
    github: "https://github.com"
  },
  "accident-prevention": {
    title: "Vehicle Accident Prevention System",
    domain: "Embedded Systems / Computer Vision & IoT",
    description: "An automated multi-modal safety mechanism designed to detect driver drowsiness, lane drift, and obstacle proximity to trigger immediate physical warnings and speed mitigation.",
    features: [
      "Real-time facial landmark detection to identify microsleeps and eye closure duration.",
      "Ultrasonic and LiDAR proximity sensing for real-time obstacle collision estimation.",
      "Hardware-level relay integration for speed regulation and audible buzzer alerts.",
      "Automatic GPS-tagged emergency distress signal dispatch over GSM/telemetry networks."
    ],
    tech: ["Python", "IoT", "Arduino / Raspberry Pi", "MQ-3 Sensors", "Embedded Systems"],
    liveDemo: null, // Set to null if there's no live web demo
    github: "https://github.com"
  },
  "ai-finance-manager": {
    title: "AI Finance Manager",
    domain: "FinTech & Predictive AI",
    description: "An intelligent personal finance dashboard that automates expense categorization, anomaly detection, and predictive cash flow forecasting using fine-tuned machine learning models.",
    features: [
      "Automated bank statement parsing and zero-shot transaction classification.",
      "Predictive spending forecasts and monthly recurring expense anomaly detection.",
      "Natural language financial assistant for budget planning and investment insights.",
      "End-to-end data encryption and compliant tokenized credential storage."
    ],
    tech: ["AI", "HTML", "JavaScript", "Python", "FastAPI", "PostgreSQL", "CSS"],
    liveDemo: null,
    github: "https://github.com"
  },
  "ai-portfolio": {
    title: "AI-Integrated Developer Portfolio",
    domain: "Frontend & AI Development",
    description: "A modern, interactive developer portfolio featuring a custom RAG-powered chatbot to interactively showcase technical projects, experience, and certifications.",
    features: [
      "Custom conversational AI chatbot running context-aware queries about skills and background.",
      "Strict system prompt boundaries preventing leaks of sensitive personal information.",
      "Fully responsive, dark-mode-first aesthetic with smooth CSS transitions.",
      "Optimized asset loading and accessible modal dialogs."
    ],
    tech: ["HTML5", "CSS3", "JavaScript", "Python", "FastAPI", "Gemini API"],
    liveDemo: "https://rakesh.dev",
    github: "https://github.com/rakeshy06"
  }
};

function openProjectModal(projectId) {
  const project = projectsData[projectId];
  if (!project) {
    console.error(`Project data not found for ID: ${projectId}`);
    return;
  }

  // 1. Title & Domain
  document.getElementById('modal-project-title').textContent = project.title;
  document.getElementById('modal-project-domain').textContent = project.domain;

  // 2. Overview description
  document.getElementById('modal-project-desc').textContent = project.description;

  // 3. Key features / bullet list
  const featuresList = document.getElementById('modal-project-features');
  featuresList.innerHTML = '';
  if (project.features && project.features.length > 0) {
    project.features.forEach(feat => {
      const li = document.createElement('li');
      li.textContent = feat;
      featuresList.appendChild(li);
    });
    document.getElementById('modal-highlights-container').style.display = 'block';
  } else {
    document.getElementById('modal-highlights-container').style.display = 'none';
  }

  // 4. Technology Badges
  const techContainer = document.getElementById('modal-project-tags');
  techContainer.innerHTML = '';
  project.tech.forEach(item => {
    const badge = document.createElement('span');
    badge.textContent = item;
    techContainer.appendChild(badge);
  });

  // 5. Links (Hide buttons if URL doesn't exist)
  const liveBtn = document.getElementById('modal-live-btn');
  const githubBtn = document.getElementById('modal-github-btn');

  if (project.liveDemo) {
    liveBtn.href = project.liveDemo;
    liveBtn.style.display = 'inline-flex';
  } else {
    liveBtn.style.display = 'none';
  }

  if (project.github) {
    githubBtn.href = project.github;
    githubBtn.style.display = 'inline-flex';
  } else {
    githubBtn.style.display = 'none';
  }

  // 6. Show modal
  const backdrop = document.getElementById('project-modal');
  backdrop.classList.add('active');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const backdrop = document.getElementById('project-modal');
  backdrop.classList.remove('active');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}