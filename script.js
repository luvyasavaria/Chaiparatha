// Navigation Toggle Logic
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navIcon = document.getElementById('nav-icon');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    if (navMenu.classList.contains('active')) {
        navIcon.setAttribute('name', 'close-outline');
    } else {
        navIcon.setAttribute('name', 'menu-outline');
    }
});

// Canvas Setup
const canvas = document.getElementById('video-canvas');
const context = canvas.getContext('2d');

// Image Sequence Settings
const frameCount = 192;
const images = [];
let imagesLoaded = 0;

// Text overlays mapped to animation progress (0 to 1)
const textPhases = [
    { el: document.querySelector('.step-1'), start: 0.02, fadeIn: 0.05, fadeOut: 0.12, end: 0.15 }, // "It starts simple."
    { el: document.querySelector('.step-2'), start: 0.16, fadeIn: 0.18, fadeOut: 0.25, end: 0.28 }, // "Chai."
    { el: document.querySelector('.step-3'), start: 0.29, fadeIn: 0.31, fadeOut: 0.38, end: 0.41 }, // "Paratha."
    { el: document.querySelector('.step-4'), start: 0.42, fadeIn: 0.44, fadeOut: 0.53, end: 0.56 }, // "Nothing special."
    { el: document.querySelector('.step-5'), start: 0.58, fadeIn: 0.62, fadeOut: 0.72, end: 0.76 }, // "Until you see it differently."
    { el: document.querySelector('.final-step'), start: 0.78, fadeIn: 0.85, fadeOut: 0.98, end: 1.00 } // "Even simple things can feel premium."
];

// Scroll indicator reference
const scrollIndicator = document.getElementById('scroll-indicator');

// Preload Images
function preloadImages() {
    for (let i = 1; i <= frameCount; i++) {
        const indexStr = i.toString().padStart(3, '0');
        const img = new Image();
        img.src = `./ezgif-frame-${indexStr}.jpg`;
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === 1) {
                // Draw first frame immediately
                drawFrame(0);
            }
        };
        images.push(img);
    }
}

// Map scroll position to progress 0..1 in the animation section
function updateAnimation() {
    const section = document.querySelector('.story-section');
    const scrollPosition = window.scrollY;
    
    // Total distance we can scroll inside this section
    const maxScroll = section.offsetHeight - window.innerHeight;
    
    // Clamp progress between 0 and 1
    let scrollFraction = scrollPosition / maxScroll;
    if (scrollFraction < 0) scrollFraction = 0;
    if (scrollFraction > 1) scrollFraction = 1;

    // Toggle scroll indicator based on scroll
    if (scrollFraction > 0.01) {
        scrollIndicator.classList.add('hidden');
    } else {
        scrollIndicator.classList.remove('hidden');
    }

    // Determine current frame
    const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));
    
    // Draw current frame using requestAnimationFrame
    requestAnimationFrame(() => drawFrame(frameIndex));

    // Update Text Opacities
    updateTextOpacities(scrollFraction);
}

function updateTextOpacities(progress) {
    textPhases.forEach(phase => {
        if (!phase.el) return;
        
        let opacity = 0;
        let scale = 1;
        let yOffset = 0;

        if (progress >= phase.start && progress <= phase.end) {
            if (progress < phase.fadeIn) {
                // Fading in
                const t = (progress - phase.start) / (phase.fadeIn - phase.start);
                opacity = t;
                yOffset = 20 * (1 - t);
                scale = 0.95 + (0.05 * t);
            } else if (progress <= phase.fadeOut) {
                // Fully visible
                opacity = 1;
                yOffset = 0;
                scale = 1;
            } else {
                // Fading out
                const t = (progress - phase.fadeOut) / (phase.end - phase.fadeOut);
                opacity = 1 - t;
                yOffset = -20 * t;
                scale = 1 + (0.05 * t);
            }
        }
        
        phase.el.style.opacity = opacity;
        phase.el.style.transform = `translate(-50%, calc(-50% + ${yOffset}px)) scale(${scale})`;
    });
}

function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Resize canvas if needed
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        context.scale(dpr, dpr);
    }

    // Cover logic
    const canvasRatio = w / h;
    const imgRatio = img.naturalWidth / img.naturalHeight;

    let drawWidth, drawHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
        drawWidth = w;
        drawHeight = w / imgRatio;
        offsetY = (h - drawHeight) / 2;
    } else {
        drawHeight = h;
        drawWidth = h * imgRatio;
        offsetX = (w - drawWidth) / 2;
    }
    
    context.fillStyle = '#000000';
    context.fillRect(0, 0, w, h);
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(updateAnimation);
});

window.addEventListener('resize', () => {
    const section = document.querySelector('.story-section');
    const scrollPosition = window.scrollY;
    const maxScroll = section.offsetHeight - window.innerHeight;
    let scrollFraction = scrollPosition / maxScroll;
    if (scrollFraction < 0) scrollFraction = 0;
    if (scrollFraction > 1) scrollFraction = 1;

    const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));
    requestAnimationFrame(() => drawFrame(frameIndex));
});

// Make sure initial state matches scroll position on reload
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    updateAnimation();
});
