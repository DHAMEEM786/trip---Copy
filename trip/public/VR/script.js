
document.addEventListener('DOMContentLoaded', () => {

    // Hover effect for links and buttons (Optional: can be removed if CSS :hover is enough, but keeping for body class)
    const interactiveElements = document.querySelectorAll('a, button, .place-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
});
