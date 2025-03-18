// Header scroll effect
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.classList.add("scrolled"); // Make solid
    } else {
        header.classList.remove("scrolled"); // Revert to transparent
    }
});

// Improved embed handling
document.addEventListener('DOMContentLoaded', function() {
    // Store whether embeds have been processed
    const processedEmbeds = {
        instagram: false,
        tiktok: false
    };
    
    // Load all embeds initially (once the DOM is ready)
    setTimeout(() => {
        loadAllEmbeds();
    }, 1000); // Give a bit more time for the page to fully render
    
    // Setup scroll event listeners for carousels
    setupCarouselScrollListeners();
});

function loadAllEmbeds() {
    // Process Instagram embeds
    if (window.instgrm && typeof window.instgrm.Embeds.process === 'function') {
        window.instgrm.Embeds.process();
    } else {
        // If Instagram embed JS isn't loaded yet, try again shortly
        setTimeout(loadAllEmbeds, 500);
        return;
    }
    
    // Load TikTok embeds properly
    loadTikTokEmbeds();
}

function loadTikTokEmbeds() {
    // Check if TikTok script exists
    let tikTokScript = document.querySelector('script[src*="tiktok.com/embed.js"]');
    
    // If not, create and add it
    if (!tikTokScript) {
        tikTokScript = document.createElement('script');
        tikTokScript.src = 'https://www.tiktok.com/embed.js';
        tikTokScript.async = true;
        document.body.appendChild(tikTokScript);
    }
    
    // For all TikTok embeds, ensure they have proper structure
    document.querySelectorAll('.tiktok-embed').forEach(embed => {
        if (!embed.querySelector('section')) {
            const section = document.createElement('section');
            embed.appendChild(section);
        }
    });
}

// Improved carousel scrolling function
function scrollCarousel(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    // Calculate item width for smoother scrolling
    const items = carousel.querySelectorAll('.carousel-item');
    if (items.length === 0) return;
    
    // Get width of one item plus its margin
    const itemStyle = window.getComputedStyle(items[0]);
    const itemWidth = items[0].offsetWidth + 
                      parseInt(itemStyle.marginLeft) + 
                      parseInt(itemStyle.marginRight);
    
    // Get number of visible items
    const visibleItems = Math.floor(carousel.offsetWidth / itemWidth);
    
    // Scroll exactly by the width of one item
    const scrollAmount = direction > 0 ? itemWidth : -itemWidth;
    
    // Calculate current position in "items"
    const currentPosition = Math.round(carousel.scrollLeft / itemWidth);
    const targetPosition = currentPosition + direction;
    
    // Scroll to the exact position
    carousel.scrollTo({
        left: targetPosition * itemWidth,
        behavior: 'smooth'
    });
    
    // After scrolling, ensure embeds in view are loaded
    setTimeout(() => {
        // Only process embeds that are in or near the viewport
        if (carousel.id.includes('instagram')) {
            // Process Instagram embeds if they exist
            if (window.instgrm) {
                window.instgrm.Embeds.process();
            }
        }
        
        // For TikTok, we don't need to reload - the embeds should persist properly
    }, 500);
}

function setupCarouselScrollListeners() {
    const carousels = document.querySelectorAll('.social-carousel');
    
    carousels.forEach(carousel => {
        // Update arrow visibility on scroll
        carousel.addEventListener('scroll', function() {
            updateArrowVisibility(carousel);
        });
        
        // Initialize arrow visibility
        updateArrowVisibility(carousel);
        
        // Add intersection observer to lazy-load embeds as they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const embedContainer = entry.target;
                    
                    // Check if this is an Instagram or TikTok embed
                    if (embedContainer.querySelector('.instagram-media')) {
                        if (window.instgrm) {
                            window.instgrm.Embeds.process();
                        }
                    } else if (embedContainer.querySelector('.tiktok-embed')) {
                        // TikTok embeds should load automatically once in view
                    }
                    
                    // Once processed, no need to observe this item anymore
                    observer.unobserve(embedContainer);
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });
        
        // Observe all carousel items
        carousel.querySelectorAll('.carousel-item').forEach(item => {
            observer.observe(item);
        });
    });
}

