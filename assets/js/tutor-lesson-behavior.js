/**
 * File: tutor-lesson-behavior.js
 * Theme Component: Tutor LMS Child Theme
 * Description: Custom JavaScript for interactive behavior on Tutor LMS lesson pages.
 * Author: Ambient Technology
 * Version: 2.3.1
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
        console.log('🚀 TutorLessonLayout initializing...');
        
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

        console.log('✅ All required elements found');
        console.log('Container:', this.container);
        console.log('Toggle button:', this.toggleBtn);
        console.log('Sidebar:', this.sidebar);

        // Initialize functionality
        this.loadSidebarState();
        this.bindEvents();
        this.handleResize();
        this.initializeTabSwitching();
        this.initializeSidebarCompletion();
        this.isInitialized = true;

        console.log('✅ TutorLessonLayout initialized successfully');
    }

    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        if (!this.container) {
            console.log('No container found for sidebar toggle');
            return;
        }

        const wasHidden = this.container.classList.contains('sidebar-is-hidden');
        this.container.classList.toggle('sidebar-is-hidden');
        this.saveSidebarState();
        
        console.log(`🔄 Sidebar toggled: ${wasHidden ? 'shown' : 'hidden'}`);
        
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
            console.log(`💾 Sidebar state saved: ${isHidden ? 'hidden' : 'visible'}`);
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
                console.log('📂 Loaded sidebar state: hidden');
            } else {
                console.log('📂 Loaded sidebar state: visible');
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
                console.log('🖱️ Toggle button clicked');
                this.toggleSidebar();
            };
            
            this.handleToggleTouch = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👆 Toggle button touched');
                this.toggleSidebar();
            };
            
            this.toggleBtn.addEventListener('click', this.handleToggleClick);
            this.toggleBtn.addEventListener('touchend', this.handleToggleTouch);
            
            console.log('✅ Toggle button events bound');
        }

        // Close sidebar when clicking overlay on mobile
        if (this.container) {
            this.container.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && 
                    !this.container.classList.contains('sidebar-is-hidden') &&
                    !this.sidebar.contains(e.target) &&
                    !this.toggleBtn.contains(e.target)) {
                    console.log('📱 Mobile overlay clicked - closing sidebar');
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
                console.log('⌨️ Escape key pressed - closing sidebar');
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
                console.log('🖥️ Desktop view - restoring sidebar visibility');
            }
        }
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
        console.log('🎯 Initializing sidebar completion...');
        
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
                    console.log('🎯 Click detected for lesson:', lessonId);
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    this.submitCompletionForm(lessonId);
                    return false;
                };
                
                // Add event listener as backup
                newInput.addEventListener('click', (e) => {
                    console.log('🎯 Event listener fired for lesson:', lessonId);
                    e.preventDefault();
                    e.stopPropagation();
                    this.submitCompletionForm(lessonId);
                });
                
                // Replace original input
                input.parentNode.replaceChild(newInput, input);
                enabledCount++;
                
                console.log(`✅ Enabled input for lesson ${lessonId}`);
            });
            
            return enabledCount;
        };
        
        // Initial setup
        const initialCount = enableCompletionInputs();
        console.log(`🎯 Initial setup: ${initialCount} inputs enabled`);
        
        // Set up aggressive re-enabling every 100ms
        this.aggressiveInterval = setInterval(() => {
            enableCompletionInputs();
        }, 100);
        
        console.log('🎯 Aggressive re-enabling activated');
        
        // Restore scroll position
        setTimeout(() => this.restoreScrollPosition(), 500);
    }

    /**
     * Submit completion form
     */
    submitCompletionForm(lessonId) {
        console.log('📤 Submitting completion form for lesson:', lessonId);
        
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
                console.log('📜 Restored scroll position:', savedScroll);
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

// Debug functions
window.testSidebarToggle = function() {
    console.log('🧪 Testing sidebar toggle...');
    const layout = document.querySelector('.tutor-lesson-layout');
    const button = document.querySelector('.tutor-sidebar-toggle-main');
    const sidebar = document.querySelector('.tutor-lesson-sidebar');
    
    console.log('Layout container:', layout);
    console.log('Toggle button:', button);
    console.log('Sidebar:', sidebar);
    console.log('Current classes:', layout?.classList.toString());
    
    if (button) {
        console.log('Simulating button click...');
        button.click();
    }
};

window.testSidebarSetup = function() {
    console.log('🧪 Testing sidebar setup...');
    
    const inputs = document.querySelectorAll('.tutor-form-check-input.tutor-form-check-circle');
    console.log(`Found ${inputs.length} inputs`);
    
    inputs.forEach((input, index) => {
        const container = input.closest('.tutor-course-topic-item');
        const link = container?.querySelector('a[data-lesson-id]');
        const lessonId = link?.getAttribute('data-lesson-id');
        
        console.log(`Input ${index} (Lesson ${lessonId}):`, {
            disabled: input.disabled,
            readOnly: input.readOnly,
            cursor: input.style.cursor,
            hasEnabled: input.hasAttribute('data-tutor-enabled'),
            clickable: !input.disabled && !input.readOnly
        });
    });
};

// Initialize topic toggles
document.addEventListener('DOMContentLoaded', () => {
    const toggles = document.querySelectorAll('[tutor-course-single-topic-toggler]');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const topicBody = toggle.nextElementSibling;
            const isActive = toggle.classList.contains('is-active');
            
            if (topicBody) {
                if (isActive) {
                    toggle.classList.remove('is-active');
                    topicBody.classList.add('tutor-display-none');
                } else {
                    toggle.classList.add('is-active');
                    topicBody.classList.remove('tutor-display-none');
                }
            }
        });
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (tutorLessonLayout?.cleanup) {
        tutorLessonLayout.cleanup();
    }
});
