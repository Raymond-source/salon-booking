// auth.js - Authentication Logic
class AuthManager {
  constructor() {
    this.initGoogleAuth();
    this.bindAuthEvents();
  }

  initGoogleAuth() {
    // Initialize Google Sign In
    if (typeof google !== "undefined") {
      google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your actual client ID
        callback: this.handleGoogleAuth.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render Google Sign In buttons
      const signInButton = document.getElementById("googleSignIn");
      const modalButton = document.getElementById("googleSignInModal");

      if (signInButton) {
        google.accounts.id.renderButton(signInButton, {
          theme: "outline",
          size: "large",
          width: "100%",
        });
      }

      if (modalButton) {
        google.accounts.id.renderButton(modalButton, {
          theme: "outline",
          size: "large",
          width: "100%",
        });
      }
    }
  }

  bindAuthEvents() {
    // Phone OTP login
    const sendOTPBtn = document.getElementById("sendOTPBtn");
    const verifyOTPBtn = document.getElementById("verifyOTPBtn");
    const loginPhone = document.getElementById("loginPhone");
    const loginOTP = document.getElementById("loginOTP");
    const otpInput = document.querySelector(".otp-input");

    if (sendOTPBtn) {
      sendOTPBtn.addEventListener("click", () => {
        const phone = loginPhone.value.trim();
        if (!phone) {
          this.showToast("Please enter your phone number", "error");
          return;
        }

        this.sendOTP(phone);
        otpInput.style.display = "flex";
      });
    }

    if (verifyOTPBtn) {
      verifyOTPBtn.addEventListener("click", () => {
        const phone = loginPhone.value.trim();
        const otp = loginOTP.value.trim();

        if (!otp || otp.length !== 6) {
          this.showToast("Please enter a valid 6-digit OTP", "error");
          return;
        }

        this.verifyOTP(phone, otp);
      });
    }

    // Email login form
    const emailLoginForm = document.getElementById("emailLoginForm");
    if (emailLoginForm) {
      emailLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(emailLoginForm);
        this.loginWithEmail(formData);
      });
    }
  }

  async handleGoogleAuth(response) {
    try {
      // Send token to backend for verification
      const result = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await result.json();

      if (data.success) {
        // Store user session
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Update UI
        if (window.bookingSystem) {
          window.bookingSystem.currentUser = data.user;
          window.bookingSystem.updateAuthUI();
          window.bookingSystem.hideLoginModal();
        }

        this.showToast("Logged in successfully!", "success");

        // Prefill customer details if in booking flow
        this.prefillUserDetails(data.user);
      }
    } catch (error) {
      console.error("Google auth failed:", error);
      this.showToast("Login failed. Please try again.", "error");
    }
  }

  async sendOTP(phone) {
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        this.showToast("OTP sent to your phone", "success");
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (error) {
      this.showToast("Failed to send OTP. Please try again.", "error");
    }
  }

  async verifyOTP(phone, otp) {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // Store user session
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Update UI
        if (window.bookingSystem) {
          window.bookingSystem.currentUser = data.user;
          window.bookingSystem.updateAuthUI();
          window.bookingSystem.hideLoginModal();
        }

        this.showToast("Logged in successfully!", "success");

        // Prefill customer details
        this.prefillUserDetails(data.user);
      } else {
        this.showToast("Invalid OTP. Please try again.", "error");
      }
    } catch (error) {
      this.showToast("Verification failed. Please try again.", "error");
    }
  }

  async loginWithEmail(formData) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (window.bookingSystem) {
          window.bookingSystem.currentUser = data.user;
          window.bookingSystem.updateAuthUI();
          window.bookingSystem.hideLoginModal();
        }

        this.showToast("Logged in successfully!", "success");
        this.prefillUserDetails(data.user);
      } else {
        this.showToast(data.error || "Login failed", "error");
      }
    } catch (error) {
      this.showToast("Login failed. Please try again.", "error");
    }
  }

  prefillUserDetails(user) {
    // Prefill customer form if in step 3
    if (document.getElementById("step-3")?.classList.contains("active")) {
      if (user.full_name) {
        document.getElementById("customerName").value = user.full_name;
      }
      if (user.phone) {
        document.getElementById("customerPhone").value = user.phone;
      }
      if (user.email) {
        document.getElementById("customerEmail").value = user.email;
      }
    }
  }

  showToast(message, type = "info") {
    // Use booking system's toast or create our own
    if (window.bookingSystem) {
      window.bookingSystem.showToast(message, type);
    } else {
      // Fallback alert
      alert(message);
    }
  }
}

// Initialize auth manager
document.addEventListener("DOMContentLoaded", () => {
  window.authManager = new AuthManager();
});
