var os = require('os');

var platform = os.platform() === 'darwin' ? 'mac' : 'win';

basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'vendor/jquery-1.9.1.js',
    'vendor/underscore.js',
    'lib/angular.1.1.5.js',
    'lib/angular-*.js',
    'test/lib/angular/angular-mocks.js',
    'src/**/*.js',
    'test/unit/**/*.js',
];

autoWatch = true;

if (platform === 'mac') {
    browsers = ['PhantomJS', 'Firefox', 'Chrome']
} else {
    browsers = ['PhantomJS', 'Firefox', 'Chrome', 'IE']
}

junitReporter = {
    outputFile: 'test_out/unit.xml',
    suite: 'unit'
};
