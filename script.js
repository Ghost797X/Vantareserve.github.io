// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Fleet Filter
const filterTabs = document.querySelectorAll('.filter-tabs span');
const fleetCards = document.querySelectorAll('.fleet-card');

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active-tab'));
        tab.classList.add('active-tab');
        
        const category = tab.textContent.toLowerCase();
        fleetCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Booking Form Validation
const bookingForm = document.getElementById('booking-form');

bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const pickup = document.getElementById('pickup');
    const dropoff = document.getElementById('dropoff');

    if (pickup.value.trim() === '') {
        document.getElementById('pickup-error').textContent = 'Please enter a pick-up address';
        isValid = false;
    } else {
        document.getElementById('pickup-error').textContent = '';
    }

    if (dropoff.value.trim() === '') {
        document.getElementById('dropoff-error').textContent = 'Please enter a drop-off address';
        isValid = false;
    } else {
        document.getElementById('dropoff-error').textContent = '';
    }

    if (isValid) {
        alert('Booking submitted successfully!');
        // Add actual form submission logic here if needed
    }
});

// Smooth Scrolling for Scroll Indicator and Nav Links
document.querySelectorAll('a[href^="#"], .scroll-indicator').forEach(element => {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = element.getAttribute('href') === '#' ? 'services' : element.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId) || document.querySelector('.our-services');
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});