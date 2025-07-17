# TutorLMS Custom Lesson Interface

A modern, app-like lesson interface for TutorLMS that provides an intuitive learning experience with responsive design, clean navigation, and seamless functionality.

![TutorLMS Custom Interface](https://img.shields.io/badge/TutorLMS-Custom%20Interface-blue) ![WordPress](https://img.shields.io/badge/WordPress-Child%20Theme-green) ![Responsive](https://img.shields.io/badge/Design-Responsive-orange)

## 🎯 What This Project Does

This custom child theme completely reimagines the TutorLMS lesson interface, transforming it from a traditional WordPress page layout into a modern, full-screen learning environment that feels more like a native application than a web page.

### Key Features

- **🖥️ Full-Screen Layout**: Immersive lesson experience that uses the entire viewport
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **🔄 Toggle Sidebar**: Collapsible course navigation that preserves user preferences
- **📊 Visual Progress Tracking**: Clear progress indicators and lesson completion status
- **⚡ Smooth Interactions**: App-like animations and transitions
- **♿ Accessibility Focused**: WCAG 2.1 AA compliant with proper ARIA labels
- **🔄 Update-Safe**: Plugin-compatible architecture that survives TutorLMS updates

## 🤔 Why This Project Was Created

### The Problem

The default TutorLMS lesson interface, while functional, suffers from several user experience issues:

1. **Fragmented Layout**: Traditional WordPress page structure with header, sidebar, and footer competing for space
2. **Poor Mobile Experience**: Responsive issues and cramped content on smaller screens  
3. **Inconsistent Navigation**: Course navigation buried in sidebars or requiring page scrolls
4. **Visual Clutter**: Too many competing elements drawing attention away from lesson content
5. **Outdated Feel**: Interface that feels dated compared to modern learning platforms

### The Vision

We wanted to create a learning interface that:

- **Focuses on Content**: Lesson material takes center stage without distractions
- **Feels Modern**: Clean, app-like interface that users expect from contemporary platforms
- **Works Everywhere**: Consistent experience across all devices and screen sizes
- **Stays Current**: Architecture that adapts to TutorLMS updates without breaking
- **Enhances Learning**: Thoughtful UX that actually improves the learning process

### Design Philosophy

> "The best interface is the one that gets out of the way of the content."

Our approach prioritizes:
- **Content First**: Every design decision serves the primary goal of content consumption
- **Progressive Enhancement**: Base functionality works everywhere, enhanced features improve the experience
- **User Agency**: Learners control their environment (sidebar visibility, state persistence)
- **Performance**: Fast, smooth interactions that don't interrupt the learning flow

## 🏗️ How It Works

### Architecture Overview

The custom interface replaces the default TutorLMS lesson template with a carefully architected system:

```
┌─────────────────────────────────────────────────────────────┐
│                    Full Viewport Layout                     │
├─────────────────┬───────────────────────────────────────────┤
│                 │           Universal Header                │
│   Collapsible   ├───────────────────────────────────────────┤
│    Sidebar      │                                           │
│                 │            Main Content                   │
│ • Course Nav    │          • Video Player                   │
│ • Progress      │          • Lesson Content                 │
│ • Completion    │          • Tabs (Overview/Files/Comments) │
│                 │                                           │
│                 ├───────────────────────────────────────────┤
│                 │        Sticky Footer Navigation           │
└─────────────────┴───────────────────────────────────────────┘
```

### Technical Implementation

#### 1. Template Interception
```php
// functions.php - Take control of lesson rendering
function custom_tutor_lesson_template($template) {
    if (is_tutor_lesson_page()) {
        $custom = get_stylesheet_directory() . '/tutor/single/lesson/content.php';
        if (file_exists($custom)) return $custom;
    }
    return $template;
}
add_filter('template_include', 'custom_tutor_lesson_template', 99);
```

#### 2. Plugin Fallback System
```php
// Smart template inclusion with plugin fallbacks
function include_tutor_template($template_name, $fallback_message = '') {
    $local_template = get_stylesheet_directory() . '/tutor/single/lesson/' . $template_name;
    $plugin_template = WP_CONTENT_DIR . '/plugins/tutor/templates/single/lesson/' . $template_name;
    
    if (file_exists($local_template)) {
        include $local_template;
    } elseif (file_exists($plugin_template)) {
        include $plugin_template; // Automatic plugin updates!
    }
}
```

#### 3. Clean State Management
```javascript
// Simple, predictable behavior control
class TutorLessonLayout {
    toggleSidebar() {
        this.container.classList.toggle('sidebar-is-hidden');
        localStorage.setItem('tutor-sidebar-state', 
            this.container.classList.contains('sidebar-is-hidden') ? 'hidden' : 'visible'
        );
    }
}
```

#### 4. CSS Architecture
```css
/* Single source of truth for layout */
.tutor-lesson-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

/* Simple, clean state toggles */
.tutor-lesson-layout.sidebar-is-hidden .tutor-lesson-sidebar {
    margin-left: -350px; /* Desktop */
}

@media (max-width: 768px) {
    .tutor-lesson-layout.sidebar-is-hidden .tutor-lesson-sidebar {
        transform: translateX(-100%); /* Mobile overlay */
    }
}
```

## 📁 File Structure

```
wp-content/themes/your-child-theme/
├── tutor/
│   └── single/
│       └── lesson/
│           ├── content.php           # Main lesson template
│           └── lesson_sidebar.php    # Course navigation sidebar
├── assets/
│   ├── css/
│   │   └── tutor-lesson-layout.css  # Complete interface styling
│   └── js/
│       └── tutor-lesson-behavior.js # Interactive functionality
├── functions.php                    # Template control & asset loading
├── style.css                        # Child theme declaration
└── README.md                        # This file
```

## 🚀 Installation

### Prerequisites
- WordPress 5.0+
- TutorLMS 3.0+ (tested with 3.6.3)
- Hello Elementor theme (or compatible parent theme)

### Step 1: Install the Child Theme
1. Download or clone this repository
2. Upload to `/wp-content/themes/your-child-theme/`
3. Activate the child theme in WordPress admin

### Step 2: Configure TutorLMS
1. Ensure TutorLMS is active and configured
2. Test a few lessons to verify base functionality
3. Clear any caching plugins

### Step 3: Customize (Optional)
1. Adjust color scheme in `tutor-lesson-layout.css` (see [Color Customization](#-color-customization))
2. Modify layout breakpoints if needed
3. Add any additional styling for your brand

## 🎨 Color Customization

The interface uses CSS custom properties for easy color scheme changes:

```css
:root {
    /* Change these values to match your brand */
    --primary-color: #2c3e50;      /* Header background, accents */
    --accent-color: #3498db;       /* Links, active states, progress */
    --success-color: #27ae60;      /* Completion indicators */
    --light-bg: #f8f9fa;          /* Sidebar background */
    --text-primary: #2c3e50;      /* Main text color */
}
```

### Pre-built Color Schemes

```css
/* Professional Blue (Default) */
--primary-color: #2c3e50;
--accent-color: #3498db;

/* Green Education */
--primary-color: #064e3b;
--accent-color: #059669;

/* Purple Creative */
--primary-color: #581c87;
--accent-color: #8b5cf6;
```

## 📱 Responsive Behavior

The interface adapts intelligently across screen sizes:

| Screen Size | Behavior |
|-------------|----------|
| **Desktop** (1200px+) | Full two-column layout, sidebar pushes content |
| **Large Tablet** (1024px-1199px) | Narrower sidebar, preserved layout |
| **Tablet** (768px-1023px) | Collapsible sidebar, full-width when open |
| **Mobile** (480px-767px) | Overlay sidebar, optimized touch targets |
| **Small Mobile** (<480px) | Compact interface, simplified navigation |

## 🔧 Customization Options

### Layout Modifications
```css
/* Adjust sidebar width */
.tutor-lesson-sidebar {
    width: 400px; /* Default: 350px */
}

/* Change header height */
:root {
    --header-height: 70px; /* Default: 60px */
}
```

### Feature Toggles
```php
// Disable specific features in functions.php
remove_action('wp_enqueue_scripts', 'enqueue_tutor_lesson_assets');  // Disable custom styles
```

### Progress Indicator Customization
```css
/* Customize progress bar styling */
.tutor-progress-fill {
    background: linear-gradient(90deg, var(--accent-color), var(--success-color));
}
```

## 🔄 Plugin Update Compatibility

### Automatic Fallbacks
The system includes smart fallbacks that automatically use updated plugin templates:

```php
// If local template doesn't exist, use plugin version
if (!file_exists($local_template)) {
    include WP_CONTENT_DIR . '/plugins/tutor/templates/single/lesson/' . $template_name;
}
```

### Safe Customization Areas
- ✅ **Safe to customize**: Layout structure, styling, navigation behavior
- ✅ **Automatically updated**: Comments, completion forms, quiz displays
- ⚠️ **Monitor after updates**: Video player integration, new TutorLMS features

### Update Workflow
1. **Backup** your customizations before TutorLMS updates
2. **Test** lesson functionality after plugin updates
3. **Review** changelog for breaking changes
4. **Update** templates only if new features are beneficial

## 🐛 Troubleshooting

### Common Issues

**Sidebar won't toggle**
```javascript
// Check browser console for JavaScript errors
console.log(window.TutorLessonLayout); // Should show API object
```

**Styling conflicts**
```css
/* Increase CSS specificity if needed */
.tutor-lesson-layout .your-conflicting-element {
    /* Override styles here */
}
```

**Mobile layout issues**
```css
/* Force mobile styles if needed */
@media (max-width: 768px) {
    .tutor-lesson-layout {
        /* Mobile-specific fixes */
    }
}
```

### Debug Mode

Enable debug logging in `functions.php`:
```php
// Add debugging
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ Custom lesson template loaded');
}
```

## 🤝 Contributing

We welcome contributions! Please:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Test** thoroughly across devices
4. **Document** any changes
5. **Submit** a pull request

### Development Guidelines
- Follow WordPress coding standards
- Test on multiple screen sizes
- Ensure accessibility compliance
- Document any breaking changes

## 📄 License

This project is licensed under the GPL v2 or later - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **TutorLMS Team** - For the excellent learning management system
- **WordPress Community** - For the robust platform
- **Elementor Team** - For the Hello Elementor base theme

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/tutorlms-custom-interface/issues)
- **Documentation**: [Project Wiki](https://github.com/your-username/tutorlms-custom-interface/wiki)
- **Community**: [WordPress Forums](https://wordpress.org/support/)

---

**Made with ❤️ for better online learning experiences**

*Transform your TutorLMS lessons into a modern, engaging learning environment that your students will love.*