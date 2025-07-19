/**
 * File: tutor-lesson-behavior.js
 * Theme Component: Tutor LMS Child Theme
 * Description: Custom JavaScript for interactive behavior on Tutor LMS lesson pages.
 * Author: Ambient Technology
 * Version: 2.4.1
 * Template: hello-elementor
 * URL: https://ambient.technology
 */

class TutorLessonLayout {
    constructor() {
        this.container = null;
        this.toggleBtn = null;
        this.sidebar = null;
        this.isInitialized = false;
        this.aggressiveInterval = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // FIXED: Use correct selectors that match your HTML structure
        this.container = document.querySelector('.tutor-lesson-layout');
        this.toggleBtn = document.querySelector('.tutor-sidebar-toggle-main');
        this.sidebar = document.querySelector('.tutor-lesson-sidebar');

        // Check if required elements exist
        if (!this.container) {
            console.warn('TutorLMS: Main layout container (.tutor-lesson-layout) not found');
            return;
        }
        
        if (!this.toggleBtn) {
            console.warn('TutorLMS: Toggle button (.tutor-sidebar-toggle-main) not found');
            return;
        }
        
        if (!this.sidebar) {
            console.warn('TutorLMS: Sidebar (.tutor-lesson-sidebar) not found');
            return;
        }

        // Initialize functionality
        this.loadSidebarState();
        this.bindEvents();
        this.handleResize();
        this.initializeTabSwitching();
        this.initializeDynamicTooltips();
        this.initializeSidebarCompletion();
        this.initializeAccordionToggles();
        
        this.isInitialized = true;
    }

    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        if (!this.container) {
            return;
        }

        const wasHidden = this.container.classList.contains('sidebar-is-hidden');
        this.container.classList.toggle('sidebar-is-hidden');
        this.saveSidebarState();
        
