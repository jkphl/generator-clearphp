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
        this.abort = this._hasRunBefore('coverage');
        if (this.abort) {
            this.log(chalk.yellow('Skipping the "coverage" generator as it has already run before ...'));
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
            name: 'coverage',
            message: 'Would you like to use Coveralls?',
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
        if (this.abort || !this.config.get('coverage')) {
            return;
        }

        // Append files
        this._configureYAMLTemplate('append/_travis.yml', '.travis.yml', this.config.getAll());
    };

    /**
     * Installing routines
     *
     * @type {Object}
     */
    install() {
        if (this.abort || !this.config.get('coverage')) {
            return;
        }

        this.log.info(chalk.yellow('Please be patient while composer downloads and installs the project dependencies ...'));
        this.log();
        this.spawnCommandSync('composer', ['require', '--dev', 'satooshi/php-coveralls']);
        this.log();

        // Mark the generator as run
        this._setRun('coverage');
    };
};
