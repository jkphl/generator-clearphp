const Generator = require('../../lib/JkphlGenerator.js');
const yosay = require('yosay');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const chalk = require('chalk');
const spawn = require('child_process').spawn;

module.exports = class extends Generator {
    /**
     * Initialization
     */
    initializing() {
        this.abort = this._hasRunBefore('main');
        if (this.abort) {
            if (this.options.nested) {
                this.log(chalk.yellow('Skipping the "main" generator as it has already run before ...'));
            } else {
                this.log(yosay('HAH! I\'m skipping the "main" subgenerator of jkphl\'s PHP project kickstarter because it has already been run before!'));
            }
        } else if (!this.options.nested) {
            this.log(yosay('WELCOME! You\'re using the "main" subgenerator of jkphl\'s PHP project kickstarter.'));
        }
        this.log();

        // Determine the default minimum PHP version
        if (!this.abort) {
            this.php = '>=';
            const done = this.async();
            const child = spawn('php', ['-r', "preg_match('/^\\d+(\\.\\d+)*/', PHP_VERSION, $phpVersion); echo $phpVersion[0];"])
            child.stdout.on('data', (chunk) => this.php += chunk.toString());
            child.on('close', done);
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

        let dir = path.basename(process.cwd()).split('-', 2);
        while (dir.length < 2) {
            dir.unshift(null);
        }

        // Ask for project key, author and TYPO3 version
        const prompts = [{
            name: 'vendor',
            message: 'What\'s the vendor key (Github profile / organization)?',
            default: dir[0],
            validate: function (name) {
                return ('' + name).length ? true : 'The vendor key cannot be empty!';
            }
        }, {
            name: 'project',
            message: 'What\'s the project key?',
            default: dir[1],
            validate: function (name) {
                return ('' + name).length ? true : 'The project key cannot be empty!';
            }
        }, {
            name: 'description',
            message: 'Please describe your project',
            validate: function (name) {
                return ('' + name).length ? true : 'The project description cannot be empty!';
            }
        }, {
            name: 'website',
            message: 'What\'s the project homepage?',
        }, {
            name: 'license',
            message: 'What\'s the project license?',
            default: 'MIT',
            validate: function (name) {
                return ('' + name).length ? true : 'The project license cannot be empty!';
            }
        }, {
            name: 'stability',
            message: 'What\'s the minimum stability for project dependencies?',
            type: 'list',
            choices: ['stable', 'RC', 'beta', 'alpha', 'dev'],
        }, {
            name: 'namespace',
            message: 'What\'s your project\'s main PHP namespace?'
        }, {
            name: 'php',
            message: 'What\'s the project\'s PHP version requirement?',
            default: this.php,
            validate: function (version) {
                return (semver.valid(version) || semver.validRange(version)) ? true : 'Please enter a valid semver value (range)!';
            }
        }, {
            name: 'authorName',
            message: 'What\'s the author\'s name?',
            validate: function (name) {
                return ('' + name).length ? true : 'The author name cannot be empty!';
            }
        }, {
            name: 'authorEmail',
            message: 'What\'s the author\'s email address?'
        }, {
            name: 'authorWebsite',
            message: 'What\'s the author\'s website?'
        }];

        return this.prompt(prompts).then(function (props) {
            for (let prop in props) {
                if (props.hasOwnProperty(prop)) {
                    this.config.set(prop, props[prop]);
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
        if (this.abort) {
            return;
        }

        this._template('_composer.json', 'composer.json', this.config.getAll());
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

        this.log.info(chalk.yellow('Please be patient while composer downloads and installs the project dependencies ...'));
        this.log();
        this.spawnCommandSync('composer', ['config', 'repositories.graph-composer', 'git', 'https://github.com/jkphl/graph-composer']);
        this.spawnCommandSync('composer', ['require', '--dev', 'clue/graph-composer:dev-master']);
        // this.spawnCommandSync('composer', ['install']);
        this.log();

        // Mark the generator as run
        this._setRun('main');
    };
};