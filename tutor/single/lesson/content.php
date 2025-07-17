<?php
/**
 * Custom TutorLMS Lesson Master Template - Updated Architecture
 * Universal full-width header with responsive sidebar behavior
 * References original plugin files when local copies don't exist
 * 
 * @package TutorLMS-Child
 * @version 2.1.0
 */

if (!defined('ABSPATH')) {
    exit;
}

// Get the HTML document structure
get_header();

// Get lesson and course data
global $post;
$course_content_id = get_the_ID();
$course_id = tutor_utils()->get_course_id_by_subcontent($course_content_id);
$is_enrolled = tutor_utils()->is_enrolled($course_id);
$is_public = get_post_meta($course_id, '_tutor_is_public_course', true);

// Get navigation data
$content_id = tutor_utils()->get_post_id($course_content_id);
$contents = tutor_utils()->get_course_prev_next_contents_by_id($content_id);
$previous_id = $contents->previous_id;
$next_id = $contents->next_id;

$prev_is_preview = get_post_meta($previous_id, '_is_preview', true);
$next_is_preview = get_post_meta($next_id, '_is_preview', true);

$prev_is_locked = !($is_enrolled || $prev_is_preview || $is_public);
$next_is_locked = !($is_enrolled || $next_is_preview || $is_public);

/**
 * Helper function to include template with plugin fallback
 */
function include_tutor_template($template_name, $fallback_message = '') {
    $local_template = get_stylesheet_directory() . '/tutor/single/lesson/' . $template_name;
    $plugin_template = WP_CONTENT_DIR . '/plugins/tutor/templates/single/lesson/' . $template_name;
    
    if (file_exists($local_template)) {
        include $local_template;
        return true;
    } elseif (file_exists($plugin_template)) {
        include $plugin_template;
        return true;
    } else {
        if ($fallback_message) {
            echo '<p>' . esc_html($fallback_message) . '</p>';
        }
        return false;
    }
}
?>

