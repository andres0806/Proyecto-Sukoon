document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Navbar Scroll & Background Logic ---
    const navbar = document.getElementById('navbar');
    
    function updateNavbar() {
        const activeTab = document.querySelector('.tab-content.active').id;
        const logoLight = document.querySelector('.logo-light');
        const logoDark = document.querySelector('.logo-dark');
        
        if ((activeTab !== 'tab-inicio' && activeTab !== 'tab-actividades' && activeTab !== 'tab-villas') || window.scrollY > 50) {
            navbar.classList.add('bg-sukoon-bg/95', 'backdrop-blur-md', 'shadow-[0_2px_15px_rgba(0,0,0,0.03)]');
            navbar.classList.remove('bg-transparent', 'text-white', 'py-5');
            navbar.classList.add('text-sukoon-text', 'py-3');
            if (logoLight) logoLight.classList.add('hidden');
            if (logoDark) logoDark.classList.remove('hidden');
        } else {
            navbar.classList.remove('bg-sukoon-bg/95', 'backdrop-blur-md', 'shadow-[0_2px_15px_rgba(0,0,0,0.03)]', 'text-sukoon-text', 'py-3');
            navbar.classList.add('bg-transparent', 'text-white', 'py-5');
            if (logoLight) logoLight.classList.remove('hidden');
            if (logoDark) logoDark.classList.add('hidden');
        }
    }

    window.addEventListener('scroll', updateNavbar);

    // --- 2. Tab Navigation Logic ---
    const tabLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetId) {
        // Hide all tabs
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show target tab
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update Navbar based on new tab
        updateNavbar();
        
        // Re-trigger fade-in animations for the new tab
        triggerFadeInAnimations();
    }

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if(targetId) switchTab(targetId);
        });
    });

    // --- 3. Scroll Fade-In Animations ---
    const fadeElements = document.querySelectorAll('.fade-in-up');
    
    function triggerFadeInAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        // Only observe elements in the currently active tab
        const activeTab = document.querySelector('.tab-content.active');
        if(activeTab) {
            const elementsInActiveTab = activeTab.querySelectorAll('.fade-in-up');
            elementsInActiveTab.forEach(el => {
                // Reset visibility if you want them to animate every time tab changes
                el.classList.remove('visible'); 
                observer.observe(el);
            });
        }
    }
    
    // Initial trigger
    triggerFadeInAnimations();

    // --- 4. Contact Form UI Logic ---
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('success-msg');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Set loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> Procesando...
            `;
            submitBtn.disabled = true;

            // Simulate API request (2 seconds)
            setTimeout(() => {
                form.style.display = 'none';
                successMsg.classList.remove('hidden');
                successMsg.classList.add('visible');
            }, 2000);
        });
    }

    // --- 6. Interactive Calendar ---
    let selectedStartDay = null;
    let selectedEndDay = null;

    function renderCalendars() {
        generateInteractiveCalendar('calendar-1', 5, 31, 0); 
        generateInteractiveCalendar('calendar-2', 1, 30, 31);
    }

    function generateInteractiveCalendar(id, startDayOffset, daysInMonth, indexOffset) {
        const container = document.getElementById(id);
        if (!container) return;
        
        let html = '';
        for(let i=0; i<startDayOffset; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }
        for(let i=1; i<=daysInMonth; i++) {
            let classes = 'calendar-day cursor-pointer hover:bg-gray-100 transition-colors';
            let dayIndex = i + indexOffset;
            
            if (dayIndex === selectedStartDay) {
                classes += ' selected rounded-l-full';
            } else if (dayIndex === selectedEndDay) {
                classes += ' selected rounded-r-full';
            } else if (selectedStartDay && selectedEndDay && dayIndex > selectedStartDay && dayIndex < selectedEndDay) {
                classes += ' in-range';
            } else {
                classes += ' rounded-full';
            }
            
            html += `<div class="${classes}" onclick="handleDayClick(${dayIndex})">${i}</div>`;
        }
        container.innerHTML = html;
    }

    window.handleDayClick = function(dayIndex) {
        if (selectedStartDay === null) {
            selectedStartDay = dayIndex;
            selectedEndDay = null;
        } else if (selectedEndDay === null && dayIndex > selectedStartDay) {
            selectedEndDay = dayIndex;
        } else {
            selectedStartDay = dayIndex;
            selectedEndDay = null;
        }
        renderCalendars();
        window.calcularFactura();
    };

    // --- 5. Reservation Invoice Logic ---
    window.calcularFactura = function() {
        const villaName = document.getElementById('res-villa') ? document.getElementById('res-villa').value : 'Villa Oceánica';
        
        if (document.getElementById('invoice-villa-name')) {
            document.getElementById('invoice-villa-name').textContent = villaName;
        }

        let days = 0;
        if (selectedStartDay !== null && selectedEndDay !== null) {
            days = selectedEndDay - selectedStartDay;
        }

        const pricePerNight = villaName === 'Villa Oceánica' ? 600000 : 500000;
        const subtotal = days * pricePerNight;
        const taxes = subtotal * 0.19;
        const total = subtotal + taxes;

        // Formatter for COP
        const formatter = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        });

        const nightsListContainer = document.getElementById('invoice-nights-list');
        if (nightsListContainer) {
            nightsListContainer.innerHTML = '';
            
            if (days > 0) {
                let startMonthStr = selectedStartDay <= 31 ? 'May' : 'Jun';
                let startDayNum = selectedStartDay <= 31 ? selectedStartDay : selectedStartDay - 31;
                
                let endMonthStr = selectedEndDay <= 31 ? 'May' : 'Jun';
                let endDayNum = selectedEndDay <= 31 ? selectedEndDay : selectedEndDay - 31;
                
                let dateRangeStr = `${startDayNum} ${startMonthStr} - ${endDayNum} ${endMonthStr}`;
                
                nightsListContainer.innerHTML = `
                    <div class="flex justify-between items-center w-full">
                        <span class="font-sans text-sm text-sukoon-text/80 font-light truncate">${days} Noches (${dateRangeStr})</span>
                        <div class="flex-grow mx-3 border-b border-dotted border-gray-400 relative"></div>
                        <span class="font-sans text-sm text-sukoon-text font-medium shrink-0">${formatter.format(subtotal)}</span>
                    </div>
                `;
            } else {
                nightsListContainer.innerHTML = '<span class="font-sans text-sm text-gray-400 italic">Selecciona tus fechas en el calendario...</span>';
            }
        }

        if (document.getElementById('invoice-subtotal')) {
            document.getElementById('invoice-subtotal').textContent = formatter.format(subtotal);
            document.getElementById('invoice-taxes').textContent = formatter.format(taxes);
            
            let totalFormatted = formatter.format(total);
            if (!totalFormatted.includes('COP')) {
                totalFormatted += ' COP';
            }
            document.getElementById('invoice-total').textContent = totalFormatted;
        }

        const hiddenTotalReserva = document.getElementById('hidden_total_reserva');
        if (hiddenTotalReserva) {
            hiddenTotalReserva.value = total;
        }
    };

    // Attach listener to inputs for live update
    const resVilla = document.getElementById('res-villa');
    if (resVilla) {
        resVilla.addEventListener('change', window.calcularFactura);
    }
    
    // Initial render
    renderCalendars();

    // --- 7. Carousel Navigation Logic ---
    const carousel = document.getElementById('carousel-actividades');
    const btnPrev = document.getElementById('btn-prev-act');
    const btnNext = document.getElementById('btn-next-act');

    if (carousel && btnPrev && btnNext) {
        const items = Array.from(carousel.children);
        const totalItems = items.length;
        
        const cloneSet = () => items.map(item => item.cloneNode(true));

        // Append 2 sets
        cloneSet().forEach(clone => carousel.appendChild(clone));
        cloneSet().forEach(clone => carousel.appendChild(clone));
        
        // Prepend 1 set
        const prependSet = cloneSet().reverse();
        prependSet.forEach(clone => carousel.prepend(clone));

        const firstOriginal = carousel.children[totalItems];
        const firstAppended = carousel.children[totalItems * 2];
        
        let setWidth = 0;
        let centerOfOriginal = 0;
        let isScrolling = false;
        let initialized = false;

        const initCarousel = () => {
            if (initialized || firstAppended.offsetLeft === 0) return;
            
            setWidth = firstAppended.offsetLeft - firstOriginal.offsetLeft;
            centerOfOriginal = firstOriginal.offsetLeft - (carousel.offsetWidth / 2) + (firstOriginal.offsetWidth / 2);
            
            carousel.style.scrollBehavior = 'auto';
            carousel.scrollLeft = centerOfOriginal;
            void carousel.offsetWidth;
            carousel.style.scrollBehavior = 'smooth';
            
            initialized = true;
        };

        // Use IntersectionObserver to wait until the tab is visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                initCarousel();
            }
        });
        observer.observe(carousel);

        carousel.addEventListener('scroll', () => {
            if (isScrolling || !initialized || setWidth === 0) return;

            if (carousel.scrollLeft < centerOfOriginal - (setWidth / 2)) {
                isScrolling = true;
                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft += setWidth;
                void carousel.offsetWidth;
                carousel.style.scrollBehavior = 'smooth';
                setTimeout(() => isScrolling = false, 10);
            }
            else if (carousel.scrollLeft > centerOfOriginal + (setWidth / 2)) {
                isScrolling = true;
                carousel.style.scrollBehavior = 'auto';
                carousel.scrollLeft -= setWidth;
                void carousel.offsetWidth;
                carousel.style.scrollBehavior = 'smooth';
                setTimeout(() => isScrolling = false, 10);
            }
        });

        btnPrev.addEventListener('click', () => {
            const itemWidth = items[0].offsetWidth;
            carousel.scrollBy({ left: -(itemWidth + 32), behavior: 'smooth' });
        });

        btnNext.addEventListener('click', () => {
            const itemWidth = items[0].offsetWidth;
            carousel.scrollBy({ left: itemWidth + 32, behavior: 'smooth' });
        });
    }

    // --- 7. Reservation Form Submission (Fetch API) ---
    const resForm = document.getElementById('sukoon-reservation-form');
    if (resForm) {
        resForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('submit-res-btn');
            const errorMsg = document.getElementById('submit-res-error');
            const successMsg = document.getElementById('res-success-msg');
            
            // Loading State
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = 'PROCESANDO SOLICITUD VIP...';
            btn.disabled = true;
            btn.classList.add('opacity-80', 'cursor-not-allowed');
            errorMsg.classList.add('hidden');
            
            const formData = new FormData(resForm);
            
            try {
                const response = await fetch(resForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Success State
                    resForm.classList.add('hidden');
                    const formTitle = document.getElementById('res-form-title');
                    if (formTitle) formTitle.classList.add('hidden');
                    successMsg.classList.remove('hidden');
                    successMsg.classList.add('flex');
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                // Error State
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
                btn.classList.remove('opacity-80', 'cursor-not-allowed');
                errorMsg.classList.remove('hidden');
            }
        });
    }
});
