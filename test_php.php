<?php
// Test basic PHP functionality
echo "PHP is working!\n";

// Test file operations
$testFile = __DIR__ . '/test_output.txt';
file_put_contents($testFile, 'Test output');

echo "File operations are working. Check for 'test_output.txt' in the project root.\n";

// Test Composer autoload
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
    echo "Composer autoload is working.\n";
} else {
    echo "Composer autoload file not found.\n";
}
?>
