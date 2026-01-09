const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Run unit tests before integration tests
    const unitTests = tests.filter(test => test.path.includes('/unit/'));
    const integrationTests = tests.filter(test => test.path.includes('/integration/'));
    const otherTests = tests.filter(test =>
      !test.path.includes('/unit/') && !test.path.includes('/integration/')
    );

    return [...unitTests, ...integrationTests, ...otherTests];
  }
}

module.exports = CustomSequencer;