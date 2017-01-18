const Generator = require('../../lib/JkphlGenerator.js');
const path = require('path');
const chalk = require('chalk');
const validator = require('validator');
const exec = require('child_process').exec;

module.exports = class extends Generator {
    /**
     * Initialization
     */
    initializing() {
        this.abort = this._hasRunBefore('scrutinizer');
        if (this.abort) {
            this.log(chalk.yellow('Skipping the "scrutinizer" generator as it has already run before ...'));
            this.log();
        }
    }

    /**
     * Prompting methods
     *
     * @type {Object}
     */
    prompting() {
        if (this.abort) {
            return;
        }

        // Ask for project key, author and TYPO3 version
        const prompts = [{
            name: 'scrutinizer',
            message: 'Would you like to use Scrutinizer?',
            type: 'confirm'
        }];

        return this.prompt(prompts).then(function (props) {
            for (let prop in props) {
                if (props.hasOwnProperty(prop)) {
                    this.config.set(prop, !!props[prop]);
                }
            }
            this.config.save();
        }.bind(this));
    }

    /**
     * Configuration preparations
     *
     * @type {Object}
     */
    configuring() {
        if (this.abort || !this.config.get('scrutinizer')) {
            return;
        }

        // Copy files
        this._templateDirectory('files', '.', this.config.getAll());

        // Append files
        this._configureYAMLTemplate('append/_travis.yml', '.travis.yml', this.config.getAll());

        // Mark the generator as run
        this._setRun('scrutinizer');
    };
};
