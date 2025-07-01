// script.js

document.addEventListener("DOMContentLoaded", function () {

    // --- Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme');

    function setDarkMode(isDark) {
        if (isDark) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        updateNavbarTogglerIcon();
        // Update dynamic colors if functions exist
        if (typeof window.updateHeroParticlesColor === 'function') setTimeout(window.updateHeroParticlesColor, 50);
        if (typeof window.updateAwaazLinesColor === 'function') setTimeout(window.updateAwaazLinesColor, 50);
    }

    // Initial theme setting
    if (currentTheme === 'dark') setDarkMode(true);
    else if (currentTheme === 'light') setDarkMode(false);
    else setDarkMode(prefersDark.matches);

    // Listener for toggle button
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            setDarkMode(!body.classList.contains('dark-mode'));
        });
    }

    // Listener for OS theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setDarkMode(e.matches);
        }
    });

    // Helper to update navbar toggler icon color
    function updateNavbarTogglerIcon() {
        const togglerIcon = document.querySelector('.navbar-toggler-icon');
        if (togglerIcon) {
            const strokeColor = body.classList.contains('dark-mode') ? 'rgba(241,241,241,0.9)' : 'rgba(0,0,0,0.8)';
            const encodedStrokeColor = encodeURIComponent(strokeColor);
            const svgString = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='${encodedStrokeColor}' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`;
            togglerIcon.style.backgroundImage = svgString;
        }
    }
    updateNavbarTogglerIcon(); // Initial call


    // --- Intersection Observer for Animations ---
    const fadeElems = document.querySelectorAll('.fade-in');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };
    const animationObserver = new IntersectionObserver(observerCallback, observerOptions);
    fadeElems.forEach(elem => animationObserver.observe(elem));


    // --- Homepage Video Intersection Observer ---
    let video = document.getElementById("eventVideo");
    if (video) {
        let videoObserverOptions = { threshold: 0.5 };
        let videoObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && !video.paused) video.pause();
            });
        };
        let videoObserver = new IntersectionObserver(videoObserverCallback, videoObserverOptions);
        videoObserver.observe(video);
    }


    // --- Hero Canvas Animation ---
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 100 };
        let animationFrameId;
        const dpr = window.devicePixelRatio || 1;

        function resizeCanvas() {
            const rect = heroCanvas.getBoundingClientRect();
            heroCanvas.width = rect.width * dpr;
            heroCanvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            heroCanvas.style.width = `${rect.width}px`;
            heroCanvas.style.height = `${rect.height}px`;
        }

        const heroSection = heroCanvas.parentElement;
        if (heroSection) {
           heroSection.addEventListener('mousemove', (event) => {
               const rect = heroCanvas.getBoundingClientRect();
               mouse.x = event.clientX - rect.left;
               mouse.y = event.clientY - rect.top;
           });
           heroSection.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
           heroSection.addEventListener('touchstart', (event) => {
                const rect = heroCanvas.getBoundingClientRect();
               mouse.x = event.touches[0].clientX - rect.left;
               mouse.y = event.touches[0].clientY - rect.top;
           }, { passive: true });
           heroSection.addEventListener('touchmove', (event) => {
               const rect = heroCanvas.getBoundingClientRect();
               mouse.x = event.touches[0].clientX - rect.left;
               mouse.y = event.touches[0].clientY - rect.top;
           }, { passive: true });
           heroSection.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });
        }

        class Particle {
             constructor(x, y) {
                 this.x = x || Math.random() * (heroCanvas.width / dpr);
                 this.y = y || Math.random() * (heroCanvas.height / dpr);
                 this.size = Math.random() * 2.5 + 1;
                 this.baseX = this.x;
                 this.baseY = this.y;
                 this.density = (Math.random() * 40) + 5;
                 this.opacity = Math.random() * 0.5 + 0.2;
                 this.updateColor();
             }
             updateColor() {
                 this.color = document.body.classList.contains('dark-mode') ? 'rgba(255, 165, 128, 0.7)' : 'rgba(255, 149, 102, 0.6)'; // Updated colors
             }
             draw() {
                 ctx.fillStyle = this.color.replace(/[\d\.]+\)$/g, `${this.opacity})`);
                 ctx.beginPath();
                 ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                 ctx.closePath();
                 ctx.fill();
             }
             update() {
                 let dx = mouse.x - this.x;
                 let dy = mouse.y - this.y;
                 let distance = Math.sqrt(dx * dx + dy * dy);
                 let forceDirectionX = 0, forceDirectionY = 0;
                 if (distance !== 0) {
                     forceDirectionX = dx / distance;
                     forceDirectionY = dy / distance;
                 }
                 let force = Math.max(0, (mouse.radius - distance) / mouse.radius);
                 let directionX = (forceDirectionX * force * this.density);
                 let directionY = (forceDirectionY * force * this.density);

                 if (distance < mouse.radius && mouse.x !== null) {
                     this.x -= directionX * 0.1;
                     this.y -= directionY * 0.1;
                 } else {
                     if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
                     if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
                     this.x += (Math.random() - 0.5) * 0.3;
                     this.y += (Math.random() - 0.5) * 0.3;
                 }

                  const scaledWidth = heroCanvas.width / dpr;
                  const scaledHeight = heroCanvas.height / dpr;
                  this.x = Math.max(0, Math.min(scaledWidth, this.x));
                  this.y = Math.max(0, Math.min(scaledHeight, this.y));
             }
        }

        function initParticles() {
            particles = [];
            const scaledWidth = heroCanvas.width / dpr;
            const scaledHeight = heroCanvas.height / dpr;
            let numberOfParticles = (scaledWidth * scaledHeight) / 9000;
            numberOfParticles = Math.min(Math.max(numberOfParticles, 150), 450);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        }

        window.updateHeroParticlesColor = () => particles.forEach(p => p.updateColor());

        function animateParticles() {
            ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animateParticles);
        }

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                initParticles();
            }, 250);
        });

        document.addEventListener("visibilitychange", () => {
             if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null; // Reset ID
             } else if (heroCanvas && !animationFrameId) {
                 animateParticles();
             }
        });

        resizeCanvas();
        initParticles();
        animateParticles();
    }


    // --- Team Member Counter ---
    const departmentBlocks = document.querySelectorAll('.department-block');
    if (departmentBlocks.length > 0) {
        departmentBlocks.forEach(block => {
            const hodContainer = block.querySelector('.hod-container');
            const memberContainer = block.querySelector('.member-container');
            const headerWrapper = block.querySelector('.department-header-wrapper');
            const hodCount = hodContainer ? hodContainer.querySelectorAll('.profile-card.hod-card').length : 0;
            const memberCount = memberContainer ? memberContainer.querySelectorAll('.profile-card.member-card').length : 0;
            const totalCount = hodCount + memberCount;

            if (headerWrapper && totalCount > 0) {
                 let countSpan = headerWrapper.querySelector('.member-count');
                 if (!countSpan) {
                     countSpan = document.createElement('span');
                     countSpan.classList.add('member-count');
                     headerWrapper.appendChild(countSpan);
                 }
                countSpan.textContent = `${totalCount} Member${totalCount > 1 ? 's' : ''}`;
            } else if (headerWrapper && block.id === 'core-ministry' && hodCount > 0) {
                let countSpan = headerWrapper.querySelector('.member-count');
                if (!countSpan) {
                    countSpan = document.createElement('span');
                    countSpan.classList.add('member-count');
                    headerWrapper.appendChild(countSpan);
                }
                countSpan.textContent = `${hodCount} Leader${hodCount > 1 ? 's' : ''}`;
            }
        });
    }


    // --- Calendar Page Logic (with Event Titles) ---
    const calendarGrid = document.getElementById('calendar-grid-view');
    const eventList = document.getElementById('event-list-view');
    const monthYearDisplay = document.getElementById('monthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const calendarViewBtn = document.getElementById('calendarViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const calendarViewDiv = document.getElementById('calendar-view');
    const listViewDiv = document.getElementById('list-view');

    if (calendarGrid && eventList && monthYearDisplay) {
        let currentDate = new Date();
        let currentView = 'calendar';
        const events = [ // Sample data
            { date: '2025-04-13', time: '18:00', title: 'Baisakhi', description: ' Workshop & Activities.', location: 'Mess Lawns' },
            { date: '2025-04-19', time: '08:30', title: 'Samaras', description: 'Inclusive Sports Fest of Ashoka.', location: 'AC04 & Sports Block' },
            // Add more events as needed
        ];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        function renderCalendar(year, month) {
            const firstDayOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayWeekday = firstDayOfMonth.getDay();

            monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
            calendarGrid.innerHTML = '';

            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            weekdays.forEach(day => {
                const dowElement = document.createElement('div');
                dowElement.classList.add('calendar-dow');
                dowElement.textContent = day;
                calendarGrid.appendChild(dowElement);
            });

            for (let i = 0; i < firstDayWeekday; i++) {
                const blankDay = document.createElement('div');
                blankDay.classList.add('calendar-day', 'other-month');
                calendarGrid.appendChild(blankDay);
            }

            const today = new Date();
            const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day');
                const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                const dayNumberSpan = document.createElement('span');
                dayNumberSpan.classList.add('day-number');
                dayNumberSpan.textContent = day;
                dayElement.appendChild(dayNumberSpan);

                if (currentDateString === todayDateString) {
                    dayElement.classList.add('today');
                }

                const dayEvents = events.filter(event => event.date === currentDateString);

                if (dayEvents.length > 0) {
                    dayElement.classList.add('has-events');
                    dayElement.setAttribute('role', 'button');
                    dayElement.setAttribute('tabindex', '0');
                    dayElement.setAttribute('aria-label', `Events on ${monthNames[month]} ${day}`);
                    dayElement.addEventListener('click', () => switchToListAndHighlight(currentDateString));
                    dayElement.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            switchToListAndHighlight(currentDateString);
                        }
                    });

                    const eventsContainer = document.createElement('div');
                    eventsContainer.classList.add('calendar-event-titles');
                    const maxTitlesToShow = 2;

                    dayEvents.slice(0, maxTitlesToShow).forEach(event => {
                        const eventTitleElement = document.createElement('div');
                        eventTitleElement.classList.add('calendar-event-title');
                        eventTitleElement.textContent = event.title;
                        eventTitleElement.title = `${event.title}${event.time ? ' ('+event.time+')' : ''}`;
                        eventsContainer.appendChild(eventTitleElement);
                    });

                    if (dayEvents.length > maxTitlesToShow) {
                         const moreIndicator = document.createElement('div');
                         moreIndicator.classList.add('calendar-event-more-indicator');
                         moreIndicator.textContent = `+${dayEvents.length - maxTitlesToShow} more`;
                         moreIndicator.title = `${dayEvents.length - maxTitlesToShow} more event(s) on this day`;
                         eventsContainer.appendChild(moreIndicator);
                    }
                    dayElement.appendChild(eventsContainer);
                }
                calendarGrid.appendChild(dayElement);
            }

             const totalDaysRendered = firstDayWeekday + daysInMonth;
             const remainingCells = (7 - (totalDaysRendered % 7)) % 7;
             for (let i = 0; i < remainingCells; i++) {
                 const blankDay = document.createElement('div');
                 blankDay.classList.add('calendar-day', 'other-month');
                 calendarGrid.appendChild(blankDay);
             }

            if (calendarViewDiv) calendarViewDiv.style.display = 'block';
            if (listViewDiv) listViewDiv.style.display = 'none';
            calendarViewBtn?.classList.add('active');
            listViewBtn?.classList.remove('active');
        }

        function renderList(year, month, highlightDate = null) {
            monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
            eventList.innerHTML = '';

            const monthEvents = events
                .filter(event => {
                    const eventDate = new Date(event.date + 'T00:00:00');
                    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
                })
                .sort((a, b) => {
                    const timeA = a.time === 'All Day' ? '00:00' : (a.time?.includes(':') ? a.time : '00:00');
                    const timeB = b.time === 'All Day' ? '00:00' : (b.time?.includes(':') ? b.time : '00:00');
                    const dateA = new Date(`${a.date}T${timeA}:00`);
                    const dateB = new Date(`${b.date}T${timeB}:00`);
                    if (a.date !== b.date) {
                        return new Date(a.date) - new Date(b.date);
                    } else {
                       if (a.time === 'All Day' && b.time !== 'All Day') return -1;
                       if (a.time !== 'All Day' && b.time === 'All Day') return 1;
                       return dateA - dateB;
                    }
                });

            if (monthEvents.length === 0) {
                eventList.innerHTML = '<p class="no-events-message">No events scheduled for this month.</p>';
            } else {
                 let firstHighlightItem = null;
                monthEvents.forEach(event => {
                    const item = document.createElement('div');
                    item.classList.add('event-list-item', 'fade-in');
                    const eventDate = new Date(event.date + 'T00:00:00');

                    if (event.date === highlightDate) {
                        item.classList.add('highlighted');
                         if (!firstHighlightItem) firstHighlightItem = item;
                    }

                    item.innerHTML = `
                        <div class="event-date">
                            <span class="day">${eventDate.getDate()}</span>
                            <span class="month">${monthNames[eventDate.getMonth()].substring(0, 3)}</span>
                        </div>
                        <div class="event-details">
                            <h4>${event.title}</h4>
                            ${event.description ? `<p>${event.description}</p>` : ''}
                            <div class="event-meta">
                              ${event.time && event.time !== 'All Day' ? `<span class="event-time"><i class="far fa-clock"></i> ${event.time}</span>` : event.time === 'All Day' ? `<span class="event-time"><i class="far fa-calendar-check"></i> All Day</span>` : ''}
                              ${event.location ? `<span class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</span>` : ''}
                            </div>
                        </div>
                    `;
                    eventList.appendChild(item);
                     requestAnimationFrame(() => { item.classList.add('visible'); });
                });

                 if (firstHighlightItem) {
                      setTimeout(() => { firstHighlightItem.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
                 }
            }

            if (calendarViewDiv) calendarViewDiv.style.display = 'none';
            if (listViewDiv) listViewDiv.style.display = 'block';
            calendarViewBtn?.classList.remove('active');
            listViewBtn?.classList.add('active');
        }

        function changeMonth(offset) {
            currentDate.setMonth(currentDate.getMonth() + offset);
            if (currentView === 'calendar') renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
            else renderList(currentDate.getFullYear(), currentDate.getMonth());
        }

        function switchView(view) {
            if (currentView === view) return;
            currentView = view;
            if (currentView === 'calendar') renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
            else renderList(currentDate.getFullYear(), currentDate.getMonth());
        }

        function switchToListAndHighlight(dateString) {
            currentView = 'list';
            const targetDate = new Date(dateString + 'T00:00:00');
            currentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            renderList(targetDate.getFullYear(), targetDate.getMonth(), dateString);
        }

        if (currentView === 'calendar') renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        else renderList(currentDate.getFullYear(), currentDate.getMonth());

        prevMonthBtn?.addEventListener('click', () => changeMonth(-1));
        nextMonthBtn?.addEventListener('click', () => changeMonth(1));
        calendarViewBtn?.addEventListener('click', () => switchView('calendar'));
        listViewBtn?.addEventListener('click', () => switchView('list'));
    }


    // --- Awaaz Lines Canvas Animation ---
    const awaazCanvas = document.getElementById('awaaz-lines-canvas');
    if (awaazCanvas) {
        const ctx = awaazCanvas.getContext('2d');
        let lines = [];
        const numLines = 100; // Adjusted
        const maxDist = 300; // Adjusted
        let mouse = { x: null, y: null, radius: 120 };
        let animationFrameId_awaaz;
        const dpr_awaaz = window.devicePixelRatio || 1;

        function resizeAwaazCanvas() {
            const parentSection = awaazCanvas.closest('.awaaz-flipbook-bg');
            if (!parentSection) return;
            const rect = parentSection.getBoundingClientRect();
            awaazCanvas.width = rect.width * dpr_awaaz;
            awaazCanvas.height = rect.height * dpr_awaaz;
            ctx.scale(dpr_awaaz, dpr_awaaz);
            awaazCanvas.style.width = `${rect.width}px`;
            awaazCanvas.style.height = `${rect.height}px`;
        }

        const awaazContainer = awaazCanvas.closest('.container');
        if (awaazContainer) {
             awaazContainer.addEventListener('mousemove', (event) => {
                 const rect = awaazCanvas.getBoundingClientRect();
                 mouse.x = (event.clientX - rect.left);
                 mouse.y = (event.clientY - rect.top);
             });
             awaazContainer.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
        }

        class LinePoint {
             constructor() {
                 const scaledWidth = awaazCanvas.width / dpr_awaaz;
                 const scaledHeight = awaazCanvas.height / dpr_awaaz;
                this.x = Math.random() * scaledWidth;
                this.y = Math.random() * scaledHeight;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = 1.5;
                this.updateColor();
            }
            updateColor() {
                 this.color = body.classList.contains('dark-mode') ? 'rgba(255, 165, 128, 0.5)' : 'rgba(255, 149, 102, 0.4)'; // Updated colors
                 this.lineColor = body.classList.contains('dark-mode') ? 'rgba(255, 165, 128, 0.15)' : 'rgba(255, 149, 102, 0.1)'; // Updated colors
            }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill(); }
            update() {
                if (mouse.x !== null) {
                    let dx = this.x - mouse.x; let dy = this.y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance === 0) distance = 0.1;
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        this.x += (dx / distance) * force * 1.5; this.y += (dy / distance) * force * 1.5;
                        this.vx *= 0.9; this.vy *= 0.9;
                    }
                }
                this.x += this.vx; this.y += this.vy;
                const scaledWidth = awaazCanvas.width / dpr_awaaz; const scaledHeight = awaazCanvas.height / dpr_awaaz;
                if (this.x < 0 || this.x > scaledWidth) this.vx *= -1;
                if (this.y < 0 || this.y > scaledHeight) this.vy *= -1;
                this.x = Math.max(0, Math.min(scaledWidth, this.x)); this.y = Math.max(0, Math.min(scaledHeight, this.y));
            }
        }

        function initAwaazLines() { lines = []; for (let i = 0; i < numLines; i++) lines.push(new LinePoint()); }
        window.updateAwaazLinesColor = () => lines.forEach(p => p.updateColor());

        function connectLines() {
            for (let i = 0; i < lines.length; i++) {
                for (let j = i + 1; j < lines.length; j++) {
                     let dx = lines[i].x - lines[j].x; let dy = lines[i].y - lines[j].y;
                     let distance = Math.sqrt(dx * dx + dy * dy);
                     if (distance < maxDist) {
                         let opacity = 1 - (distance / maxDist);
                         ctx.strokeStyle = lines[i].lineColor.replace(/[\d\.]+\)$/g, `${opacity * 0.8})`);
                         ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(lines[i].x, lines[i].y); ctx.lineTo(lines[j].x, lines[j].y); ctx.stroke();
                     }
                }
            }
        }
        function animateAwaazLines() {
            ctx.clearRect(0, 0, awaazCanvas.width, awaazCanvas.height);
            lines.forEach(p => { p.update(); p.draw(); }); connectLines();
            animationFrameId_awaaz = requestAnimationFrame(animateAwaazLines);
        }

        let resizeTimeoutAwaaz;
        window.addEventListener('resize', () => {
             clearTimeout(resizeTimeoutAwaaz);
             resizeTimeoutAwaaz = setTimeout(() => { resizeAwaazCanvas(); initAwaazLines(); }, 250);
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) { cancelAnimationFrame(animationFrameId_awaaz); animationFrameId_awaaz = null; }
            else if (awaazCanvas && !animationFrameId_awaaz) { animateAwaazLines(); }
        });

        resizeAwaazCanvas(); initAwaazLines(); animateAwaazLines();
    }


    // --- Homepage Carousel Fullscreen Navigation Handler ---
    const homepageCarouselElement = document.getElementById('carouselExampleIndicators');
    if (homepageCarouselElement && homepageCarouselElement.classList.contains('carousel-fullscreen-nav')) {
        const carouselInstance = bootstrap.Carousel.getOrCreateInstance(homepageCarouselElement);
        const prevOverlay = homepageCarouselElement.querySelector('.carousel-nav-prev');
        const nextOverlay = homepageCarouselElement.querySelector('.carousel-nav-next');
        if (prevOverlay) prevOverlay.addEventListener('click', () => carouselInstance.prev());
        if (nextOverlay) nextOverlay.addEventListener('click', () => carouselInstance.next());
    }

    // --- Pets of Jazbaa Card Generation ---
if (document.getElementById('pets-card-container')) { // Check if on pets page
    let lastFlippedPetCard = null;

    function generatePetCards() {
        const container = document.getElementById("pets-card-container");
        if (!container) return; // Safety check
        container.innerHTML = ""; // Clear existing cards

        // The 'dogs' array is available globally from js/data.js
        if (typeof dogs !== 'undefined' && dogs.length > 0) {
            dogs.forEach(dog => {
                const card = document.createElement("div");
                card.classList.add("pet-card"); // Use new class name

                card.innerHTML = `
                    <div class="pet-card-inner">
                        <div class="pet-card-front">
                            <img src="${dog.image}" alt="${dog.name}">
                        </div>
                        <div class="pet-card-back">
                            <h3>${dog.name}</h3>
                            <p><strong>Parent:</strong> ${dog.parent}</p>
                            <p><strong>Age:</strong> ${dog.age}</p>
                            <p><strong>Personality:</strong> ${dog.personality}</p>
                        </div>
                    </div>
                `;

                card.addEventListener("click", (event) => {
                    event.stopPropagation();

                    if (lastFlippedPetCard && lastFlippedPetCard !== card) {
                        lastFlippedPetCard.classList.remove("flipped");
                    }

                    const isFlipped = card.classList.toggle("flipped");
                    lastFlippedPetCard = isFlipped ? card : null;
                });
                container.appendChild(card);
            });
        } else {
            container.innerHTML = "<p class='text-center text-muted'>No pet data found or 'dogs' array is empty.</p>";
        }
    }

    generatePetCards(); // Call the function to generate cards on page load

    // Close flipped card if clicking outside
    document.addEventListener('click', function (event) {
        if (lastFlippedPetCard && !lastFlippedPetCard.contains(event.target)) {
            lastFlippedPetCard.classList.remove('flipped');
            lastFlippedPetCard = null;
        }
    });
}

    // --- Particles.js for Pets Page ---
    if (document.getElementById('particles-js-pets')) {
        particlesJS.load('particles-js-pets', 'assets/particles.json', function() {
            console.log('particles.js config loaded for pets page');
            // Optional: Adjust particle color based on dark mode after loading
            // This depends on how particles.js allows runtime updates.
            // For now, particles.json might need separate light/dark versions or a generic color.
        });
    }

    
    // --- NEW Gallery Timeline Initialization (jQuery required) ---
    if (typeof jQuery !== 'undefined' && $('.cd-horizontal-timeline').length > 0) {
        jQuery(document).ready(function($){ // Ensure this wrapper remains
            var timelines = $('.cd-horizontal-timeline'),
                eventsMinDistance = 150, // Adjusted minimum distance
                edgePadding = 60;

            (timelines.length > 0) && initTimeline(timelines);

            function initTimeline(timelines) {
                timelines.each(function(){
                    var timeline = $(this), timelineComponents = {};
                    timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
                    timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
                    timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
                    timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
                    timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']);
                    timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
                    timelineComponents['eventsContent'] = timeline.children('.events-content');
                    timelineComponents['timelineTotWidth'] = 0;
                    timelineComponents['maxTranslate'] = 0;

                    setDatePosition(timelineComponents, eventsMinDistance, edgePadding);
                    timelineComponents['timelineTotWidth'] = setTimelineWidth(timelineComponents, edgePadding);
                    timelineComponents['maxTranslate'] = calculateMaxTranslate(timelineComponents);

                    timeline.addClass('loaded');

                    // Event Listeners
                    timelineComponents['timelineNavigation'].on('click', '.next', function(event){ event.preventDefault(); if (!$(this).hasClass('inactive')) { updateSlide(timelineComponents, 'next'); } });
                    timelineComponents['timelineNavigation'].on('click', '.prev', function(event){ event.preventDefault(); if (!$(this).hasClass('inactive')) { updateSlide(timelineComponents, 'prev'); } });
                    timelineComponents['eventsWrapper'].on('click', 'a', function(event){ event.preventDefault(); if (!$(this).hasClass('selected') && !$(this).parent('li').hasClass('selected')) { selectNewEvent($(this), timelineComponents); } });
                    enableContentSwipe(timelineComponents);
                    $(document).keyup(function(event){ if(event.which=='37' && elementInViewport(timeline.get(0)) ) { showNewContent(timelineComponents, 'prev'); } else if( event.which=='39' && elementInViewport(timeline.get(0))) { showNewContent(timelineComponents, 'next'); } });
                    $(window).on('resize orientationchange', debounce(function(){
                        setDatePosition(timelineComponents, eventsMinDistance, edgePadding);
                        timelineComponents['timelineTotWidth'] = setTimelineWidth(timelineComponents, edgePadding);
                        timelineComponents['maxTranslate'] = calculateMaxTranslate(timelineComponents);
                        var selectedContent = timelineComponents['eventsContent'].find('li.selected');
                        if(selectedContent.length > 0) { setTimeout(function() { if (selectedContent.is(':visible')) { var h = selectedContent.outerHeight(); timelineComponents['eventsContent'].css('height', h + 'px'); } }, 150); }
                        var currentTranslate = getTranslateValue(timelineComponents['eventsWrapper']);
                        translateTimeline(timelineComponents, currentTranslate);
                    }, 250));

                    // Initialize
                    var initialSelectedContent = timelineComponents['eventsContent'].find('li.selected');
                    var initialLink; // Declare outside if/else
                    if (initialSelectedContent.length > 0) {
                        initialSelectedContent.css('visibility', 'visible').css('opacity', '1').css('transform', 'translateX(0)');
                        setTimeout(function() { var h = initialSelectedContent.outerHeight(); timelineComponents['eventsContent'].css('height', h + 'px'); }, 100);
                        var initialDate = initialSelectedContent.data('date');
                        initialLink = timelineComponents['timelineEvents'].filter('[data-date="' + initialDate + '"]'); // Assign here
                        if (initialLink.length) {
                             if (!initialLink.hasClass('selected')) {
                                timelineComponents['timelineEvents'].removeClass('selected');
                                initialLink.addClass('selected');
                            }
                            if (!initialLink.parent('li').hasClass('selected')) {
                                 initialLink.parent('li').siblings().removeClass('selected');
                                 initialLink.parent('li').addClass('selected');
                             }
                             updateOlderEvents(initialLink);
                             updateFilling(initialLink, timelineComponents['fillingLine'], timelineComponents['timelineTotWidth']);
                        }
                    } else {
                         initialLink = timelineComponents['timelineEvents'].first(); // Assign here
                         if (initialLink.length) {
                              var firstEventDate = initialLink.data('date');
                              var firstEventContent = timelineComponents['eventsContent'].find('li[data-date="' + firstEventDate + '"]');
                              if(firstEventContent.length) {
                                  initialLink.addClass('selected');
                                  initialLink.parent('li').addClass('selected');
                                  firstEventContent.addClass('selected').css('visibility', 'visible').css('opacity', 1).css('transform', 'translateX(0)');
                                  updateOlderEvents(initialLink);
                                  updateFilling(initialLink, timelineComponents['fillingLine'], timelineComponents['timelineTotWidth']);
                                  setTimeout(function() { var h = firstEventContent.outerHeight(); timelineComponents['eventsContent'].css('height', h + 'px'); }, 100);
                              }
                         }
                    }
                    translateTimeline(timelineComponents, 0);

                });
            }

            function selectNewEvent(newEventLink, timelineComponents) {
                 var currentEventLink = timelineComponents['timelineEvents'].filter('.selected');
                 currentEventLink.removeClass('selected');
                 currentEventLink.parent('li').removeClass('selected');
                 newEventLink.addClass('selected');
                 newEventLink.parent('li').addClass('selected');
                 updateOlderEvents(newEventLink);
                 updateFilling(newEventLink, timelineComponents['fillingLine'], timelineComponents['timelineTotWidth']);
                 updateVisibleContent(newEventLink, timelineComponents['eventsContent']);
                 updateTimelinePosition('click', newEventLink, timelineComponents);
            }

            function updateSlide(timelineComponents, direction) {
                var translateValue = getTranslateValue(timelineComponents['eventsWrapper']);
                var wrapperWidth = timelineComponents['timelineWrapper'].width();
                var step = wrapperWidth * 0.7;
                var newTranslate = (direction === 'next') ? translateValue - step : translateValue + step;
                translateTimeline(timelineComponents, newTranslate);
            }

            function showNewContent(timelineComponents, direction) {
                var currentEventItem = timelineComponents['eventsWrapper'].find('li.selected');
                var newEventItem = (direction === 'next') ? currentEventItem.next('li') : currentEventItem.prev('li');
                if (newEventItem.length > 0) {
                    var newEventLink = newEventItem.children('a');
                    selectNewEvent(newEventLink, timelineComponents);
                }
            }

            function updateTimelinePosition(string, event, timelineComponents) {
                var maxTranslate = timelineComponents['maxTranslate'];
                var eventLeft = parseFloat(event.data('left-pos'));
                var timelineWrapperWidth = timelineComponents['timelineWrapper'].width();
                var currentTranslate = getTranslateValue(timelineComponents['eventsWrapper']);
                var targetTranslate = timelineWrapperWidth / 2 - eventLeft;
                targetTranslate = Math.max(maxTranslate, Math.min(0, targetTranslate));
                var viewportLeft = -currentTranslate;
                var viewportRight = viewportLeft + timelineWrapperWidth;
                var buffer = timelineWrapperWidth * 0.1;
                if (string === 'next' || string === 'prev' || (string === 'click' && (eventLeft < viewportLeft + buffer || eventLeft > viewportRight - buffer))) {
                    translateTimeline(timelineComponents, targetTranslate);
                } else if (string === 'click') {
                    translateTimeline(timelineComponents, currentTranslate);
                }
            }

            function translateTimeline(timelineComponents, value) {
                var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
                var maxTranslate = timelineComponents['maxTranslate'];
                value = Math.max(maxTranslate, Math.min(0, value));
                setTransformValue(eventsWrapper, 'translateX', value + 'px');
                var inactiveMargin = 1;
                timelineComponents['timelineNavigation'].find('.prev').toggleClass('inactive', value >= -inactiveMargin);
                timelineComponents['timelineNavigation'].find('.next').toggleClass('inactive', value <= maxTranslate + inactiveMargin);
            }

            function updateFilling(selectedEvent, filling, totWidth) {
                 var eventLeft = parseFloat(selectedEvent.data('left-pos'));
                 if (isNaN(eventLeft)) eventLeft = parseFloat(selectedEvent.parent('li').css('left')) || 0;
                 var scaleValue = totWidth > 0 ? eventLeft / totWidth : 0;
                 scaleValue = Math.max(0, Math.min(1, scaleValue));
                 setTransformValue(filling.get(0), 'scaleX', scaleValue);
            }

            function setDatePosition(timelineComponents, minDistance, padding) {
                var timelineWrapperWidth = timelineComponents['timelineWrapper'].width();
                var totalEvents = timelineComponents['timelineEvents'].length;
                if (totalEvents < 1) return;
                var usableWidth = Math.max(0, timelineWrapperWidth - (2 * padding));
                var calculatedDistance;
                if (totalEvents > 1) { calculatedDistance = usableWidth / (totalEvents - 1); calculatedDistance = Math.max(calculatedDistance, minDistance); }
                else { calculatedDistance = 0; }
                for (var i = 0; i < totalEvents; i++) {
                     var currentEvent = timelineComponents['timelineEvents'].eq(i);
                     var positionToSet = (totalEvents === 1) ? timelineWrapperWidth / 2 : padding + (i * calculatedDistance);
                     currentEvent.data('left-pos', positionToSet);
                     currentEvent.parent('li').css('left', positionToSet + 'px');
                 }
            }

            function setTimelineWidth(timelineComponents, padding) {
                 var totalEvents = timelineComponents['timelineEvents'].length;
                 var totalWidth = 0; var wrapperWidth = timelineComponents['timelineWrapper'].width();
                 if (totalEvents > 0) {
                     var lastEvent = timelineComponents['timelineEvents'].last();
                     var lastEventPos = parseFloat(lastEvent.data('left-pos'));
                      if (isNaN(lastEventPos)) lastEventPos = parseFloat(lastEvent.parent('li').css('left')) || 0;
                     totalWidth = lastEventPos + padding;
                     totalWidth = Math.max(totalWidth, wrapperWidth);
                 } else { totalWidth = wrapperWidth; }
                 timelineComponents['eventsWrapper'].css('width', totalWidth + 'px');
                 timelineComponents['timelineTotWidth'] = totalWidth;
                 var selectedEvent = timelineComponents['timelineEvents'].filter('.selected').first();
                  if (selectedEvent.length) { if (!selectedEvent.parent('li').hasClass('selected')) selectedEvent.parent('li').addClass('selected'); updateFilling(selectedEvent, timelineComponents['fillingLine'], totalWidth); }
                  else if (totalEvents > 0) { var firstEvent = timelineComponents['timelineEvents'].first(); if (firstEvent.length) { if (!firstEvent.hasClass('selected')) { firstEvent.addClass('selected'); firstEvent.parent('li').addClass('selected'); } updateFilling(firstEvent, timelineComponents['fillingLine'], totalWidth); updateOlderEvents(firstEvent); } }
                 return totalWidth;
            }

            function updateVisibleContent(newEvent, eventsContent) {
                var eventDate = newEvent.data('date');
                var newContent = eventsContent.find('li[data-date="' + eventDate + '"]');
                var visibleContent = eventsContent.find('li.selected');
                if (newContent.is(visibleContent) || newContent.length === 0) { if (newContent.length > 0) { var currentHeight = newContent.outerHeight(); eventsContent.stop().animate({ height: currentHeight + 'px' }, 300); } return; }
                var newContentHeight = newContent.outerHeight();
                var animationClassEntering, animationClassLeaving;
                if (newContent.index() > visibleContent.index()) { animationClassEntering = 'enter-right'; animationClassLeaving = 'leave-left'; }
                else { animationClassEntering = 'enter-left'; animationClassLeaving = 'leave-right'; }
                eventsContent.css('height', visibleContent.outerHeight() + 'px');
                visibleContent.removeClass('selected');
                newContent.addClass('selected').css('visibility', 'visible');
                eventsContent.stop().animate({ height: newContentHeight + 'px' }, 400, 'swing');
                visibleContent.addClass(animationClassLeaving);
                newContent.addClass(animationClassEntering);
                eventsContent.off('animationend webkitAnimationEnd');
                eventsContent.one('animationend webkitAnimationEnd', 'li.' + animationClassLeaving + ', li.' + animationClassEntering, function(e) {
                     var $this = $(this);
                     if ($this.hasClass(animationClassLeaving)) $this.css('visibility', 'hidden');
                     $this.removeClass('enter-right enter-left leave-right leave-left');
                });
                setTimeout(function() {
                    eventsContent.find('li').each(function() {
                         var $li = $(this);
                         $li.removeClass('enter-right enter-left leave-right leave-left');
                          if (!$li.hasClass('selected')) $li.css('visibility', 'hidden');
                          else $li.css('visibility', 'visible');
                    });
                     var finalSelectedContent = eventsContent.find('li.selected');
                     if (finalSelectedContent.length > 0) eventsContent.css('height', finalSelectedContent.outerHeight() + 'px');
                }, 550);
            }

            function updateOlderEvents(event) {
                var currentItem = event.parent('li');
                currentItem.prevAll('li').children('a').addClass('older-event');
                event.removeClass('older-event');
                currentItem.nextAll('li').children('a').removeClass('older-event');
            }

            function getTranslateValue(element) {
                var style = window.getComputedStyle(element.get(0));
                var matrix = style['transform'] || style.webkitTransform || style.mozTransform;
                if (!matrix || matrix === 'none') return 0;
                var matrixType = matrix.includes('3d') ? '3d' : '2d';
                var matrixValues = matrix.match(/matrix.*\((.+)\)/);
                if (!matrixValues) return 0;
                matrixValues = matrixValues[1].split(', ');
                if (matrixType === '2d') return parseFloat(matrixValues[4]) || 0;
                else return parseFloat(matrixValues[12]) || 0;
            }

            function setTransformValue(element, property, value) { element.style["transform"] = property + "(" + value + ")"; }

            function parseDate(events) {
                 var dateArrays = [];
                 events.each(function(){
                     var dateStr = $(this).data('date');
                     var dateComp = dateStr ? dateStr.split('/') : null;
                     if (dateComp && dateComp.length === 3) {
                         var day = parseInt(dateComp[0], 10); var month = parseInt(dateComp[1], 10) - 1; var year = parseInt(dateComp[2], 10);
                         var newDate = new Date(Date.UTC(year, month, day));
                         if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900 && year < 2100 && !isNaN(newDate.getTime())) { dateArrays.push(newDate); }
                         else { dateArrays.push(null); }
                     } else { dateArrays.push(null); }
                 });
                 return dateArrays;
            }

            function elementInViewport(el) { if (!el) return false; var rect = el.getBoundingClientRect(); return ( rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth) ); }
            function checkMQ() { var content = window.getComputedStyle(document.querySelector('.cd-horizontal-timeline'), '::before').getPropertyValue('content'); return content.replace(/^['"]|['"]$/g, ""); }
            function calculateMaxTranslate(timelineComponents) { var wrapperWidth = timelineComponents['timelineWrapper'].width(); var timelineWidth = timelineComponents['timelineTotWidth'] || 0; return Math.min(0, wrapperWidth - timelineWidth); }

             function enableContentSwipe(timelineComponents) {
                var contentElement = timelineComponents['eventsContent'];
                 var touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
                 var isScrollingGallery = false; var isPotentialSwipe = false;
                 var swipeThreshold = 60, scrollThreshold = 40;
                 contentElement.on('touchstart', function(event) {
                     isScrollingGallery = $(event.target).closest('.gallery').length > 0; isPotentialSwipe = false;
                     if (isScrollingGallery) { touchStartX = 0; return; }
                     touchStartX = event.originalEvent.touches[0].screenX; touchStartY = event.originalEvent.touches[0].screenY; touchEndX = 0; touchEndY = 0;
                 }, { passive: true });
                 contentElement.on('touchmove', function(event) {
                     if (isScrollingGallery || touchStartX === 0) return;
                     var currentX = event.originalEvent.touches[0].screenX; var currentY = event.originalEvent.touches[0].screenY;
                     touchEndX = currentX; touchEndY = currentY;
                     var deltaX = Math.abs(currentX - touchStartX); var deltaY = Math.abs(currentY - touchStartY);
                     if (deltaX > deltaY && deltaX > 10) { isPotentialSwipe = true; event.preventDefault(); }
                     else { isPotentialSwipe = false; }
                 }, { passive: false });
                 contentElement.on('touchend', function(event) {
                     if (isScrollingGallery || touchStartX === 0) { isScrollingGallery = false; touchStartX = 0; return; }
                     if (touchEndX === 0) { touchEndX = event.originalEvent.changedTouches[0].screenX; }
                     if (touchEndY === 0) { touchEndY = event.originalEvent.changedTouches[0].screenY; }
                     var deltaX = touchEndX - touchStartX; var deltaY = touchEndY - touchStartY;
                     if (Math.abs(deltaY) > scrollThreshold && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) { /* Vertical scroll */ }
                     else if (Math.abs(deltaX) > swipeThreshold) { if (deltaX < 0) { showNewContent(timelineComponents, 'next'); } else { showNewContent(timelineComponents, 'prev'); } }
                     touchStartX = touchEndX = touchStartY = touchEndY = 0; isScrollingGallery = false; isPotentialSwipe = false;
                 });
             }

        }); // End jQuery Gallery Script
    } else if ($('.cd-horizontal-timeline').length > 0) {
        console.warn("jQuery not loaded or timeline element not found. New Gallery functionality might be missing.");
    }


}); // End DOMContentLoaded


// --- Utility function ---
function debounce(func, wait, immediate) {
var timeout;
return function() {
    var context = this, args = arguments;
    var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
};
};