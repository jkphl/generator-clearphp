const Generator = require('../../lib/JkphlGenerator.js');
const yosay = require('yosay');

module.exports = class extends Generator {
    /**
     * Initialization
     */
    initializing() {
        // Include subgenerators
        this.composeWith(require.resolve('../main'));
    }
};
