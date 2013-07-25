var os = require('os');

var platform = os.platform() === 'darwin' ? 'mac' : 'win';

basePath = '../';

files = [
    ANGULAR_SCENARIO,
    ANGULAR_SCENARIO_ADAPTER,
    'test/e2e/**/*.js'
];

if (platform === 'mac') {
    browsers = ['PhantomJS', 'Firefox', 'Chrome']
} else {
    browsers = ['PhantomJS', 'Firefox', 'Chrome', 'IE']
}

junitReporter = {
    outputFile: 'test_out/e2e.xml',
    suite: 'e2e'
};
