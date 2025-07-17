<?php
/**
 * File: functions.php
 * Theme Component: Tutor LMS Child Theme
 * Description: Custom functionality for Tutor LMS lesson pages, including template overrides, asset enqueues, and compatibility checks.
 * Author: Ambient Technology
 * Version: 2.3.1
 * Template: hello-elementor
 * URL: https://ambient.technology
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Check if current page is a TutorLMS lesson
 */
function is_tutor_lesson_page() {
    global $post;

    return (
        is_singular('lesson') ||
        is_singular('tutor_lesson') ||
        is_singular('lessons') ||
        (is_single() && in_array(get_post_type(), ['lesson', 'tutor_lesson', 'lessons'])) ||
        (strpos($_SERVER['REQUEST_URI'], '/lessons/') !== false) ||
        ($post && function_exists('tutor_utils') && tutor_utils()->is_lesson($post->ID))
    );
}

/**
 * Override TutorLMS lesson template
 */
function custom_tutor_lesson_template($template) {
    if (is_tutor_lesson_page()) {
        $custom = get_stylesheet_directory() . '/tutor/single/lesson/content.php';
        if (file_exists($custom)) return $custom;
    }
    return $template;
}
add_filter('template_include', 'custom_tutor_lesson_template', 99);

/**
 * Enqueue lesson-specific assets
 */
function enqueue_tutor_lesson_assets() {
    if (is_tutor_lesson_page()) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('✅ Enqueuing lesson assets');
        }

        wp_enqueue_style(
            'tutor-lesson-layout',
            get_stylesheet_directory_uri() . '/assets/css/tutor-lesson-layout.css',
            [],
            '1.0.5'
        );

        wp_enqueue_script(
            'tutor-lesson-behavior',
            get_stylesheet_directory_uri() . '/assets/js/tutor-lesson-behavior.js',
            ['jquery'],
            '1.0.10',
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_tutor_lesson_assets', 10);

/**
 * Remove conflicting TutorLMS styles
 */
function dequeue_conflicting_tutor_styles() {
    if (is_tutor_lesson_page()) {
        wp_dequeue_style('tutor-course-single');
        wp_dequeue_style('tutor-lesson-single');
    }
}
add_action('wp_enqueue_scripts', 'dequeue_conflicting_tutor_styles', 15);

/**
 * Cleanup dev/test inline styles
 */
function cleanup_temp_styles() {
    if (is_tutor_lesson_page()) {
        remove_action('wp_head', 'inline_tutor_lesson_css');
        remove_action('wp_head', 'inline_complete_tutor_css');
        remove_action('wp_head', 'temp_inline_tutor_css');
    }
}
add_action('wp_head', 'cleanup_temp_styles', 1);

/**
 * Add custom body class
 */
function add_tutor_lesson_body_class($classes) {
    if (!is_admin() && did_action('wp') && is_tutor_lesson_page()) {
        $classes[] = 'tutor-custom-layout';
    }
    return $classes;
}
add_filter('body_class', 'add_tutor_lesson_body_class');

/**
 * Add test class to confirm load
 */
add_filter('body_class', function($classes) {
    $classes[] = 'functions-php-working';
    return $classes;
});

/**
 * Display visual admin bar indicator - PRODUCTION VERSION
 */
function add_admin_bar_indicator() {
    if (is_admin_bar_showing() && defined('WP_DEBUG') && WP_DEBUG) {
        echo '<style>
            #wpadminbar::after {
                content: "✅ Functions.php OK";
                position: absolute;
                right: 10px;
                top: 5px;
                color: lime;
                font-size: 12px;
            }
        </style>';
    }
}
add_action('wp_head', 'add_admin_bar_indicator');

/**
 * Optional visual footer debug - DISABLED FOR PRODUCTION
 */
function debug_lesson_page_detection() {
    // Debug disabled for production
    // Uncomment for development debugging only
    /*
    if (current_user_can('administrator')) {
        add_action('wp_footer', function() {
            echo '<div style="position:fixed;top:50px;right:20px;padding:10px;background:' .
                (is_tutor_lesson_page() ? 'green' : 'red') . ';color:white;z-index:9999;">' .
                (is_tutor_lesson_page() ? '✅ Lesson page detected' : '❌ Not lesson page') .
                '</div>';
        });
    }
    */
}
// Commented out to remove debug message: add_action('init', 'debug_lesson_page_detection');

/**
 * TutorLMS version handling
 */
function get_tutor_version_safe() {
    return defined('TUTOR_VERSION') ? TUTOR_VERSION : '1.0.0';
}

function is_tutor_version_compatible($min_version) {
    return version_compare(get_tutor_version_safe(), $min_version, '>=');
}

/**
 * Fallback template inclusion
 */
function safe_include_tutor_template($template_path, $fallback_content = null) {
    $child = get_stylesheet_directory() . '/tutor/single/lesson/' . $template_path;
    if (file_exists($child)) {
        include $child;
        return true;
    }

    if (defined('TUTOR_TEMPLATES_DIR')) {
        $plugin_template = TUTOR_TEMPLATES_DIR . 'single/lesson/' . $template_path;
        if (file_exists($plugin_template)) {
            include $plugin_template;
            return true;
        }
    }

    if ($fallback_content) {
        echo $fallback_content;
    }
    return false;
}

/**
 * Track plugin updates
 */
function track_tutor_updates() {
    $current = get_tutor_version_safe();
    $stored = get_option('custom_tutor_tracked_version', '1.0.0');

    if (version_compare($current, $stored, '>')) {
        update_option('custom_tutor_tracked_version', $current);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("TutorLMS updated from {$stored} to {$current}");
        }
        run_compatibility_checks();
    }
}
add_action('admin_init', 'track_tutor_updates');

/**
 * TutorLMS compatibility checks
 */
function run_compatibility_checks() {
    $checks = [
        'tutor_utils_exists'        => function_exists('tutor_utils'),
        'course_functions_exist'    => function_exists('tutor_utils') && method_exists(tutor_utils(), 'get_topics'),
        'video_functions_exist'     => function_exists('tutor_lesson_video'),
        'progress_tracking_exists'  => function_exists('tutor_utils') && method_exists(tutor_utils(), 'is_completed_lesson'),
    ];

    foreach ($checks as $label => $pass) {
        if (!$pass) {
            error_log("TutorLMS Compatibility Issue: {$label} failed");
        }
    }
}

/**
 * Show admin notice if TutorLMS is missing
 */
function tutor_dependency_check() {
    if (!class_exists('TUTOR\Tutor')) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-warning"><p><strong>TutorLMS Custom Layout:</strong> TutorLMS plugin is required for this theme to work properly.</p></div>';
        });
    }
}
add_action('admin_init', 'tutor_dependency_check');
