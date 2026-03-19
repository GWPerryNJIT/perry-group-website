document.addEventListener('DOMContentLoaded', () => {

    /* --- NAVBAR SCROLL EFFECT --- */
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                // Optional: stop observing once it has appeared
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements with the .fade-in class
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    /* --- SMOOTH SCROLLING FOR NAV LINKS --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* --- PARALLAX EFFECT FOR BACKGROUND BLOBS --- */
    const blobs = document.querySelectorAll('.blob-bg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        blobs.forEach((blob, index) => {
            // Different speed for different blobs
            const speed = (index + 1) * 0.1;
            blob.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    /* --- DYNAMIC ORCID PUBLICATIONS --- */
    const ORCID_ID = '0000-0002-4690-5783';
    const pubGrid = document.getElementById('publications-grid');
    const skeleton = document.getElementById('pub-skeleton');

    async function initPublications() {
        if (!pubGrid) return;

        try {
            const response = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await response.json();
            
            // Extract works and sort by year (newest first)
            const works = data.group.map(g => g['work-summary'][0])
                .sort((a, b) => {
                    const yearA = a['publication-date']?.year?.value || 0;
                    const yearB = b['publication-date']?.year?.value || 0;
                    return yearB - yearA;
                })
                .slice(0, 6); // Top 6 recent

            // Fetch details for authors/DOI if needed, or just render summaries
            renderPublications(works);
        } catch (error) {
            console.error('Error fetching ORCID works:', error);
            if (skeleton) skeleton.innerHTML = '<p class="text-dim">Unable to load live publications. Please view the full profile below.</p>';
        }
    }

    function renderPublications(works) {
        if (skeleton) skeleton.remove();
        
        works.forEach((work, index) => {
            const title = work.title?.title?.value || 'Untitled Work';
            const year = work['publication-date']?.year?.value || 'N/A';
            const journal = work['journal-title']?.value || 'Journal/Venue Not Listed';
            const type = work.type.replace(/_/g, ' ');
            
            // Try to find DOI
            let doiUrl = '#';
            const doi = work['external-ids']?.['external-id']?.find(id => id['external-id-type'] === 'doi');
            if (doi) {
                doiUrl = doi['external-id-url']?.value || `https://doi.org/${doi['external-id-value']}`;
            }

            const card = document.createElement('div');
            card.className = `pub-card fade-in`;
            card.style.animationDelay = `${index * 0.1}s`;
            
            const venueText = journal !== 'Journal/Venue Not Listed' ? `${journal} &bull; ${year}` : `${year}`;
            
            card.innerHTML = `
                <a href="${doiUrl}" target="_blank" class="pub-title">${title}</a>
                <div class="pub-venue">${venueText}</div>
                <div class="badge glass" style="align-self: flex-start; margin-top: 0.5rem; font-size: 0.7rem; padding: 0.2rem 0.6rem; text-transform: capitalize;">${type}</div>
            `;
            
            pubGrid.appendChild(card);
            
            // Trigger animation
            setTimeout(() => card.classList.add('appear'), 50);
        });
    }

    initPublications();
});
