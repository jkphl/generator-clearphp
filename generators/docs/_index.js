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
        this.abort = this._hasRunBefore('docs');
        if (this.abort) {
            this.log(chalk.yellow('Skipping the "docs" generator as it has already run before ...'));
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
            name: 'readthedocs',
            message: 'Would you like to use Read The Docs for creating a documention?',
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
        if (this.abort || !this.config.get('readthedocs')) {
            return;
        }

        // Copy files
        this._templateDirectory('files', '.', this.config.getAll());

        // Append files
        this._appendTemplate('append/_gitattributes', '.gitattributes', this.config.getAll());

        // Mark the generator as run
        this._setRun('docs');
    };
};
