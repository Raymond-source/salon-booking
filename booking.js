// booking.js - Main Booking Logic
class BookingSystem {
  constructor() {
    this.currentStep = 1;
    this.selectedService = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookingData = {};
    this.services = [];
    this.availableSlots = [];
    this.currentMonth = new Date();
    this.currentUser = null;

    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadServices();
    this.updateProgressBar();
    this.initGoogleAuth();

    // Check for existing user session
    this.checkAuth();
  }

  cacheElements() {
    // Step elements
    this.steps = document.querySelectorAll(".booking-step");
    this.progressSteps = document.querySelectorAll(".progress-step");

    // Service selection
    this.servicesGrid = document.getElementById("servicesGrid");
    this.filterButtons = document.querySelectorAll(".filter-btn");
    this.nextStep1Btn = document.getElementById("nextStep1");

    // Date & Time selection
    this.calendarDays = document.getElementById("calendarDays");
    this.timeslotsGrid = document.getElementById("timeslotsGrid");
    this.selectedDateDisplay = document.getElementById("selectedDateDisplay");
    this.selectedServicePreview = document.getElementById(
      "selectedServicePreview"
    );
    this.prevMonthBtn = document.getElementById("prevMonth");
    this.nextMonthBtn = document.getElementById("nextMonth");
    this.currentMonthDisplay = document.getElementById("currentMonth");
    this.nextStep2Btn = document.getElementById("nextStep2");

    // Customer details
    this.customerForm = document.getElementById("customerForm");
    this.confirmBookingBtn = document.getElementById("confirmBookingBtn");
    this.bookingSummary = document.getElementById("bookingSummary");

    // Confirmation
    this.confirmationDetails = document.getElementById("confirmationDetails");
    this.newBookingBtn = document.getElementById("newBookingBtn");
    this.viewBookingsBtn = document.getElementById("viewBookingsBtn");
    this.downloadCalendarBtn = document.getElementById("downloadCalendarBtn");

    // Navigation
    this.backButtons = document.querySelectorAll(".back-btn");
    this.bookNowBtn = document.getElementById("bookNowBtn");

    // Auth
    this.loginBtn = document.getElementById("loginBtn");
    this.signupBtn = document.getElementById("signupBtn");
    this.quickLoginBtn = document.getElementById("quickLoginBtn");
    this.googleSignInBtn = document.getElementById("googleSignIn");

    // Modals
    this.loginModal = document.getElementById("loginModal");
    this.modalClose = document.querySelector(".modal-close");

    // Loading
    this.loadingOverlay = document.getElementById("loadingOverlay");

    // Toast
    this.toast = document.getElementById("notificationToast");
    this.toastMessage = document.getElementById("toastMessage");
  }

