document.addEventListener('DOMContentLoaded', function () {
    const menuButton = document.getElementById('menuButton');
    const sideMenu = document.getElementById('sideMenu');
    const body = document.body;

    // Navbar scroll effect - REMOVED

    // Side menu toggle
    if (menuButton && sideMenu) {
        menuButton.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && e.target !== menuButton) {
                closeMenu();
            }
        });

        // Prevent menu from closing when clicking inside
        sideMenu.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    function toggleMenu() {
        sideMenu.classList.toggle('open');
        body.classList.toggle('menu-open');
    }

    function closeMenu() {
        sideMenu.classList.remove('open');
        body.classList.remove('menu-open');
    }

    // Add animation to cards on scroll
    const cards = document.querySelectorAll('.ar-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    // QR Modal logic
    const qrModal = document.getElementById('qrModal');
    const qrImage = document.getElementById('qrImage');
    const closeModal = document.querySelector('.close-modal');
    const viewArButtons = document.querySelectorAll('.ar-action button');

    viewArButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Find the image in the same container
            const container = this.closest('.ar-action');
            const img = container.querySelector('img');
            if (img) {
                qrImage.src = img.src;
                qrModal.classList.add('active');
            }
        });
    });

    if (closeModal) {
        closeModal.addEventListener('click', function () {
            qrModal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target == qrModal) {
            qrModal.classList.remove('active');
        }
    });

    // Cursor Glow Effect
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', function (e) {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
            cursorGlow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', function () {
            cursorGlow.style.opacity = '0';
        });
    }

    // 3D Tilt Effect with Glare
    const tiltCards = document.querySelectorAll('.ar-card');

    // Add glare element to each card
    tiltCards.forEach(card => {
        const glare = document.createElement('div');
        glare.classList.add('card-glare');
        card.appendChild(glare);

        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

            // Adjust glare position
            const glareX = ((x - centerX) / centerX) * 100;
            const glareY = ((y - centerY) / centerY) * 100;
            glare.style.transform = `translate(${glareX}%, ${glareY}%) scale(2)`;
            glare.style.opacity = '1';
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            glare.style.opacity = '0';
        });
    });

    // Canvas Particle Network
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = 50;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.fillStyle = 'rgba(0, 210, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Draw lines between close particles
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.strokeStyle = `rgba(0, 210, 255, ${0.1 - distance / 1500})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

});
