const Generator = require('../../lib/JkphlGenerator.js');
const yosay = require('yosay');
const chalk = require('chalk');

module.exports = class extends Generator {
    /**
     * Initialization
     */
    initializing() {
        this.abort = this._hasRunBefore('git');
        if (this.abort) {
            if (this.options.nested) {
                this.log(chalk.yellow('Skipping the "git" generator as it has already run before ...'));
            } else {
                this.log(yosay('HAH! I\'m skipping the "git" subgenerator of jkphl\'s PHP project kickstarter because it has already been run before!'));
            }
        } else if (!this.options.nested) {
            this.log(yosay('WELCOME! You\'re using the "git" subgenerator of jkphl\'s PHP project kickstarter.'));
        }
        this.log();

        if (!this.abort) {
            // Mixin the main generator if it hasn't run before
            if (!this._hasRunBefore('main')) {
                this.composeWith(require.resolve('../main'), { nested: true });
            }

            this.composeWith(require.resolve('./_index.js'));
        }
    }
};
