const Generator = require('../../lib/JkphlGenerator.js');
const yosay = require('yosay');

module.exports = class extends Generator {
    /**
     * Initialization
     */
    initializing() {
        if (!this.options.nested) {
            this.log(yosay('WELCOME! You\'re using jkphl\'s PHP project kickstarter.'));
        }
        this.log();

        // Include subgenerators
        this.composeWith(require.resolve('../main'), {nested: true});
    }
};
