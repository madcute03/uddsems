<?php
// Test PHP configuration
echo "PHP is working!\n";
echo "PHP Version: " . phpversion() . "\n";

// Test file writing
$testFile = __DIR__ . '/test_write.txt';
file_put_contents($testFile, 'Test content');
echo "File write test: " . (file_exists($testFile) ? 'SUCCESS' : 'FAILED') . "\n";

// Test database connection
try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    
    echo "Laravel bootstrapped successfully\n";
} catch (Exception $e) {
    echo "Error bootstrapping Laravel: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
