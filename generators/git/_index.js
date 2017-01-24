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
        this.abort = this._hasRunBefore('git');
        if (this.abort) {
            this.log(chalk.yellow('Skipping the "git" generator as it has already run before ...'));
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
            name: 'git',
            message: 'What\'s the Git repository URL for this project?',
            default: this.config.get('git') || null,
            validate: function (url) {
                const isURL = validator.isURL(url, { protocols: ['http', 'https', 'ssh'] }) || /^[a-z0-9]+@[a-z0-9]+\.[a-z]+:.+$/i.test(url);
                return url.length ? (isURL || 'The git repository URL must be a valid URL or empty!') : true;
            }
        }];

        return this.prompt(prompts).then(function (props) {
            for (let prop in props) {
                if (props.hasOwnProperty(prop)) {
                    this.config.set(prop, props[prop].trim());
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
        if (this.abort || !this.config.get('git').length) {
            return;
        }

        // Copy files
        this._templateDirectory('files', '.', this.config.getAll());
    };

    /**
     * Installing routines
     *
     * @type {Object}
     */
    install() {
        if (this.abort) {
            return;
        }


    };
};
