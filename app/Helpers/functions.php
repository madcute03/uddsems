<?php

if (!function_exists('safeError')) {
    /**
     * Return a safe error message based on the environment
     *
     * @param \Throwable $e
     * @return string
     */
    function safeError(\Throwable $e) {
        return app()->environment('local') ? $e->getMessage() : 'Something went wrong';
    }
}
