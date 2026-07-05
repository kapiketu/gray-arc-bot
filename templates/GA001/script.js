// Initialize Icons
lucide.createIcons();

// Initialize AOS (Animate on Scroll)
AOS.init({
    once: true,
    offset: 50,
    duration: 800,
    easing: 'ease-out-cubic',
});

// Sticky Navbar Logic
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('glass-nav-scrolled', 'py-4');
        navbar.classList.remove('py-6');
    } else {
        navbar.classList.remove('glass-nav-scrolled', 'py-4');
        navbar.classList.add('py-6');
    }
});

// Mobile Menu Toggle
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

function openMobileMenu() {
    mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
    mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
    document.body.classList.add('overflow-hidden');
    // Re-render icons inside menu
    lucide.createIcons();
}

function closeMobileMenu() {
    mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
    mobileMenu.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
}

menuBtn.addEventListener('click', openMobileMenu);
mobileMenuClose.addEventListener('click', closeMobileMenu);
mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

// Close menu when a nav link is clicked
mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Animated Counters Logic
const counters = document.querySelectorAll('.counter');
const speed = 200; // Lower is faster

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                // If float, keep decimals
                if(target % 1 !== 0) {
                    counter.innerText = (count + inc).toFixed(1);
                } else {
                    counter.innerText = Math.ceil(count + inc);
                }
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// Intersection Observer to trigger counters when visible
const trustSection = document.getElementById('trust');
const observer = new IntersectionObserver((entries) => {
    if(entries[0].isIntersecting) {
        animateCounters();
        observer.disconnect();
    }
}, { threshold: 0.5 });
if(trustSection) observer.observe(trustSection);


// Testimonial Auto-Slider Logic
const slider = document.getElementById('testimonial-slider');
let isDown = false;
let startX;
let scrollLeft;

// Optional: Auto scroll functionality
let autoScrollInt = setInterval(() => {
    if(slider) {
        slider.scrollBy({ left: 300, behavior: 'smooth' });
        // Reset to start if end is reached
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
            setTimeout(() => { slider.scrollTo({ left: 0, behavior: 'smooth' }); }, 1000);
        }
    }
}, 4000);

// Pause auto-scroll on hover
if(slider) {
    slider.addEventListener('mouseenter', () => clearInterval(autoScrollInt));
}


// Contact Form Submission (Simulation)
const contactForm = document.getElementById('contact-form');
const successMsg = document.getElementById('success-msg');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Grab data
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    
    // Simulate sending email to business owner
    console.log(`[System]: Sending lead to owner...`);
    console.log(`Name: ${name}, Phone: ${phone}`);
    
    // UI Updates
    const btn = contactForm.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Processing...`;
    lucide.createIcons();

    setTimeout(() => {
        contactForm.classList.add('hidden');
        successMsg.classList.remove('hidden');
        
        // Optional: Reset form after 5 seconds
        setTimeout(() => {
            contactForm.reset();
            contactForm.classList.remove('hidden');
            successMsg.classList.add('hidden');
            btn.innerHTML = originalText;
            lucide.createIcons();
        }, 5000);
        
    }, 1200); // Simulate network delay
});