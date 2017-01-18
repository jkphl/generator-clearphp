const Generator = require('../../lib/JkphlGenerator.js');
const yosay = require('yosay');
const chalk = require('chalk');

module.exports = class extends Generator {
    /**
     * Initialization
     */
    initializing() {
        this.abort = this._hasRunBefore('coverage');
        if (this.abort) {
            if (this.options.nested) {
                this.log(chalk.yellow('Skipping the "coverage" generator as it has already run before ...'));
            } else {
                this.log(yosay('YO! I\'m skipping the "coverage" subgenerator of jkphl\'s PHP project kickstarter because it has already been run before!'));
            }
        } else if (!this.options.nested) {
            this.log(yosay('WELCOME! You\'re using the "coverage" subgenerator of jkphl\'s PHP project kickstarter.'));
        }
        this.log();

        if (!this.abort) {
            // Mixin the git generator if it hasn't run before (and this is not a nested call)
            if (!this.options.nested && !this._hasRunBefore('git')) {
                console.log('compose with git');
                this.composeWith(require.resolve('../git'), { nested: true });
            }

            this.composeWith(require.resolve('./_index.js'));
        }
    }
};
