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
      if (window.updateHeroParticlesColor) setTimeout(window.updateHeroParticlesColor, 50);
      if (window.updateAwaazLinesColor) setTimeout(window.updateAwaazLinesColor, 50);
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
          // Encode the color properly for the SVG data URI
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
          ctx.scale(dpr, dpr); // Scale context once after setting size
          heroCanvas.style.width = `${rect.width}px`;
          heroCanvas.style.height = `${rect.height}px`;
      }

      const heroSection = heroCanvas.parentElement;
       if (heroSection) {
         // Get rect inside event listeners to account for layout shifts
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
               // Use scaled dimensions for initial placement
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
                this.color = document.body.classList.contains('dark-mode') ? 'rgba(255, 165, 0, 0.7)' : 'rgba(210, 105, 30, 0.6)';
           }
           draw() {
               ctx.fillStyle = this.color.replace(/[\d\.]+\)$/g, `${this.opacity})`);
               ctx.beginPath();
               ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
               ctx.closePath();
               ctx.fill();
           }
           update() {
               // Mouse interaction calculation is based on unscaled coordinates
               let dx = mouse.x - this.x;
               let dy = mouse.y - this.y;
               let distance = Math.sqrt(dx * dx + dy * dy);
               let forceDirectionX = dx / distance;
               let forceDirectionY = dy / distance;
               // Avoid division by zero
               if (distance === 0) {
                   forceDirectionX = 0;
                   forceDirectionY = 0;
               }
               let force = Math.max(0, (mouse.radius - distance) / mouse.radius);
               let directionX = (forceDirectionX * force * this.density);
               let directionY = (forceDirectionY * force * this.density);

               if (distance < mouse.radius && mouse.x !== null) {
                   this.x -= directionX * 0.1;
                   this.y -= directionY * 0.1;
               } else {
                   // Return to base position
                   if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
                   if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
                   // Jitter when mouse is away or null
                   this.x += (Math.random() - 0.5) * 0.3;
                   this.y += (Math.random() - 0.5) * 0.3;
               }

                // Boundary checks using scaled dimensions
                const scaledWidth = heroCanvas.width / dpr;
                const scaledHeight = heroCanvas.height / dpr;
                if (this.x < 0) this.x = 0;
                if (this.x > scaledWidth) this.x = scaledWidth;
                if (this.y < 0) this.y = 0;
                if (this.y > scaledHeight) this.y = scaledHeight;
           }
      }

      function initParticles() {
          particles = [];
          const scaledWidth = heroCanvas.width / dpr;
          const scaledHeight = heroCanvas.height / dpr;
          let numberOfParticles = (scaledWidth * scaledHeight) / 9000;
          numberOfParticles = Math.min(Math.max(numberOfParticles, 1000), 1500); // Clamp particle count
          for (let i = 0; i < numberOfParticles; i++) {
              particles.push(new Particle());
          }
      }

      window.updateHeroParticlesColor = () => particles.forEach(p => p.updateColor());

      function animateParticles() {
          ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height); // Use raw width/height for clearRect
          particles.forEach(p => { p.update(); p.draw(); });
          animationFrameId = requestAnimationFrame(animateParticles);
      }

      // Debounce resize handler
      let resizeTimeout;
      window.addEventListener('resize', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
              resizeCanvas();
              initParticles();
              // No need to restart animation here if it's already running via visibilitychange
          }, 250);
      });

      // Handle visibility changes
      document.addEventListener("visibilitychange", () => {
           if (document.hidden) {
              cancelAnimationFrame(animationFrameId);
           } else if (heroCanvas) { // Check if canvas still exists
               // Restart animation only if it was previously cancelled
               if (!animationFrameId) {
                    animateParticles();
               }
           }
      });


      // Initial setup
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
              // Special case for Core Ministry if it has no 'members' but only 'leaders'
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
      let currentView = 'calendar'; // Default view
      // Sample events data (replace with your actual events)
      const events = [
          // November 2024
          { date: '2024-11-15', time: '18:00', title: 'Shaam-e-Jazbaa \'24', description: 'Ashoka\'s grand annual cultural evening. Performances, food, and festive vibes!', location: 'MPH Stage' },
          { date: '2024-11-20', time: '19:00', title: 'Open Mic Night', description: 'Share your poetry, music, comedy, or stories under the stars.', location: 'Amphitheatre' },
          { date: '2024-11-20', time: '10:00', title: 'Workshop: Madhubani Art', description: 'Learn the basics of this beautiful traditional Indian art form. Materials provided.', location: 'Art Studio (SH4)' },
          { date: '2024-11-28', time: '17:30', title: 'Film Screening: "Court"', description: 'Screening and discussion of the acclaimed Indian courtroom drama.', location: 'LH 002' },
          // December 2024
          { date: '2024-12-01', time: 'All Day', title: 'Inter-Uni Fest Auditions', description: 'Auditions for dance, drama, and music teams representing Ashoka.', location: 'Various (Check SLO notice)' },
          { date: '2024-12-05', time: '17:00', title: 'Noor-e-Jazbaa', description: 'An evening dedicated to the elegance of Urdu poetry (Shayari) and soulful Ghazals.', location: 'Lecture Hall 3' },
          { date: '2024-12-10', time: '14:00', title: 'Workshop: Calligraphy', description: 'Introduction to basic calligraphy strokes and styles.', location: 'Common Room, SH2' },
          { date: '2024-12-18', time: '19:00', title: 'Karaoke Night', description: 'Sing your heart out! End-of-semester stress buster.', location: 'Mess Hall Annex' },
          { date: '2024-12-24', time: '20:00', title: 'Winter Ball Pre-Event Mixer', description: 'Get hyped for the Winter Ball with music and mocktails.', location: 'DH1 Lounge' },
          // January 2025
          { date: '2025-01-10', time: '20:00', title: 'Winter Ball 2025', description: 'The most awaited formal event of the year! Dress to impress.', location: 'MPH' },
          { date: '2025-01-18', time: '11:00', title: 'Heritage Walk: Mehrauli', description: 'Explore the historical Mehrauli Archaeological Park (Off-campus, sign-up required).', location: 'Bus Departs from Gate 1' },
          { date: '2025-01-26', time: '09:00', title: 'Republic Day Flag Hoisting', description: 'Campus community gathering.', location: 'Flagpole Area' },
          // February 2025
          { date: '2025-02-05', time: '18:30', title: 'Classical Music Concert', description: 'Featuring talented student musicians.', location: 'MPH' },
          { date: '2025-02-14', time: '19:00', title: 'Valentine\'s Day Acoustic Evening', description: 'Romantic tunes and chill vibes.', location: 'Amphitheatre' },
          { date: '2025-02-22', time: '13:00', title: 'Food Festival: Taste of India', description: 'Experience diverse regional cuisines prepared by student groups.', location: 'Football Ground Area' },
          // March 2025
          { date: '2025-03-01', time: '16:00', title: 'Holi Pre-Celebration', description: 'Music, colours (eco-friendly), and fun!', location: 'Near Volleyball Courts' },
          { date: '2025-03-08', time: '14:00', title: 'Women\'s Day Panel & Showcase', description: 'Inspiring talks and performances celebrating women.', location: 'Lecture Hall 1' },
          { date: '2025-03-15', time: '19:00', title: 'Theatre Production: "Untitled"', description: 'Ashoka Theatre Society presents its latest play.', location: 'Black Box Theatre' },
          // April 2025 (Example)
          { date: '2025-04-05', time: '10:00', title: 'Gardening Workshop', description: 'Learn basic gardening skills and help beautify the campus.', location: 'Near SH1 Lawns' },
          { date: '2025-04-12', time: '19:30', title: 'Inter-Hostel Dance Off', description: 'Hostels compete for the ultimate dance trophy.', location: 'MPH' },
       ];
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      function renderCalendar(year, month) {
          const firstDayOfMonth = new Date(year, month, 1);
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const firstDayWeekday = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon...

          monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
          calendarGrid.innerHTML = ''; // Clear previous grid

          // Add weekday headers
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          weekdays.forEach(day => {
              const dowElement = document.createElement('div');
              dowElement.classList.add('calendar-dow');
              dowElement.textContent = day;
              calendarGrid.appendChild(dowElement);
          });

          // Add blank days for the start of the month
          for (let i = 0; i < firstDayWeekday; i++) {
              const blankDay = document.createElement('div');
              blankDay.classList.add('calendar-day', 'other-month');
              calendarGrid.appendChild(blankDay);
          }

          // Add days of the month
          const today = new Date();
          const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          for (let day = 1; day <= daysInMonth; day++) {
              const dayElement = document.createElement('div');
              dayElement.classList.add('calendar-day');
              const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              // Add day number
              const dayNumberSpan = document.createElement('span');
              dayNumberSpan.classList.add('day-number');
              dayNumberSpan.textContent = day;
              dayElement.appendChild(dayNumberSpan);

              // Highlight today
              if (currentDateString === todayDateString) {
                  dayElement.classList.add('today');
              }

              // Find events for this day
              const dayEvents = events.filter(event => event.date === currentDateString);

              if (dayEvents.length > 0) {
                  dayElement.classList.add('has-events');
                  dayElement.setAttribute('role', 'button');
                  dayElement.setAttribute('tabindex', '0'); // Make focusable
                  dayElement.setAttribute('aria-label', `Events on ${monthNames[month]} ${day}`);
                  dayElement.addEventListener('click', () => switchToListAndHighlight(currentDateString));
                  dayElement.addEventListener('keydown', (e) => { // Keyboard activation
                      if (e.key === 'Enter' || e.key === ' ') {
                          switchToListAndHighlight(currentDateString);
                      }
                  });


                  // Display first 1-2 event titles directly
                  const eventsContainer = document.createElement('div');
                  eventsContainer.classList.add('calendar-event-titles');
                  const maxTitlesToShow = 2; // Adjust as needed

                  dayEvents.slice(0, maxTitlesToShow).forEach(event => {
                      const eventTitleElement = document.createElement('div');
                      eventTitleElement.classList.add('calendar-event-title');
                      eventTitleElement.textContent = event.title; // Show full title, CSS handles overflow
                      eventTitleElement.title = `${event.title}${event.time ? ' ('+event.time+')' : ''}`; // Tooltip for full info
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

          // Add blank days for the end of the month
           const totalDaysRendered = firstDayWeekday + daysInMonth;
           const remainingCells = (7 - (totalDaysRendered % 7)) % 7; // Ensure it wraps correctly
           for (let i = 0; i < remainingCells; i++) {
               const blankDay = document.createElement('div');
               blankDay.classList.add('calendar-day', 'other-month');
               calendarGrid.appendChild(blankDay);
           }

          // Ensure correct view is displayed
          if (calendarViewDiv) calendarViewDiv.style.display = 'block';
          if (listViewDiv) listViewDiv.style.display = 'none';
          calendarViewBtn?.classList.add('active');
          listViewBtn?.classList.remove('active');
      }

      function renderList(year, month, highlightDate = null) {
          monthYearDisplay.textContent = `${monthNames[month]} ${year}`;
          eventList.innerHTML = ''; // Clear previous list

          const monthEvents = events
              .filter(event => {
                  const eventDate = new Date(event.date + 'T00:00:00'); // Ensure parsing as local time start of day
                  return eventDate.getFullYear() === year && eventDate.getMonth() === month;
              })
              .sort((a, b) => {
                  // Sort by date first, then by time (handle 'All Day')
                  const timeA = a.time === 'All Day' ? '00:00' : (a.time?.includes(':') ? a.time : '00:00');
                  const timeB = b.time === 'All Day' ? '00:00' : (b.time?.includes(':') ? b.time : '00:00');
                  const dateA = new Date(`${a.date}T${timeA}:00`);
                  const dateB = new Date(`${b.date}T${timeB}:00`);
                  if (a.date !== b.date) {
                      return new Date(a.date) - new Date(b.date);
                  } else {
                       // If dates are same, sort by time
                       if (a.time === 'All Day' && b.time !== 'All Day') return -1; // All day first
                       if (a.time !== 'All Day' && b.time === 'All Day') return 1;  // All day first
                       return dateA - dateB; // Regular time comparison
                  }
              });

          if (monthEvents.length === 0) {
              eventList.innerHTML = '<p class="no-events-message">No events scheduled for this month.</p>';
          } else {
               let firstHighlightItem = null;
              monthEvents.forEach(event => {
                  const item = document.createElement('div');
                  item.classList.add('event-list-item', 'fade-in'); // Add fade-in class
                  const eventDate = new Date(event.date + 'T00:00:00');

                  if (event.date === highlightDate) {
                      item.classList.add('highlighted');
                       if (!firstHighlightItem) firstHighlightItem = item; // Track the first item to scroll to
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
                   // Trigger fade-in animation slightly after appending
                   requestAnimationFrame(() => {
                       item.classList.add('visible');
                   });
              });

               // Scroll the first highlighted item into view smoothly
               if (firstHighlightItem) {
                    setTimeout(() => {
                        firstHighlightItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100); // Small delay ensures element is ready
               }
          }

          // Ensure correct view is displayed
          if (calendarViewDiv) calendarViewDiv.style.display = 'none';
          if (listViewDiv) listViewDiv.style.display = 'block';
          calendarViewBtn?.classList.remove('active');
          listViewBtn?.classList.add('active');
      }

      function changeMonth(offset) {
          currentDate.setMonth(currentDate.getMonth() + offset);
          if (currentView === 'calendar') {
              renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
          } else {
              renderList(currentDate.getFullYear(), currentDate.getMonth());
          }
      }

      function switchView(view) {
          if (currentView === view) return; // No change
          currentView = view;
          if (currentView === 'calendar') {
              renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
          } else {
              renderList(currentDate.getFullYear(), currentDate.getMonth());
          }
      }

      function switchToListAndHighlight(dateString) {
          currentView = 'list'; // Switch view mode
          const targetDate = new Date(dateString + 'T00:00:00');
          // Set the calendar's current month to the month of the clicked date
          currentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
          // Render the list view for that month, highlighting the clicked date
          renderList(targetDate.getFullYear(), targetDate.getMonth(), dateString);
      }


      // Initial Render
      if (currentView === 'calendar') renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
      else renderList(currentDate.getFullYear(), currentDate.getMonth());

      // Event Listeners
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
      const numLines = 100;
      const maxDist = 300;
      let mouse = { x: null, y: null, radius: 120 };
      let animationFrameId_awaaz; // Use specific ID
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
           // Add touch listeners if needed
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
               this.color = body.classList.contains('dark-mode') ? 'rgba(255, 165, 0, 0.5)' : 'rgba(210, 105, 30, 0.4)';
               this.lineColor = body.classList.contains('dark-mode') ? 'rgba(255, 165, 0, 0.15)' : 'rgba(210, 105, 30, 0.1)';
          }
          draw() {
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
              ctx.fillStyle = this.color;
              ctx.fill();
          }
          update() {
               // Interaction based on unscaled mouse coords
              if (mouse.x !== null) {
                  let dx = this.x - mouse.x;
                  let dy = this.y - mouse.y;
                  let distance = Math.sqrt(dx * dx + dy * dy);
                  if (distance === 0) distance = 0.1; // Avoid division by zero
                  if (distance < mouse.radius) {
                      let force = (mouse.radius - distance) / mouse.radius;
                      this.x += (dx / distance) * force * 1.5;
                      this.y += (dy / distance) * force * 1.5;
                      this.vx *= 0.9; this.vy *= 0.9; // Dampen velocity during interaction
                  }
              }
              // Apply velocity
              this.x += this.vx; this.y += this.vy;

               // Boundary checks using scaled dimensions
               const scaledWidth = awaazCanvas.width / dpr_awaaz;
               const scaledHeight = awaazCanvas.height / dpr_awaaz;
               if (this.x < 0 || this.x > scaledWidth) this.vx *= -1;
               if (this.y < 0 || this.y > scaledHeight) this.vy *= -1;

               // Clamp position to stay within bounds strictly
               this.x = Math.max(0, Math.min(scaledWidth, this.x));
               this.y = Math.max(0, Math.min(scaledHeight, this.y));
          }
      }

      function initAwaazLines() {
          lines = [];
          for (let i = 0; i < numLines; i++) lines.push(new LinePoint());
      }
      window.updateAwaazLinesColor = () => lines.forEach(p => p.updateColor());

      function connectLines() {
          for (let i = 0; i < lines.length; i++) {
              for (let j = i + 1; j < lines.length; j++) {
                   let dx = lines[i].x - lines[j].x; let dy = lines[i].y - lines[j].y;
                   let distance = Math.sqrt(dx * dx + dy * dy);
                   if (distance < maxDist) {
                       let opacity = 1 - (distance / maxDist);
                       ctx.strokeStyle = lines[i].lineColor.replace(/[\d\.]+\)$/g, `${opacity * 0.8})`); // Adjust opacity
                       ctx.lineWidth = 0.5; ctx.beginPath();
                       ctx.moveTo(lines[i].x, lines[i].y); ctx.lineTo(lines[j].x, lines[j].y);
                       ctx.stroke();
                   }
              }
          }
      }
      function animateAwaazLines() {
          ctx.clearRect(0, 0, awaazCanvas.width, awaazCanvas.height); // Use raw dims
          lines.forEach(p => { p.update(); p.draw(); });
          connectLines();
          animationFrameId_awaaz = requestAnimationFrame(animateAwaazLines);
      }

      // Debounce resize handler for Awaaz canvas
      let resizeTimeoutAwaaz;
      window.addEventListener('resize', () => {
           clearTimeout(resizeTimeoutAwaaz);
           resizeTimeoutAwaaz = setTimeout(() => {
               resizeAwaazCanvas();
               initAwaazLines();
           }, 250);
      });

      // Handle visibility changes for Awaaz canvas
      document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
              cancelAnimationFrame(animationFrameId_awaaz);
               animationFrameId_awaaz = null; // Reset ID
           } else if (awaazCanvas && !animationFrameId_awaaz) { // Restart only if hidden and canvas exists
               animateAwaazLines();
           }
      });

      // Initial setup
      resizeAwaazCanvas();
      initAwaazLines();
      animateAwaazLines();
  }


  // --- Homepage Carousel Fullscreen Navigation Handler ---
  const homepageCarouselElement = document.getElementById('carouselExampleIndicators');
  if (homepageCarouselElement && homepageCarouselElement.classList.contains('carousel-fullscreen-nav')) {
      const carouselInstance = bootstrap.Carousel.getOrCreateInstance(homepageCarouselElement);

      const prevOverlay = homepageCarouselElement.querySelector('.carousel-nav-prev');
      const nextOverlay = homepageCarouselElement.querySelector('.carousel-nav-next');

      if (prevOverlay) {
          prevOverlay.addEventListener('click', () => {
              carouselInstance.prev();
          });
      }
      if (nextOverlay) {
          nextOverlay.addEventListener('click', () => {
              carouselInstance.next();
          });
      }
  }


  // --- NEW Gallery Timeline Initialization (jQuery required) ---
  if (typeof jQuery !== 'undefined' && $('.cd-horizontal-timeline').length > 0) {
      // Paste the entire jQuery script from the new gallery.html here
      jQuery(document).ready(function($){ // Ensure this wrapper remains if pasting directly
          var timelines = $('.cd-horizontal-timeline'),
              // Define minimum distance (used if calculated space is too small)
              eventsMinDistance = 90, // Minimum px distance between events
              // Define padding from the edges of the timeline wrapper
              edgePadding = 60; // Px padding on left and right

          (timelines.length > 0) && initTimeline(timelines);

          function initTimeline(timelines) {
              timelines.each(function(){
                  var timeline = $(this),
                      timelineComponents = {};
                  // Cache components
                  timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
                  timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
                  timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
                  timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
                  timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']); // Keep for 'older-event' class logic
                  timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
                  timelineComponents['eventsContent'] = timeline.children('.events-content');
                  timelineComponents['timelineTotWidth'] = 0; // Will be calculated
                  timelineComponents['maxTranslate'] = 0; // Will be calculated

                  // --- Set event positions evenly with edge padding ---
                  setDatePosition(timelineComponents, eventsMinDistance, edgePadding);

                  // --- Calculate widths and limits based on new positions ---
                  timelineComponents['timelineTotWidth'] = setTimelineWidth(timelineComponents, edgePadding);
                  timelineComponents['maxTranslate'] = calculateMaxTranslate(timelineComponents);

                  timeline.addClass('loaded');

                  // --- Event Listeners ---
                  // Arrow navigation
                  timelineComponents['timelineNavigation'].on('click', '.next', function(event){
                      event.preventDefault();
                      if (!$(this).hasClass('inactive')) { updateSlide(timelineComponents, 'next'); }
                  });
                  timelineComponents['timelineNavigation'].on('click', '.prev', function(event){
                      event.preventDefault();
                       if (!$(this).hasClass('inactive')) { updateSlide(timelineComponents, 'prev'); }
                  });

                  // Click on event
                  timelineComponents['eventsWrapper'].on('click', 'a', function(event){
                      event.preventDefault();
                      // Check parent LI as well for clicks near the edge
                      if (!$(this).hasClass('selected') && !$(this).parent('li').hasClass('selected')) {
                           selectNewEvent($(this), timelineComponents);
                       }
                  });

                  // Content Swipe Gestures
                  enableContentSwipe(timelineComponents);

                  // Keyboard navigation
                  $(document).keyup(function(event){
                      if(event.which=='37' && elementInViewport(timeline.get(0)) ) { showNewContent(timelineComponents, 'prev'); }
                      else if( event.which=='39' && elementInViewport(timeline.get(0))) { showNewContent(timelineComponents, 'next'); }
                  });

                  // Resize handler
                  $(window).on('resize orientationchange', debounce(function(){ // Added debounce
                      // Recalculate positions, widths, and limits on resize
                      setDatePosition(timelineComponents, eventsMinDistance, edgePadding);
                      timelineComponents['timelineTotWidth'] = setTimelineWidth(timelineComponents, edgePadding);
                      timelineComponents['maxTranslate'] = calculateMaxTranslate(timelineComponents);

                      // Adjust content height
                      var selectedContent = timelineComponents['eventsContent'].find('li.selected');
                      if(selectedContent.length > 0) {
                           setTimeout(function() {
                               // Ensure element is visible before getting height
                               if (selectedContent.is(':visible')) {
                                  var h = selectedContent.outerHeight();
                                  timelineComponents['eventsContent'].css('height', h + 'px');
                               }
                           }, 150);
                      }

                      // Re-apply current translation to clamp if necessary and update arrows
                      var currentTranslate = getTranslateValue(timelineComponents['eventsWrapper']);
                      translateTimeline(timelineComponents, currentTranslate);
                  }, 250)); // Debounce resize handler

                  // Initialize height and arrow states
                  var initialSelectedContent = timelineComponents['eventsContent'].find('li.selected');
                  if (initialSelectedContent.length > 0) {
                       // Ensure it's visible before setting height
                       initialSelectedContent.css('visibility', 'visible').css('opacity', '1').css('transform', 'translateX(0)');
                      setTimeout(function() {
                          var h = initialSelectedContent.outerHeight();
                          timelineComponents['eventsContent'].css('height', h + 'px');
                      }, 100);
                      //Ensure the link is also selected if content is pre-selected
                      var initialDate = initialSelectedContent.data('date');
                      var initialLink = timelineComponents['timelineEvents'].filter('[data-date="' + initialDate + '"]');
                      if (initialLink.length && !initialLink.hasClass('selected')) {
                           timelineComponents['timelineEvents'].removeClass('selected'); // Deselect others
                           initialLink.addClass('selected');
                           initialLink.parent('li').addClass('selected'); // Select parent li too
                           updateOlderEvents(initialLink); // Update older class
                           updateFilling(initialLink, timelineComponents['fillingLine'], timelineComponents['timelineTotWidth']); // Update filling line
                      } else if (initialLink.length) {
                          // If link already selected, ensure parent li is too and update visuals
                          if (!initialLink.parent('li').hasClass('selected')) {
                              initialLink.parent('li').siblings().removeClass('selected');
                              initialLink.parent('li').addClass('selected');
                          }
                          updateOlderEvents(initialLink);
                          updateFilling(initialLink, timelineComponents['fillingLine'], timelineComponents['timelineTotWidth']);
                      }

                  } else {
                       // If no event is pre-selected, select the first one in the timeline order (which might be last visually)
                       var firstEventLink = timelineComponents['timelineEvents'].first(); // First in HTML source
                       if (firstEventLink.length) {
                           // Find corresponding content item
                            var firstEventDate = firstEventLink.data('date');
                            var firstEventContent = timelineComponents['eventsContent'].find('li[data-date="' + firstEventDate + '"]');
                            if(firstEventContent.length) {
                                // Select link, li, and content
                                firstEventLink.addClass('selected');
                                firstEventLink.parent('li').addClass('selected');
                                // Make the content visible immediately
                                firstEventContent.addClass('selected').css('visibility', 'visible').css('opacity', 1).css('transform', 'translateX(0)');
                                // Update visuals
                                updateOlderEvents(firstEventLink);
                                updateFilling(firstEventLink, timelineComponents['fillingLine'], timelineComponents['timelineTotWidth']);
                                // Set height
                                setTimeout(function() {
                                     var h = firstEventContent.outerHeight();
                                     timelineComponents['eventsContent'].css('height', h + 'px');
                                }, 100);
                            }
                       }
                  }
                  // Set initial arrow state based on position 0
                  translateTimeline(timelineComponents, 0);

              }); // end timelines.each
          } // end initTimeline

          // Helper to select a new event
          function selectNewEvent(newEventLink, timelineComponents) {
               var currentEventLink = timelineComponents['timelineEvents'].filter('.selected');
               currentEventLink.removeClass('selected'); // Deselect old link
               currentEventLink.parent('li').removeClass('selected'); // Deselect old li

               newEventLink.addClass('selected'); // Select new link
               newEventLink.parent('li').addClass('selected'); // Select new li

               updateOlderEvents(newEventLink); // Update styling
               updateFilling(newEventLink, timelineComponents['fillingLine'], timelineComponents['timelineTotWidth']);
               updateVisibleContent(newEventLink, timelineComponents['eventsContent']);
               updateTimelinePosition('click', newEventLink, timelineComponents); // Center if needed
          }

          // Move timeline via arrow buttons
          function updateSlide(timelineComponents, direction) {
              var translateValue = getTranslateValue(timelineComponents['eventsWrapper']);
              var wrapperWidth = timelineComponents['timelineWrapper'].width();
              var step = wrapperWidth * 0.7; // Scroll amount
              var newTranslate = (direction === 'next') ? translateValue - step : translateValue + step;
              translateTimeline(timelineComponents, newTranslate);
          }

          // Show new content via swipe/keys
          function showNewContent(timelineComponents, direction) {
              var currentEventItem = timelineComponents['eventsWrapper'].find('li.selected'); // Find selected LI
              var newEventItem = (direction === 'next') ? currentEventItem.next('li') : currentEventItem.prev('li');

              if (newEventItem.length > 0) {
                  var newEventLink = newEventItem.children('a'); // Get link inside the new LI
                  selectNewEvent(newEventLink, timelineComponents); // Select the new event
                  // No need to call updateTimelinePosition here, selectNewEvent does it
              }
          }

          // Adjust timeline scroll position to center the selected event if necessary
          function updateTimelinePosition(string, event, timelineComponents) {
              var maxTranslate = timelineComponents['maxTranslate'];
              var eventLeft = parseFloat(event.data('left-pos')); // Use stored position
              var timelineWrapperWidth = timelineComponents['timelineWrapper'].width();
              var currentTranslate = getTranslateValue(timelineComponents['eventsWrapper']);

              // The 'left-pos' is the center of the event dot/text block
              var targetTranslate = timelineWrapperWidth / 2 - eventLeft;
              targetTranslate = Math.max(maxTranslate, Math.min(0, targetTranslate)); // Clamp

              // Determine if translation is needed
              var viewportLeft = -currentTranslate;
              var viewportRight = viewportLeft + timelineWrapperWidth;
              var buffer = timelineWrapperWidth * 0.1; // Viewport buffer zone (smaller buffer)

              // Translate if it's arrow/key navigation OR if a clicked event is near the edges
              if (string === 'next' || string === 'prev' || (string === 'click' && (eventLeft < viewportLeft + buffer || eventLeft > viewportRight - buffer))) {
                  translateTimeline(timelineComponents, targetTranslate);
              } else if (string === 'click') {
                  // If click is not near edge, just ensure arrows are updated correctly
                   translateTimeline(timelineComponents, currentTranslate);
              }
          }

          // Apply translation value and update arrow states
          function translateTimeline(timelineComponents, value) {
              var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
              var maxTranslate = timelineComponents['maxTranslate']; // Get the stored max translate

              value = Math.max(maxTranslate, Math.min(0, value)); // Clamp the value

              setTransformValue(eventsWrapper, 'translateX', value + 'px');

              // Update navigation arrow visibility
              var inactiveMargin = 1; // Tolerance for floating point comparison
              timelineComponents['timelineNavigation'].find('.prev').toggleClass('inactive', value >= -inactiveMargin);
              timelineComponents['timelineNavigation'].find('.next').toggleClass('inactive', value <= maxTranslate + inactiveMargin);
          }

          // Update the progress bar (filling line)
          function updateFilling(selectedEvent, filling, totWidth) {
               var eventLeft = parseFloat(selectedEvent.data('left-pos')); // Use stored position
               if (isNaN(eventLeft)) { // Fallback
                   eventLeft = parseFloat(selectedEvent.parent('li').css('left')) || 0;
               }
               var scaleValue = totWidth > 0 ? eventLeft / totWidth : 0; // Scale based on center position
               scaleValue = Math.max(0, Math.min(1, scaleValue)); // Clamp 0-1
               setTransformValue(filling.get(0), 'scaleX', scaleValue);
          }

          // --- MODIFIED: Set event positions evenly with edge padding ---
          function setDatePosition(timelineComponents, minDistance, padding) {
              var timelineWrapperWidth = timelineComponents['timelineWrapper'].width();
              var totalEvents = timelineComponents['timelineEvents'].length;
              if (totalEvents < 1) return;

              var usableWidth = Math.max(0, timelineWrapperWidth - (2 * padding));
              var calculatedDistance;
              if (totalEvents > 1) {
                  calculatedDistance = usableWidth / (totalEvents - 1);
                  calculatedDistance = Math.max(calculatedDistance, minDistance);
              } else {
                  calculatedDistance = 0;
              }

              for (var i = 0; i < totalEvents; i++) {
                   var currentEvent = timelineComponents['timelineEvents'].eq(i);
                   var positionToSet;
                   if (totalEvents === 1) {
                       positionToSet = timelineWrapperWidth / 2;
                   } else {
                       positionToSet = padding + (i * calculatedDistance);
                   }
                   currentEvent.data('left-pos', positionToSet);
                   currentEvent.parent('li').css('left', positionToSet + 'px');
               }
          }

          // --- MODIFIED: Calculate and set the total width of the events container ---
          function setTimelineWidth(timelineComponents, padding) {
               var totalEvents = timelineComponents['timelineEvents'].length;
               var totalWidth = 0;
               var wrapperWidth = timelineComponents['timelineWrapper'].width();

               if (totalEvents > 0) {
                   var lastEvent = timelineComponents['timelineEvents'].last();
                   var lastEventPos = parseFloat(lastEvent.data('left-pos'));
                    if (isNaN(lastEventPos)) {
                       lastEventPos = parseFloat(lastEvent.parent('li').css('left')) || 0;
                    }
                   totalWidth = lastEventPos + padding;
                   totalWidth = Math.max(totalWidth, wrapperWidth);
               } else {
                   totalWidth = wrapperWidth;
               }

               timelineComponents['eventsWrapper'].css('width', totalWidth + 'px');
               timelineComponents['timelineTotWidth'] = totalWidth;

               var selectedEvent = timelineComponents['timelineEvents'].filter('.selected').first();
                if (selectedEvent.length) {
                      if (!selectedEvent.parent('li').hasClass('selected')) {
                          selectedEvent.parent('li').addClass('selected');
                      }
                    updateFilling(selectedEvent, timelineComponents['fillingLine'], totalWidth);
                } else if (totalEvents > 0) {
                    // If nothing selected initially by HTML, select first and update filling
                     var firstEvent = timelineComponents['timelineEvents'].first();
                    if (firstEvent.length) {
                         if (!firstEvent.hasClass('selected')) {
                             firstEvent.addClass('selected');
                             firstEvent.parent('li').addClass('selected');
                         }
                        updateFilling(firstEvent, timelineComponents['fillingLine'], totalWidth);
                        updateOlderEvents(firstEvent); // Update older class for first item
                    }
                }
               return totalWidth;
          }

          // Animate content panels in/out
          function updateVisibleContent(newEvent, eventsContent) {
              var eventDate = newEvent.data('date');
              var newContent = eventsContent.find('li[data-date="' + eventDate + '"]');
              var visibleContent = eventsContent.find('li.selected');

              if (newContent.is(visibleContent) || newContent.length === 0) {
                   if (newContent.length > 0) {
                      var currentHeight = newContent.outerHeight();
                      eventsContent.stop().animate({ height: currentHeight + 'px' }, 300);
                   }
                  return;
              }

              var newContentHeight = newContent.outerHeight();
              var animationClassEntering, animationClassLeaving;
              // Use index() on the parent OL to determine direction
              if (newContent.index() > visibleContent.index()) {
                  animationClassEntering = 'enter-right'; animationClassLeaving = 'leave-left';
              } else {
                  animationClassEntering = 'enter-left'; animationClassLeaving = 'leave-right';
              }

              // Set fixed height before animation for smoothness
              eventsContent.css('height', visibleContent.outerHeight() + 'px');

              visibleContent.removeClass('selected');
              newContent.addClass('selected').css('visibility', 'visible'); // Make new content visible before animation starts

              eventsContent.stop().animate({ height: newContentHeight + 'px' }, 400, 'swing');

              visibleContent.addClass(animationClassLeaving);
              newContent.addClass(animationClassEntering);

              eventsContent.off('animationend webkitAnimationEnd');
              eventsContent.one('animationend webkitAnimationEnd', 'li.' + animationClassLeaving + ', li.' + animationClassEntering, function(e) {
                   var $this = $(this);
                   // Only act on the element that finished animating
                   if ($this.hasClass(animationClassLeaving)) {
                       $this.css('visibility', 'hidden'); // Hide element that left
                   }
                   // Remove animation classes from the element that finished
                   $this.removeClass('enter-right enter-left leave-right leave-left');
              });


              // Fallback cleanup in case animationend doesn't fire reliably
              setTimeout(function() {
                  eventsContent.find('li').each(function() {
                       var $li = $(this);
                       $li.removeClass('enter-right enter-left leave-right leave-left');
                        if (!$li.hasClass('selected')) {
                            $li.css('visibility', 'hidden');
                        } else {
                             $li.css('visibility', 'visible'); // Ensure selected remains visible
                        }
                  });
                   // Final height check after fallback
                   var finalSelectedContent = eventsContent.find('li.selected');
                   if (finalSelectedContent.length > 0) {
                       eventsContent.css('height', finalSelectedContent.outerHeight() + 'px');
                   }
              }, 550);
          }

          // Update 'older-event' class on timeline links
          function updateOlderEvents(event) {
              var currentItem = event.parent('li');
              // Use timelineDates for comparison if available and reliable
              // This example relies on HTML order for prevAll/nextAll
              currentItem.prevAll('li').children('a').addClass('older-event');
              event.removeClass('older-event');
              currentItem.nextAll('li').children('a').removeClass('older-event');
          }

          // Get CSS translate value
          function getTranslateValue(element) {
              var style = window.getComputedStyle(element.get(0));
              var matrix = style['transform'] || style.webkitTransform || style.mozTransform;
              if (!matrix || matrix === 'none') { return 0; }
              var matrixType = matrix.includes('3d') ? '3d' : '2d';
              var matrixValues = matrix.match(/matrix.*\((.+)\)/);
              if (!matrixValues) return 0;
              matrixValues = matrixValues[1].split(', ');
              if (matrixType === '2d') { return parseFloat(matrixValues[4]) || 0; }
              else { return parseFloat(matrixValues[12]) || 0; }
          }

          // Set CSS transform value
          function setTransformValue(element, property, value) {
               element.style["transform"] = property + "(" + value + ")";
          }

          // Parse dates
          function parseDate(events) {
               var dateArrays = [];
               events.each(function(){
                   var dateStr = $(this).data('date');
                   var dateComp = dateStr ? dateStr.split('/') : null;
                   if (dateComp && dateComp.length === 3) {
                       var day = parseInt(dateComp[0], 10); var month = parseInt(dateComp[1], 10) - 1; var year = parseInt(dateComp[2], 10);
                       var newDate = new Date(Date.UTC(year, month, day));
                       if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1900 && year < 2100 && !isNaN(newDate.getTime())) {
                            dateArrays.push(newDate);
                       } else { dateArrays.push(null); }
                   } else { dateArrays.push(null); }
               });
               return dateArrays;
          }

          // Check if element is in viewport
          function elementInViewport(el) {
               if (!el) return false;
               var rect = el.getBoundingClientRect();
               return ( rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth) );
          }

          // Check CSS media query breakpoint identifier
          function checkMQ() {
               var content = window.getComputedStyle(document.querySelector('.cd-horizontal-timeline'), '::before').getPropertyValue('content');
               return content.replace(/^['"]|['"]$/g, "");
          }

          // Calculate maximum scroll amount
           function calculateMaxTranslate(timelineComponents) {
               var wrapperWidth = timelineComponents['timelineWrapper'].width();
               var timelineWidth = timelineComponents['timelineTotWidth'] || 0;
               return Math.min(0, wrapperWidth - timelineWidth);
           }

           // Content Swipe Functionality
           function enableContentSwipe(timelineComponents) {
              var contentElement = timelineComponents['eventsContent'];
               var touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
               var isScrollingGallery = false;
               var isPotentialSwipe = false;
               var swipeThreshold = 60, scrollThreshold = 40;

               contentElement.on('touchstart', function(event) {
                   isScrollingGallery = $(event.target).closest('.gallery').length > 0;
                   isPotentialSwipe = false;
                   if (isScrollingGallery) {
                        touchStartX = 0;
                        return;
                   }
                   touchStartX = event.originalEvent.touches[0].screenX;
                   touchStartY = event.originalEvent.touches[0].screenY;
                   touchEndX = 0; touchEndY = 0;
               }, { passive: true });

               contentElement.on('touchmove', function(event) {
                   if (isScrollingGallery || touchStartX === 0) return;
                   var currentX = event.originalEvent.touches[0].screenX;
                   var currentY = event.originalEvent.touches[0].screenY;
                   touchEndX = currentX;
                   touchEndY = currentY;
                   var deltaX = Math.abs(currentX - touchStartX);
                   var deltaY = Math.abs(currentY - touchStartY);

                   if (deltaX > deltaY && deltaX > 10) {
                       isPotentialSwipe = true;
                        event.preventDefault();
                   } else {
                       isPotentialSwipe = false;
                   }

               }, { passive: false });

               contentElement.on('touchend', function(event) {
                   if (isScrollingGallery || touchStartX === 0) {
                        isScrollingGallery = false;
                        touchStartX = 0;
                        return;
                   }
                   if (touchEndX === 0) { touchEndX = event.originalEvent.changedTouches[0].screenX; }
                   if (touchEndY === 0) { touchEndY = event.originalEvent.changedTouches[0].screenY; }
                   var deltaX = touchEndX - touchStartX;
                   var deltaY = touchEndY - touchStartY;

                   if (Math.abs(deltaY) > scrollThreshold && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
                       // Vertical scroll
                   }
                   else if (Math.abs(deltaX) > swipeThreshold) {
                       if (deltaX < 0) {
                           showNewContent(timelineComponents, 'next');
                       } else {
                           showNewContent(timelineComponents, 'prev');
                       }
                   }
                   touchStartX = touchEndX = touchStartY = touchEndY = 0;
                   isScrollingGallery = false;
                   isPotentialSwipe = false;
               });
           } // end enableContentSwipe

      }); // End jQuery specific code block for gallery
  } else if ($('.cd-horizontal-timeline').length > 0) {
      console.warn("jQuery not loaded or timeline element not found. New Gallery functionality might be missing.");
  }


}); // End DOMContentLoaded


// --- Utility function (Keep this if it was used elsewhere, or add if needed by gallery) ---
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