// ui.js - UI Interactions and Animations
class UIManager {
  constructor() {
    this.initMobileMenu();
    this.initSmoothScroll();
    this.initAnimations();
    this.initFormValidation();
  }

  initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const authButtons = document.querySelector(".auth-buttons");

    if (menuToggle) {
      menuToggle.addEventListener("click", () => {
        const isExpanded = navLinks.style.display === "flex";

        if (isExpanded) {
          navLinks.style.display = "none";
          if (authButtons) authButtons.style.display = "none";
          menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        } else {
          navLinks.style.display = "flex";
          navLinks.style.flexDirection = "column";
          navLinks.style.position = "absolute";
          navLinks.style.top = "100%";
          navLinks.style.left = "0";
          navLinks.style.right = "0";
          navLinks.style.background = "white";
          navLinks.style.padding = "1rem";
          navLinks.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";

          if (authButtons) {
            authButtons.style.display = "flex";
            authButtons.style.flexDirection = "column";
            authButtons.style.marginTop = "1rem";
          }

          menuToggle.innerHTML = '<i class="fas fa-times"></i>';
        }
      });
    }

    // Close menu when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 768 &&
        !e.target.closest(".nav-container") &&
        navLinks.style.display === "flex"
      ) {
        navLinks.style.display = "none";
        if (authButtons) authButtons.style.display = "none";
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  }

  initSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    });
  }

  initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll(".service-card, .feature-card").forEach((el) => {
      observer.observe(el);
    });

    // Add CSS for animations
    const style = document.createElement("style");
    style.textContent = `
            .service-card, .feature-card {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            
            .service-card.animate-in,
            .feature-card.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
        `;
    document.head.appendChild(style);
  }

  initFormValidation() {
    // Real-time form validation
    const phoneInput = document.getElementById("customerPhone");
    const emailInput = document.getElementById("customerEmail");

    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        this.formatPhoneNumber(e.target);
      });
    }

    if (emailInput) {
      emailInput.addEventListener("blur", (e) => {
        this.validateEmail(e.target);
      });
    }
  }

  formatPhoneNumber(input) {
    // Remove all non-digits
    let value = input.value.replace(/\D/g, "");

    // Format as 072 123 4567
    if (value.length > 0) {
      value = value.substring(0, 10);
      if (value.length > 6) {
        value =
          value.substring(0, 3) +
          " " +
          value.substring(3, 6) +
          " " +
          value.substring(6);
      } else if (value.length > 3) {
        value = value.substring(0, 3) + " " + value.substring(3);
      }
    }

    input.value = value;
  }

  validateEmail(input) {
    const email = input.value.trim();
    if (!email) return true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
      this.showInputError(input, "Please enter a valid email address");
      return false;
    } else {
      this.clearInputError(input);
      return true;
    }
  }

  showInputError(input, message) {
    this.clearInputError(input);

    const error = document.createElement("div");
    error.className = "input-error";
    error.textContent = message;
    error.style.color = "#e17055";
    error.style.fontSize = "0.875rem";
    error.style.marginTop = "0.25rem";

    input.parentNode.appendChild(error);
    input.style.borderColor = "#e17055";
  }

  clearInputError(input) {
    const existingError = input.parentNode.querySelector(".input-error");
    if (existingError) {
      existingError.remove();
    }
    input.style.borderColor = "";
  }
}

// Initialize UI manager
document.addEventListener("DOMContentLoaded", () => {
  window.uiManager = new UIManager();
});