<div class="tutor-lesson-layout">
    <!-- Universal Header (Full Width Across Top) -->
    <header class="tutor-lesson-header">
        <div class="tutor-lesson-header-controls">
            <!-- Sidebar Toggle -->
            <button class="tutor-sidebar-toggle-main" aria-label="<?php esc_attr_e('Toggle sidebar', 'tutor'); ?>">
                <span class="sidebar-arrow sidebar-open">‹</span>
                <span class="sidebar-arrow sidebar-closed">›</span>
            </button>
            
            <!-- Lesson Title -->
            <div class="tutor-lesson-title">
                <h1><?php echo esc_html(get_the_title()); ?></h1>
                <div class="tutor-lesson-course-title">
                    <?php echo esc_html(get_the_title($course_id)); ?>
                </div>
            </div>
            
            <!-- Close Lesson Button -->
            <a href="<?php echo esc_url(get_permalink($course_id)); ?>" class="tutor-close-lesson-btn" aria-label="<?php esc_attr_e('Return to course', 'tutor'); ?>">
                <span class="tutor-icon-times" aria-hidden="true"></span>
            </a>
        </div>
    </header>
    
    <!-- Content Body (Header + Sidebar + Main) -->
    <div class="tutor-lesson-body">
        <!-- Sidebar -->
        <aside class="tutor-lesson-sidebar">
            <div class="tutor-sidebar-header">
                <span class="tutor-fs-6 tutor-fw-medium tutor-color-secondary">
                    <?php esc_html_e('Course Content', 'tutor'); ?>
                </span>
            </div>
            
            <div class="tutor-sidebar-content">
                <?php
                // Include our custom sidebar template (keep local version)
                $sidebar_template = get_stylesheet_directory() . '/tutor/single/lesson/lesson_sidebar.php';
                if (file_exists($sidebar_template)) {
                    include $sidebar_template;
                } else {
                    // Fallback to original TutorLMS sidebar
                    include_tutor_template('lesson_sidebar.php', 'Sidebar content loading...');
                }
                ?>
            </div>
            
            <div class="tutor-sidebar-footer">
                <?php
                // Add progress indicator
                $topics = tutor_utils()->get_topics($course_id);
                $total_lessons = 0;
                $completed_lessons = 0;
                
                if ($topics->have_posts()) {
                    while ($topics->have_posts()) {
                        $topics->the_post();
                        $topic_id = get_the_ID();
                        $topic_contents = tutor_utils()->count_completed_contents_by_topic($topic_id);
                        $total_lessons += $topic_contents['contents'] ?? 0;
                        $completed_lessons += $topic_contents['completed'] ?? 0;
                    }
                    wp_reset_postdata();
                }
                
                $progress_percentage = $total_lessons > 0 ? round(($completed_lessons / $total_lessons) * 100) : 0;
                ?>
                <div class="tutor-progress-indicator">
                    <div class="tutor-progress-text">
                        <span class="tutor-fs-7 tutor-fw-medium">
                            <?php printf(__('Progress: %d/%d lessons', 'tutor'), $completed_lessons, $total_lessons); ?>
                        </span>
                        <span class="tutor-fs-7 tutor-color-muted">
                            <?php echo $progress_percentage; ?>%
                        </span>
                    </div>
                    <div class="tutor-progress-bar">
                        <div class="tutor-progress-fill" style="width: <?php echo $progress_percentage; ?>%"></div>
                    </div>
                </div>
            </div>
        </aside>
        
        <!-- Main Content Area -->
        <main class="tutor-lesson-main">
            <!-- Scrollable Content Area -->
            <div class="tutor-lesson-content">
                <?php
                // All the lesson content from the original template
                do_action('tutor_lesson/single/before/content');
                ?>
                
                <div class="tutor-course-topic-single-body">
                    <!-- Load Lesson Video -->
                    <?php
                    $video_info = tutor_utils()->get_video_info();
                    $source_key = is_object($video_info) && 'html5' !== $video_info->source ? 'source_' . $video_info->source : null;
                    $has_source = (is_object($video_info) && $video_info->source_video_id) || (isset($source_key) ? $video_info->$source_key : null);
                    
                    if ($has_source) :
                        $completion_mode = tutor_utils()->get_option('course_completion_process');
                        $json_data = array(
                            'post_id' => get_the_ID(),
                            'best_watch_time' => 0,
                            'autoload_next_course_content' => (bool) get_tutor_option('autoload_next_course_content'),
                            'strict_mode' => ('strict' === $completion_mode),
                            'control_video_lesson_completion' => (bool) tutor_utils()->get_option('control_video_lesson_completion', false),
                            'required_percentage' => (int) tutor_utils()->get_option('required_percentage_to_complete_video_lesson', 80),
                            'video_duration' => $video_info->duration_sec ?? 0,
                            'lesson_completed' => tutor_utils()->is_completed_lesson($content_id, get_current_user_id()) !== false,
                            'is_enrolled' => tutor_utils()->is_enrolled($course_id, get_current_user_id()) !== false,
                        );
                        
                        $best_watch_time = tutor_utils()->get_lesson_reading_info(get_the_ID(), 0, 'video_best_watched_time');
                        if ($best_watch_time > 0) {
                            $json_data['best_watch_time'] = $best_watch_time;
                        }
                        ?>
                        <input type="hidden" id="tutor_video_tracking_information" value="<?php echo esc_attr(json_encode($json_data)); ?>">
                    <?php endif; ?>
                    
                    <div class="tutor-video-player-wrapper">
                        <?php echo apply_filters('tutor_single_lesson_video', tutor_lesson_video(false), $video_info, $source_key); ?>
                    </div>

                    <?php
                    // Tab content logic
                    $referer_url = wp_get_referer();
                    $page_tab = \TUTOR\Input::get('page_tab', 'overview');
                    
                    $has_lesson_content = apply_filters(
                        'tutor_has_lesson_content',
                        \TUTOR\User::is_admin() || !in_array(trim(get_the_content()), array(null, '', '&nbsp;'), true),
                        $course_content_id
                    );
                    
                    $has_lesson_attachment = count(tutor_utils()->get_attachments()) > 0;
                    $is_comment_enabled = tutor_utils()->get_option('enable_comment_for_lesson') && comments_open() && is_user_logged_in();
                    ?>

                    <div class="tutor-course-spotlight-wrapper">
                        <!-- Navigation Tabs -->
                        <ul class="tutor-nav tutor-course-spotlight-nav tutor-justify-center">
                            <?php if ($has_lesson_content && ($has_lesson_attachment || $is_comment_enabled)) : ?>
                            <li class="tutor-nav-item">
                                <a href="#" class="tutor-nav-link<?php echo 'overview' == $page_tab ? ' is-active' : ''; ?>" data-tutor-nav-target="tutor-course-spotlight-overview">
                                    <span class="tutor-icon-document-text tutor-mr-8"></span>
                                    <span><?php esc_html_e('Overview', 'tutor'); ?></span>
                                </a>
                            </li>
                            <?php endif; ?>
                            
                            <?php if ($has_lesson_attachment && ($has_lesson_content || $is_comment_enabled)) : ?>
                            <li class="tutor-nav-item">
                                <a href="#" class="tutor-nav-link<?php echo ('files' == $page_tab || false === $has_lesson_content) ? ' is-active' : ''; ?>" data-tutor-nav-target="tutor-course-spotlight-files">
                                    <span class="tutor-icon-paperclip tutor-mr-8"></span>
                                    <span><?php esc_html_e('Exercise Files', 'tutor'); ?></span>
                                </a>
                            </li>
                            <?php endif; ?>

                            <?php if ($is_comment_enabled && ($has_lesson_content || $has_lesson_attachment)) : ?>
                            <li class="tutor-nav-item">
                                <a href="#" class="tutor-nav-link<?php echo ('comments' == $page_tab || (false === $has_lesson_content && false === $has_lesson_attachment)) ? ' is-active' : ''; ?>" data-tutor-nav-target="tutor-course-spotlight-comments">
                                    <span class="tutor-icon-comment tutor-mr-8"></span>
                                    <span><?php esc_html_e('Comments', 'tutor'); ?></span>
                                </a>
                            </li>
                            <?php endif; ?>
                        </ul>

                        <!-- Tab Content -->
                        <div class="tutor-tab tutor-course-spotlight-tab">
                            <?php if ($has_lesson_content) : ?>
                            <div id="tutor-course-spotlight-overview" class="tutor-tab-item<?php echo 'overview' == $page_tab ? ' is-active' : ''; ?>">
                                <div class="tutor-container">
                                    <div class="tutor-row tutor-justify-center">
                                        <div class="tutor-col-xl-8">
                                            <?php do_action('tutor_lesson_before_the_content', $post, $course_id); ?>
                                            <div class="tutor-fs-6 tutor-color-secondary tutor-lesson-wrapper">
                                                <?php the_content(); ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <?php endif; ?>

                            <?php if ($has_lesson_attachment) : ?>
                            <div id="tutor-course-spotlight-files" class="tutor-tab-item<?php echo ('files' == $page_tab || false === $has_lesson_content) ? ' is-active' : ''; ?>">
                                <div class="tutor-container">
                                    <div class="tutor-row tutor-justify-center">
                                        <div class="tutor-col-xl-8">
                                            <div class="tutor-fs-5 tutor-fw-medium tutor-color-black"><?php esc_html_e('Exercise Files', 'tutor'); ?></div>
                                            <?php get_tutor_posts_attachments(); ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <?php endif; ?>
                            
                            <?php if ($is_comment_enabled) : ?>
                            <div id="tutor-course-spotlight-comments" class="tutor-tab-item<?php echo ('comments' == $page_tab || (false === $has_lesson_content && false === $has_lesson_attachment)) ? ' is-active' : ''; ?>">
                                <div class="tutor-container">
                                    <div class="tutor-course-spotlight-comments">
                                        <?php include_tutor_template('comment.php', 'Comments not available'); ?>
                                    </div>
                                </div>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                
                <?php do_action('tutor_lesson/single/after/content'); ?>
            </div>
            
            <!-- Sticky Footer -->
            <footer class="tutor-lesson-footer">
                <div class="tutor-lesson-footer-controls">
                    <!-- Previous Button -->
                    <div class="tutor-footer-left">
                        <?php if ($previous_id && !$prev_is_locked) : ?>
                            <a href="<?php echo esc_url(get_permalink($previous_id)); ?>" class="tutor-btn tutor-btn-secondary tutor-btn-sm">
                                <span class="tutor-icon-previous" aria-hidden="true"></span>
                                <?php esc_html_e('Previous', 'tutor'); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Mark Complete -->
                    <div class="tutor-footer-center">
                        <?php
                        $is_completed = tutor_utils()->is_completed_lesson($content_id, get_current_user_id());
                        ?>
                        <label class="tutor-mark-complete-wrapper">
                            <input type="checkbox" 
                                   class="tutor-mark-complete-checkbox" 
                                   data-lesson-id="<?php echo esc_attr($content_id); ?>"
                                   <?php echo $is_completed ? 'checked' : ''; ?>>
                            <span class="tutor-mark-complete-label">
                                <?php esc_html_e('Mark Complete', 'tutor'); ?>
                            </span>
                        </label>
                    </div>
                    
                    <!-- Next Button -->
                    <div class="tutor-footer-right">
                        <?php if ($next_id && !$next_is_locked) : ?>
                            <a href="<?php echo esc_url(get_permalink($next_id)); ?>" class="tutor-btn tutor-btn-primary tutor-btn-sm">
                                <?php esc_html_e('Next', 'tutor'); ?>
                                <span class="tutor-icon-next" aria-hidden="true"></span>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </footer>
        </main>
    </div>
</div>

<?php get_footer(); ?>