  bindEvents() {
    // Step navigation
    this.nextStep1Btn.addEventListener("click", () => this.goToStep(2));
    this.nextStep2Btn.addEventListener("click", () => this.goToStep(3));
    this.confirmBookingBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.submitBooking();
    });

    // Back buttons
    this.backButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.goToStep(this.currentStep - 1));
    });

    // Calendar navigation
    this.prevMonthBtn.addEventListener("click", () => this.changeMonth(-1));
    this.nextMonthBtn.addEventListener("click", () => this.changeMonth(1));

    // Service filters
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.filterServices(e.target.dataset.category)
      );
    });

    // Book now button
    this.bookNowBtn.addEventListener("click", () => this.goToStep(1));

    // Confirmation actions
    this.newBookingBtn.addEventListener("click", () => this.resetBooking());
    this.viewBookingsBtn.addEventListener("click", () => this.viewBookings());
    this.downloadCalendarBtn.addEventListener("click", () =>
      this.downloadCalendar()
    );

    // Auth buttons
    this.loginBtn.addEventListener("click", () => this.showLoginModal());
    this.signupBtn.addEventListener("click", () => this.showSignupModal());
    this.quickLoginBtn.addEventListener("click", () => this.showLoginModal());

    // Modal close
    this.modalClose?.addEventListener("click", () => this.hideLoginModal());

    // Close modal on outside click
    window.addEventListener("click", (e) => {
      if (e.target === this.loginModal) {
        this.hideLoginModal();
      }
    });
  }

  async loadServices() {
    try {
      // Show loading
      this.showLoading();

      // In production, fetch from API
      // const response = await fetch('/api/services');
      // this.services = await response.json();

      // Mock data for demo
      this.services = [
        {
          id: "1",
          name: "Gel Nails",
          category: "nails",
          duration: 60,
          price: 250,
          description: "Full gel set with polish and design",
        },
        {
          id: "2",
          name: "Acrylic Nails",
          category: "nails",
          duration: 90,
          price: 350,
          description: "Acrylic with tips and custom design",
        },
        {
          id: "3",
          name: "Hair Wash & Blow",
          category: "hair",
          duration: 45,
          price: 180,
          description: "Professional wash, condition and blow dry",
        },
        {
          id: "4",
          name: "Knotless Braids",
          category: "braids",
          duration: 180,
          price: 800,
          description: "Medium knotless braids with beads",
        },
        {
          id: "5",
          name: "Full Makeup",
          category: "makeup",
          duration: 60,
          price: 300,
          description: "Professional makeup for special occasions",
        },
        {
          id: "6",
          name: "Spa Pedicure",
          category: "spa",
          duration: 75,
          price: 280,
          description: "Luxury pedicure with massage",
        },
      ];

      this.renderServices(this.services);
      this.hideLoading();
    } catch (error) {
      console.error("Error loading services:", error);
      this.showToast("Failed to load services. Please try again.", "error");
      this.hideLoading();
    }
  }

  renderServices(services) {
    this.servicesGrid.innerHTML = "";

    if (services.length === 0) {
      this.servicesGrid.innerHTML = `
                <div class="no-services">
                    <p>No services found in this category.</p>
                </div>
            `;
      return;
    }

    services.forEach((service) => {
      const card = document.createElement("div");
      card.className = "service-card";
      card.dataset.id = service.id;
      card.dataset.category = service.category;

      card.innerHTML = `
                <div class="service-header">
                    <div>
                        <div class="service-name">${service.name}</div>
                        <div class="service-category">${this.capitalize(
                          service.category
                        )}</div>
                    </div>
                    <div class="service-price">R${service.price}</div>
                </div>
                <div class="service-duration">
                    <i class="fas fa-clock"></i> ${service.duration} minutes
                </div>
                <div class="service-description">${service.description}</div>
                <div class="service-select">
                    <button class="btn-select">
                        <i class="fas fa-check"></i> Select
                    </button>
                </div>
            `;

      const selectBtn = card.querySelector(".btn-select");
      selectBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectService(service);
      });

      card.addEventListener("click", () => this.selectService(service));

      this.servicesGrid.appendChild(card);
    });
  }

  filterServices(category) {
    // Update active filter button
    this.filterButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.category === category) {
        btn.classList.add("active");
      }
    });

    // Filter services
    let filteredServices = this.services;
    if (category !== "all") {
      filteredServices = this.services.filter(
        (service) => service.category === category
      );
    }

    this.renderServices(filteredServices);
  }

  selectService(service) {
    // Remove previous selection
    document.querySelectorAll(".service-card").forEach((card) => {
      card.classList.remove("selected");
    });

    // Mark selected card
    const selectedCard = document.querySelector(`[data-id="${service.id}"]`);
    if (selectedCard) {
      selectedCard.classList.add("selected");
    }

    this.selectedService = service;

    // Enable next button
    this.nextStep1Btn.disabled = false;

    // Update service preview for step 2
    this.updateServicePreview();

    // Load available dates for this service
    this.loadAvailableDates();
  }

  updateServicePreview() {
    if (!this.selectedService) return;

    this.selectedServicePreview.innerHTML = `
            <div class="service-preview-content">
                <h4>Selected Service</h4>
                <div class="preview-details">
                    <div class="preview-name">${this.selectedService.name}</div>
                    <div class="preview-info">
                        <span><i class="fas fa-clock"></i> ${
                          this.selectedService.duration
                        } min</span>
                        <span><i class="fas fa-tag"></i> R${
                          this.selectedService.price
                        }</span>
                        <span><i class="fas fa-layer-group"></i> ${this.capitalize(
                          this.selectedService.category
                        )}</span>
                    </div>
                </div>
            </div>
        `;

    this.selectedServicePreview.classList.add("show");
  }

  loadAvailableDates() {
    // In production, fetch available dates from API
    // For demo, generate mock data
    this.generateMockCalendar();
  }

  generateMockCalendar() {
    const today = new Date();
    this.renderCalendar();

    // Simulate loading available slots for today
    this.selectedDate = today;
    this.updateDateDisplay();
    this.generateTimeSlots();
  }

  renderCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Update month display
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.currentMonthDisplay.textContent = `${monthNames[month]} ${year}`;

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Get number of days in month
    const daysInMonth = lastDay.getDate();
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayIndex = firstDay.getDay();

    this.calendarDays.innerHTML = "";

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "calendar-day disabled";
      this.calendarDays.appendChild(emptyCell);
    }

    // Add cells for each day of month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = day;
      dayElement.dataset.date = date.toISOString().split("T")[0];

      // Mark today
      if (date.getTime() === today.getTime()) {
        dayElement.classList.add("today");
      }

      // Mark selected date
      if (
        this.selectedDate &&
        date.toDateString() === this.selectedDate.toDateString()
      ) {
        dayElement.classList.add("selected");
      }

      // Disable past dates
      if (date < today) {
        dayElement.classList.add("disabled");
      }

      // Add click event
      if (!dayElement.classList.contains("disabled")) {
        dayElement.addEventListener("click", () => this.selectDate(date));
      }

      this.calendarDays.appendChild(dayElement);
    }
  }

  changeMonth(delta) {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
    this.renderCalendar();
  }

  selectDate(date) {
    // Remove previous selection
    document.querySelectorAll(".calendar-day").forEach((day) => {
      day.classList.remove("selected");
    });

    // Mark selected day
    const selectedDay = document.querySelector(
      `[data-date="${date.toISOString().split("T")[0]}"]`
    );
    if (selectedDay) {
      selectedDay.classList.add("selected");
    }

    this.selectedDate = date;
    this.updateDateDisplay();
    this.generateTimeSlots();
  }

  updateDateDisplay() {
    if (!this.selectedDate) return;

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    this.selectedDateDisplay.textContent = this.selectedDate.toLocaleDateString(
      "en-ZA",
      options
    );
  }

  generateTimeSlots() {
    if (!this.selectedDate) return;

    // Mock time slots
    const slots = [
      { time: "09:00", available: true },
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "12:00", available: true },
      { time: "13:00", available: false },
      { time: "14:00", available: true },
      { time: "15:00", available: true },
      { time: "16:00", available: false },
      { time: "17:00", available: true },
    ];

    this.renderTimeSlots(slots);
  }

  renderTimeSlots(slots) {
    this.timeslotsGrid.innerHTML = "";

    slots.forEach((slot) => {
      const slotElement = document.createElement("div");
      slotElement.className = `timeslot ${slot.available ? "" : "booked"}`;
      slotElement.textContent = slot.time;

      if (slot.available) {
        slotElement.addEventListener("click", () =>
          this.selectTimeSlot(slot.time)
        );
      }

      this.timeslotsGrid.appendChild(slotElement);
    });
  }

  selectTimeSlot(time) {
    // Remove previous selection
    document.querySelectorAll(".timeslot").forEach((slot) => {
      slot.classList.remove("selected");
    });

    // Mark selected slot
    const selectedSlot = Array.from(
      document.querySelectorAll(".timeslot")
    ).find((slot) => slot.textContent === time);

    if (selectedSlot) {
      selectedSlot.classList.add("selected");
    }

    this.selectedTime = time;
    this.nextStep2Btn.disabled = false;

    // Update booking summary
    this.updateBookingSummary();
  }

  updateBookingSummary() {
    if (!this.selectedService || !this.selectedDate || !this.selectedTime)
      return;

    const options = { weekday: "short", month: "short", day: "numeric" };
    const formattedDate = this.selectedDate.toLocaleDateString(
      "en-ZA",
      options
    );

    this.bookingSummary.innerHTML = `
            <div class="summary-header">
                <h4>Booking Summary</h4>
            </div>
            <div class="summary-details">
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">${this.selectedService.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${this.selectedTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${this.selectedService.duration} minutes</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Price:</span>
                    <span class="detail-value">R${this.selectedService.price}</span>
                </div>
            </div>
        `;
  }

  async submitBooking() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Collect form data
    const formData = {
      service_id: this.selectedService.id,
      customer_name: document.getElementById("customerName").value,
      customer_phone: document.getElementById("customerPhone").value,
      customer_email: document.getElementById("customerEmail").value || null,
      booking_date: this.selectedDate.toISOString().split("T")[0],
      start_time: this.selectedTime,
      notes: document.getElementById("customerNotes").value || null,
      user_id: this.currentUser?.id || null,
    };

    try {
      this.showLoading();

      // In production, submit to API
      // const response = await fetch('/api/bookings', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(formData)
      // });
      // const result = await response.json();

      // Mock response for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const result = {
        success: true,
        booking: {
          id: "BK" + Date.now().toString().slice(-8),
          ...formData,
          end_time: this.calculateEndTime(
            this.selectedTime,
            this.selectedService.duration
          ),
          status: "confirmed",
        },
      };

      if (result.success) {
        // Send confirmation
        await this.sendConfirmation(result.booking);

        // Store booking data for confirmation display
        this.bookingData = result.booking;

        // Show confirmation
        this.showConfirmation(result.booking);
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      this.showToast("Failed to create booking. Please try again.", "error");
    } finally {
      this.hideLoading();
    }
  }

  validateForm() {
    const name = document.getElementById("customerName").value;
    const phone = document.getElementById("customerPhone").value;
    const terms = document.getElementById("termsAgree").checked;

    if (!name.trim()) {
      this.showToast("Please enter your name", "error");
      return false;
    }

    if (!phone.trim()) {
      this.showToast("Please enter your phone number", "error");
      return false;
    }

    if (!terms) {
      this.showToast("Please agree to the terms and conditions", "error");
      return false;
    }

    return true;
  }

  calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  }

  async sendConfirmation(booking) {
    // Mock SMS/WhatsApp sending
    const message = `Hi ${booking.customer_name}, your ${this.selectedService.name} appointment is booked for ${booking.booking_date} at ${booking.start_time}. We'll send a reminder before your appointment.`;

    console.log("Sending confirmation:", message);

    // In production, integrate with SMS/WhatsApp API
    // await fetch('/api/send-confirmation', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         phone: booking.customer_phone,
    //         message: message
    //     })
    // });
  }

  showConfirmation(booking) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = new Date(booking.booking_date).toLocaleDateString(
      "en-ZA",
      options
    );

    this.confirmationDetails.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${booking.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${this.selectedService.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${formattedDate} at ${booking.start_time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${this.selectedService.duration} minutes</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">R${this.selectedService.price}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${booking.customer_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">${booking.customer_phone}</span>
            </div>
        `;

    this.goToStep(4);
  }

  goToStep(step) {
    // Validate step transitions
    if (step < 1 || step > 4) return;

    // Hide all steps
    this.steps.forEach((stepEl) => {
      stepEl.classList.remove("active");
    });

    // Show target step
    const targetStep = document.getElementById(`step-${step}`);
    if (targetStep) {
      targetStep.classList.add("active");
      this.currentStep = step;
      this.updateProgressBar();

      // Scroll to top of step
      window.scrollTo({
        top: targetStep.offsetTop - 100,
        behavior: "smooth",
      });
    }
  }

  updateProgressBar() {
    this.progressSteps.forEach((step) => {
      step.classList.remove("active");
      if (parseInt(step.dataset.step) <= this.currentStep) {
        step.classList.add("active");
      }
    });
  }

  resetBooking() {
    // Reset selections
    this.selectedService = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookingData = {};

    // Reset UI
    document.querySelectorAll(".service-card").forEach((card) => {
      card.classList.remove("selected");
    });

    document.querySelectorAll(".calendar-day").forEach((day) => {
      day.classList.remove("selected");
    });

    document.querySelectorAll(".timeslot").forEach((slot) => {
      slot.classList.remove("selected");
    });

    // Reset form
    if (this.customerForm) {
      this.customerForm.reset();
    }

    // Hide service preview
    this.selectedServicePreview.classList.remove("show");

    // Reset buttons
    this.nextStep1Btn.disabled = true;
    this.nextStep2Btn.disabled = true;

    // Reset summary
    this.bookingSummary.innerHTML = "";

    // Go back to step 1
    this.goToStep(1);
  }

  viewBookings() {
    if (this.currentUser) {
      // Redirect to user dashboard
      this.showToast("Redirecting to your bookings...", "success");
      // In production: window.location.href = '/dashboard';
    } else {
      this.showLoginModal();
    }
  }

  downloadCalendar() {
    if (!this.bookingData.booking_date || !this.bookingData.start_time) {
      this.showToast("No booking data available", "error");
      return;
    }

    // Create calendar event
    const start = new Date(
      `${this.bookingData.booking_date}T${this.bookingData.start_time}`
    );
    const end = new Date(
      start.getTime() + this.selectedService.duration * 60000
    );

    const icsContent = this.generateICSEvent(
      `Salon Appointment: ${this.selectedService.name}`,
      `Appointment at Glamour Salon for ${this.selectedService.name}`,
      start,
      end,
      "Glamour Salon, 123 Sandton Drive, Johannesburg"
    );

    // Download .ics file
    this.downloadFile(icsContent, "salon-appointment.ics", "text/calendar");
    this.showToast("Calendar event downloaded", "success");
  }

  generateICSEvent(summary, description, start, end, location) {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Glamour Salon//Booking System//EN
BEGIN:VEVENT
UID:${Date.now()}@glamoursalon.co.za
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${start.toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTEND:${end.toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
  }

  downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Auth Methods
  checkAuth() {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Validate token with backend
      this.currentUser = JSON.parse(localStorage.getItem("user") || "null");
      this.updateAuthUI();
    }
  }

  updateAuthUI() {
    if (this.currentUser) {
      this.loginBtn.innerHTML = `<i class="fas fa-user"></i> ${this.currentUser.name}`;
      this.signupBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
      this.signupBtn.onclick = () => this.logout();
    } else {
      this.loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
      this.signupBtn.innerHTML = `<i class="fas fa-user-plus"></i> Sign Up`;
      this.signupBtn.onclick = () => this.showSignupModal();
    }
  }

  showLoginModal() {
    this.loginModal.classList.add("active");
  }

  hideLoginModal() {
    this.loginModal.classList.remove("active");
  }

  showSignupModal() {
    // Similar to login modal but for signup
    this.showToast("Signup feature coming soon!", "info");
  }

  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    this.currentUser = null;
    this.updateAuthUI();
    this.showToast("Logged out successfully", "success");
  }

  initGoogleAuth() {
    // Google Sign In button will be initialized by auth.js
  }

  // Utility Methods
  showLoading() {
    this.loadingOverlay?.classList.add("active");
  }

  hideLoading() {
    this.loadingOverlay?.classList.remove("active");
  }

  showToast(message, type = "info") {
    this.toastMessage.textContent = message;

    // Set color based on type
    const colors = {
      success: "#00b894",
      error: "#e17055",
      info: "#6c5ce7",
      warning: "#fdcb6e",
    };

    this.toast.style.background = colors[type] || colors.info;
    this.toast.classList.add("show");

    // Auto hide after 3 seconds
    setTimeout(() => {
      this.toast.classList.remove("show");
    }, 3000);
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize booking system when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.bookingSystem = new BookingSystem();
});