        // Trigger custom event for other scripts
        const event = new CustomEvent('tutorSidebarToggled', {
            detail: { 
                isHidden: this.container.classList.contains('sidebar-is-hidden') 
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Save sidebar state to localStorage
     */
    saveSidebarState() {
        if (!this.container) return;

        const isHidden = this.container.classList.contains('sidebar-is-hidden');
        try {
            localStorage.setItem('tutor-sidebar-state', isHidden ? 'hidden' : 'visible');
        } catch (e) {
            console.warn('TutorLMS: Could not save sidebar state to localStorage');
        }
    }

    /**
     * Load sidebar state from localStorage
     */
    loadSidebarState() {
        if (!this.container) return;

        try {
            const state = localStorage.getItem('tutor-sidebar-state');
            if (state === 'hidden') {
                this.container.classList.add('sidebar-is-hidden');
            }
        } catch (e) {
            console.warn('TutorLMS: Could not load sidebar state from localStorage');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Main sidebar toggle button
        if (this.toggleBtn) {
            // Remove any existing listeners first
            this.toggleBtn.removeEventListener('click', this.handleToggleClick);
            this.toggleBtn.removeEventListener('touchend', this.handleToggleTouch);
            
            // Add new listeners with proper binding
            this.handleToggleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            };
            
            this.handleToggleTouch = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            };
            
            this.toggleBtn.addEventListener('click', this.handleToggleClick);
            this.toggleBtn.addEventListener('touchend', this.handleToggleTouch);
        }

        // Close sidebar when clicking overlay on mobile
        if (this.container) {
            this.container.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && 
                    !this.container.classList.contains('sidebar-is-hidden') &&
                    !this.sidebar.contains(e.target) &&
                    !this.toggleBtn.contains(e.target)) {
                    this.toggleSidebar();
                }
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Handle escape key to close sidebar on mobile
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && 
                window.innerWidth <= 768 && 
                this.container &&
                !this.container.classList.contains('sidebar-is-hidden')) {
                this.toggleSidebar();
            }
        });
    }

    /**
     * Handle responsive behavior
     */
    handleResize() {
        if (!this.container) return;

        const isMobile = window.innerWidth <= 768;
        this.container.classList.toggle('is-mobile', isMobile);

        // On desktop, restore user preference if sidebar was auto-hidden
        if (!isMobile && this.container.classList.contains('sidebar-is-hidden')) {
            const userPreference = localStorage.getItem('tutor-sidebar-state');
            if (userPreference !== 'hidden') {
                this.container.classList.remove('sidebar-is-hidden');
            }
        }
    }

    /**
     * Initialize dynamic tooltips for completion checkboxes and info icons
     * Also disables default Tutor LMS tooltips while preserving summary text
     */
    initializeDynamicTooltips() {
        // Function to update tooltip text based on completion state
        const updateTooltip = (input) => {
            const isCompleted = input.checked;
            const tooltipType = input.getAttribute('data-tooltip-type') || 'lesson';
            
            let tooltipText = '';
            if (tooltipType === 'quiz') {
                tooltipText = isCompleted ? 'Quiz completed ✓' : 'Click to mark quiz as complete';
            } else {
                tooltipText = isCompleted ? 'Lesson completed ✓' : 'Click to mark as complete';
            }
            
            input.setAttribute('title', tooltipText);
            input.setAttribute('data-completed', isCompleted.toString());
            
            // Update cursor style
            if (isCompleted) {
                input.style.cursor = 'default';
            } else {
                input.style.cursor = 'pointer';
            }
        };
        
        // Function to disable default tooltips and preserve summary text
        const disableDefaultTooltips = () => {
            // Select all topic headers
            const topicHeaders = document.querySelectorAll('.tutor-accordion-item-header');
            
            topicHeaders.forEach(header => {
                // Get the summary text from the title attribute
                const summaryText = header.getAttribute('title');
                
                if (summaryText) {
                    // Set the text into a new data-attribute for custom scripts
                    header.dataset.customTooltip = summaryText;
                    
                    // Keep the title attribute for our CSS tooltips to work
                    // The CSS will handle disabling the default dark tooltips
                    header.setAttribute('title', summaryText);
                    
                    // Add a class to mark as processed
                    header.classList.add('tooltip-disabled');
                }
            });
        };
        
        // Update tooltips for all completion inputs
        const updateAllTooltips = () => {
            const inputs = document.querySelectorAll('.tutor-form-check-input.tutor-form-check-circle');
            inputs.forEach(input => {
                updateTooltip(input);
            });
        };
        
        // Initial updates
        updateAllTooltips();
        disableDefaultTooltips();
        
        // Set up observer to watch for changes in completion inputs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'checked') {
                    updateTooltip(mutation.target);
                }
            });
        });
        
        // Observe all completion inputs
        const inputs = document.querySelectorAll('.tutor-form-check-input.tutor-form-check-circle');
        inputs.forEach(input => {
            observer.observe(input, { attributes: true, attributeFilter: ['checked'] });
        });
        
        // Remove any old tooltips that get added by parent plugin
        const removeOldTooltips = () => {
            const oldTooltips = document.querySelectorAll('.tooltip-wrap, .tooltip-txt, .tutor-course-topic-title-info-icon');
            oldTooltips.forEach(tooltip => {
                tooltip.remove();
            });
            
            // Also remove any modern tooltip libraries
            const modernTooltips = document.querySelectorAll('[data-tippy-root], .tippy-box, .tippy-content, .tutor-tooltip, .tutor-tooltip-box');
            modernTooltips.forEach(tooltip => {
                tooltip.remove();
            });
        };
        
        // Run immediately and also set up a mutation observer to catch any that get added later
        removeOldTooltips();
        
        // Watch for any new tooltips being added
        const tooltipObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && (
                                node.classList.contains('tooltip-wrap') ||
                                node.classList.contains('tooltip-txt') ||
                                node.classList.contains('tutor-course-topic-title-info-icon') ||
                                node.classList.contains('tippy-box') ||
                                node.classList.contains('tippy-content') ||
                                node.classList.contains('tutor-tooltip') ||
                                node.classList.contains('tutor-tooltip-box')
                            )) {
                                node.remove();
                            }
                            // Also check child elements
                            const oldTooltips = node.querySelectorAll('.tooltip-wrap, .tooltip-txt, .tutor-course-topic-title-info-icon, [data-tippy-root], .tippy-box, .tippy-content, .tutor-tooltip, .tutor-tooltip-box');
                            oldTooltips.forEach(tooltip => tooltip.remove());
                        }
                    });
                }
            });
        });
        
        // Start observing
        tooltipObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Watch for new topic headers being added and disable their tooltips
        const headerObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Check if the added node is a topic header
                            if (node.classList && node.classList.contains('tutor-accordion-item-header')) {
                                const summaryText = node.getAttribute('title');
                                if (summaryText) {
                                    node.dataset.customTooltip = summaryText;
                                    // Keep title attribute for CSS tooltips
                                    node.setAttribute('title', summaryText);
                                    node.classList.add('tooltip-disabled');
                                }
                            }
                            // Check for topic headers within the added node
                            const newHeaders = node.querySelectorAll ? node.querySelectorAll('.tutor-accordion-item-header') : [];
                            newHeaders.forEach(header => {
                                if (!header.classList.contains('tooltip-disabled')) {
                                    const summaryText = header.getAttribute('title');
                                    if (summaryText) {
                                        header.dataset.customTooltip = summaryText;
                                        // Keep title attribute for CSS tooltips
                                        header.setAttribute('title', summaryText);
                                        header.classList.add('tooltip-disabled');
                                    }
                                }
                            });
                        }
                    });
                }
            });
        });
        
        // Start observing for new headers
        headerObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Debug: Log tooltip setup (remove in production)
        setTimeout(() => {
            const headers = document.querySelectorAll('.tutor-accordion-item-header');
            console.log(`TutorLMS: Processed ${headers.length} topic headers for tooltips`);
            headers.forEach((header, index) => {
                const hasCustomTooltip = header.dataset.customTooltip;
                const hasTitle = header.getAttribute('title');
                const isDisabled = header.classList.contains('tooltip-disabled');
                console.log(`Header ${index + 1}:`, {
                    text: header.textContent.trim().substring(0, 30) + '...',
                    hasCustomTooltip: !!hasCustomTooltip,
                    hasTitle: !!hasTitle,
                    isDisabled: isDisabled
                });
            });
        }, 1000);

    }

    /**
     * Initialize tab switching functionality
     */
    initializeTabSwitching() {
        const tabLinks = document.querySelectorAll('[data-tutor-nav-target]');
        
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('data-tutor-nav-target');
                const targetTab = document.getElementById(targetId);
                
                if (targetTab) {
                    document.querySelectorAll('.tutor-nav-link').forEach(navLink => {
                        navLink.classList.remove('is-active');
                    });
                    document.querySelectorAll('.tutor-tab-item').forEach(tabItem => {
                        tabItem.classList.remove('is-active');
                    });
                    
                    link.classList.add('is-active');
                    targetTab.classList.add('is-active');
                    
                    const queryVariable = link.getAttribute('data-tutor-query-variable');
                    const queryValue = link.getAttribute('data-tutor-query-value');
                    
                    if (queryVariable && queryValue) {
                        this.updateURLParameter(queryVariable, queryValue);
                    }
                }
            });
        });
    }

    /**
     * Update URL parameter without page reload
     */
    updateURLParameter(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url);
    }

    /**
     * Initialize sidebar completion - WORKING VERSION
     */
    initializeSidebarCompletion() {
        // Stop any existing interval
        if (this.aggressiveInterval) {
            clearInterval(this.aggressiveInterval);
        }
        
        const enableCompletionInputs = () => {
            const inputs = document.querySelectorAll('.tutor-form-check-input.tutor-form-check-circle');
            let enabledCount = 0;
            
            inputs.forEach((input, index) => {
                // Find lesson info
                const container = input.closest('.tutor-course-topic-item');
                const link = container?.querySelector('a[data-lesson-id]');
                const lessonId = link?.getAttribute('data-lesson-id');
                
                if (!lessonId) return;
                
                // Skip if already setup
                if (input.hasAttribute('data-tutor-enabled')) {
                    // Just make sure it's still enabled
                    if (input.disabled || input.readOnly) {
                        input.disabled = false;
                        input.readOnly = false;
                        input.removeAttribute('disabled');
                        input.removeAttribute('readonly');
                        input.style.cursor = 'pointer';
                        input.style.pointerEvents = 'auto';
                        input.style.opacity = '1';
                    }
                    return;
                }
                
                // Create new input to replace the disabled one
                const newInput = input.cloneNode(true);
                
                // Force enable
                newInput.disabled = false;
                newInput.readOnly = false;
                newInput.removeAttribute('disabled');
                newInput.removeAttribute('readonly');
                newInput.style.cursor = 'pointer';
                newInput.style.pointerEvents = 'auto';
                newInput.style.opacity = '1';
                
                // Mark as processed
                newInput.setAttribute('data-tutor-enabled', 'true');
                
                // Add click handler
                newInput.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    this.submitCompletionForm(lessonId);
                    return false;
                };
                
                // Add event listener as backup
                newInput.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.submitCompletionForm(lessonId);
                });
                
                // Replace original input
                input.parentNode.replaceChild(newInput, input);
                enabledCount++;
            });
            
            return enabledCount;
        };
        
        // Initial setup
        const initialCount = enableCompletionInputs();
        
        // TEMPORARILY DISABLED: Set up aggressive re-enabling every 100ms
        // this.aggressiveInterval = setInterval(() => {
        //     enableCompletionInputs();
        // }, 100);
        
        // Restore scroll position
        setTimeout(() => this.restoreScrollPosition(), 500);
    }

    /**
     * Initialize accordion toggles
     */
    initializeAccordionToggles() {
        const toggles = document.querySelectorAll('[tutor-course-single-topic-toggler]');
        
        toggles.forEach((toggle, index) => {
            // Remove any existing listeners to prevent duplicates
            if (toggle._accordionHandler) {
                toggle.removeEventListener('click', toggle._accordionHandler);
                delete toggle._accordionHandler;
            }
            
            // Create new handler
            toggle._accordionHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                const topicBody = toggle.nextElementSibling;
                
                // Use display state to determine if accordion is open/closed
                const currentDisplay = window.getComputedStyle(topicBody).display;
                const isCurrentlyOpen = currentDisplay !== 'none';
                
                if (topicBody && topicBody.classList.contains('tutor-accordion-item-body')) {
                    // Find the caret element within this toggle
                    const caret = toggle.querySelector('.tutor-accordion-caret');
                    
                    if (isCurrentlyOpen) {
                        // Close the accordion
                        toggle.classList.remove('is-active');
                        if (caret) caret.classList.remove('is-active');
                        topicBody.classList.add('tutor-display-none');
                        // Force the display style directly
                        topicBody.style.display = 'none';
                    } else {
                        // Open the accordion
                        toggle.classList.add('is-active');
                        if (caret) caret.classList.add('is-active');
                        topicBody.classList.remove('tutor-display-none');
                        // Force the display style directly
                        topicBody.style.display = 'block';
                    }
                    
                    // Force a reflow to ensure the display change takes effect
                    topicBody.offsetHeight;
                    
                    // Force a CSS refresh by triggering a repaint
                    toggle.style.transform = 'translateZ(0)';
                    setTimeout(() => {
                        toggle.style.transform = '';
                    }, 10);
                }
            };
            
            // Add only ONE listener
            toggle.addEventListener('click', toggle._accordionHandler);
        });
    }

    /**
     * Submit completion form
     */
    submitCompletionForm(lessonId) {
        // Save scroll position
        const sidebar = document.querySelector('.tutor-lesson-sidebar');
        if (sidebar) {
            localStorage.setItem('tutorSidebarScroll', sidebar.scrollTop);
        }
        
        // Create form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = window.location.href;
        form.style.display = 'none';

        // Add form fields
        const fields = [
            { name: '_tutor_nonce', value: window._tutorobject?._tutor_nonce || '' },
            { name: 'lesson_id', value: lessonId },
            { name: 'tutor_action', value: 'tutor_complete_lesson' }
        ];
        
        fields.forEach(field => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field.name;
            input.value = field.value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }

    /**
     * Restore sidebar scroll position
     */
    restoreScrollPosition() {
        const savedScroll = localStorage.getItem('tutorSidebarScroll');
        if (savedScroll) {
            const sidebar = document.querySelector('.tutor-lesson-sidebar');
            if (sidebar) {
                sidebar.scrollTop = parseInt(savedScroll);
                localStorage.removeItem('tutorSidebarScroll');
            }
        }
    }

    /**
     * Cleanup
     */
    cleanup() {
        if (this.aggressiveInterval) {
            clearInterval(this.aggressiveInterval);
            this.aggressiveInterval = null;
        }
        
        // Remove event listeners to prevent memory leaks
        if (this.toggleBtn && this.handleToggleClick) {
            this.toggleBtn.removeEventListener('click', this.handleToggleClick);
            this.toggleBtn.removeEventListener('touchend', this.handleToggleTouch);
        }
    }

    /**
     * Public API
     */
    getAPI() {
        return {
            toggleSidebar: () => this.toggleSidebar(),
            isSidebarHidden: () => this.container && this.container.classList.contains('sidebar-is-hidden') || false,
            isInitialized: () => this.isInitialized,
            cleanup: () => this.cleanup(),
            enableInputs: () => this.initializeSidebarCompletion()
        };
    }
}

// Initialize the layout controller
const tutorLessonLayout = new TutorLessonLayout();

// Make API available globally
window.TutorLessonLayout = tutorLessonLayout.getAPI();
window.tutorLessonLayout = tutorLessonLayout;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (tutorLessonLayout?.cleanup) {
        tutorLessonLayout.cleanup();
    }
});