function updateArrowVisibility(carousel) {
    const isAtStart = carousel.scrollLeft <= 10;
    const isAtEnd = carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth - 10;
    
    // Get the prev/next buttons for this carousel
    const prevBtn = carousel.parentElement.querySelector('.carousel-arrow.prev');
    const nextBtn = carousel.parentElement.querySelector('.carousel-arrow.next');
    
    if (prevBtn && nextBtn) {
        // Toggle visibility
        prevBtn.style.opacity = isAtStart ? '0.5' : '1';
        nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
        
        prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
        nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    }
}
function setupScrollAnimations() {
    // CSS classes to add for different animation types
    const animations = {
        'fade-in': 'animate-fade-in',
        'slide-up': 'animate-slide-up',
        'slide-right': 'animate-slide-right',
        'slide-left': 'animate-slide-left',
        'zoom-in': 'animate-zoom-in',
        'flip': 'animate-flip'
    };

    // Add animation classes to elements
    // Format: data-scroll-animation="animation-name" data-scroll-delay="0.2" (delay is optional)
    const animatedElements = document.querySelectorAll('[data-scroll-animation]');
    
    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationType = element.dataset.scrollAnimation;
                const delay = element.dataset.scrollDelay || 0;
                
                // Set delay if specified
                element.style.transitionDelay = `${delay}s`;
                
                // Add the animation class
                if (animations[animationType]) {
                    setTimeout(() => {
                        element.classList.add(animations[animationType]);
                    }, 100); // Small delay to ensure transition works
                }
                
                // Stop observing after animation is applied
                observer.unobserve(element);
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.15 // 15% of the element must be visible
    });
    
    // Start observing all elements with animation attributes
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Apply animations to common elements automatically
function applyDefaultAnimations() {
    // Section titles
    document.querySelectorAll('.section-title').forEach(el => {
        if (!el.hasAttribute('data-scroll-animation')) {
            el.setAttribute('data-scroll-animation', 'slide-up');
        }
    });
    
    // Highlight cards
    document.querySelectorAll('.highlight-card').forEach((el, index) => {
        if (!el.hasAttribute('data-scroll-animation')) {
            el.setAttribute('data-scroll-animation', 'fade-in');
            el.setAttribute('data-scroll-delay', (index * 0.15).toString());
        }
    });
    
    // Social platform cards
    document.querySelectorAll('.social-platform').forEach((el, index) => {
        if (!el.hasAttribute('data-scroll-animation')) {
            el.setAttribute('data-scroll-animation', 'slide-up');
            el.setAttribute('data-scroll-delay', (index * 0.2).toString());
        }
    });
    
    // Phase cards for roadmap
    document.querySelectorAll('.phase-card').forEach((el, index) => {
        if (!el.hasAttribute('data-scroll-animation')) {
            el.setAttribute('data-scroll-animation', 'slide-up');
            el.setAttribute('data-scroll-delay', (index * 0.2).toString());
        }
    });
    
    // Step cards in "How to Buy" section
    document.querySelectorAll('.step-card').forEach((el, index) => {
        if (!el.hasAttribute('data-scroll-animation')) {
            el.setAttribute('data-scroll-animation', 'slide-left');
            el.setAttribute('data-scroll-delay', (index * 0.15).toString());
        }
    });
    
    // Carousel containers
    document.querySelectorAll('.carousel-container').forEach(el => {
        if (!el.hasAttribute('data-scroll-animation')) {
            el.setAttribute('data-scroll-animation', 'fade-in');
        }
    });
    
    // Hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && !heroContent.hasAttribute('data-scroll-animation')) {
        heroContent.setAttribute('data-scroll-animation', 'slide-right');
    }
    
    // Hero image
    const heroImage = document.querySelector('.hero-image');
    if (heroImage && !heroImage.hasAttribute('data-scroll-animation')) {
        heroImage.setAttribute('data-scroll-animation', 'slide-left');
    }
    
    // Story content
    const storyContent = document.querySelector('.story-content');
    if (storyContent && !storyContent.hasAttribute('data-scroll-animation')) {
        storyContent.setAttribute('data-scroll-animation', 'slide-right');
    }
    
    // Story image
    const storyImage = document.querySelector('.story-image');
    if (storyImage && !storyImage.hasAttribute('data-scroll-animation')) {
        storyImage.setAttribute('data-scroll-animation', 'slide-left');
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // First apply default animations to elements
    applyDefaultAnimations();
    
    // Then setup the scroll animation observer
    setupScrollAnimations();
});