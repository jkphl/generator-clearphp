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
        this.abort = this._hasRunBefore('codeclimate');
        if (this.abort) {
            this.log(chalk.yellow('Skipping the "codeclimate" generator as it has already run before ...'));
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
            name: 'codeclimate',
            message: 'What\'s the Code Climate API token?',
            default: this.config.get('codeclimate') || null
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
        if (this.abort || !this.config.get('codeclimate').length) {
            return;
        }

        // Copy files
        this._templateDirectory('files', '.', this.config.getAll());

        // Append files
        this._appendTemplate('append/_gitattributes', '.gitattributes', this.config.getAll());
        this._configureYAMLTemplate('append/_travis.yml', '.travis.yml', this.config.getAll());
    };

    /**
     * Installing routines
     *
     * @type {Object}
     */
    install() {
        if (this.abort || !this.config.get('codeclimate').length) {
            return;
        }

        this.log.info(chalk.yellow('Please be patient while composer downloads and installs the project dependencies ...'));
        this.log();
        this.spawnCommandSync('composer', ['require', '--dev', 'codeclimate/php-test-reporter']);
        this.log();

        // Mark the generator as run
        this._setRun('codeclimate');
    };
};
