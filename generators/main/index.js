const Generator = require('../../lib/JkphlGenerator.js');
const yosay = require('yosay');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const chalk = require('chalk');
const validator = require('validator');
const spawn = require('child_process').spawn;

/**
 * Test whether a string is a valid PHP namespace
 *
 * @param {String} namespace Namespace
 * @param {Boolean} empty Namespace may be empty
 * @return {Boolean} Namespace is valid
 */
function isNamespace(namespace, empty) {
    if (typeof namespace !== 'string') {
        return false;
    }
    const n = namespace.trim();
    return n.length ? /^[A-Z][a-z0-9]*$/.test(n) : !!empty;
}

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
            validate: function (vendor) {
                return vendor.trim().length ? true : 'The vendor key cannot be empty!';
            }
        }, {
            name: 'project',
            message: 'What\'s the project key?',
            default: dir[1],
            validate: function (project) {
                return project.trim().length ? true : 'The project key cannot be empty!';
            }
        }, {
            name: 'description',
            message: 'Please describe your project',
            validate: function (description) {
                return description.trim().length ? true : 'The project description cannot be empty!';
            }
        }, {
            name: 'website',
            message: 'What\'s the project homepage?',
            validate: function (url) {
                return (url).length ? (validator.isURL(url) || 'The project homepage must be a valid URL or empty!') : true;
            }
        }, {
            name: 'license',
            message: 'What\'s the project license?',
            default: 'MIT',
            validate: function (license) {
                return license.trim().length ? true : 'The project license cannot be empty!';
            }
        }, {
            name: 'stability',
            message: 'What\'s the minimum stability for project dependencies?',
            type: 'list',
            choices: ['stable', 'RC', 'beta', 'alpha', 'dev'],
        }, {
            name: 'namespace',
            message: 'What\'s your project\'s main PHP namespace?',
            validate: function (namespace) {
                return (namespace.trim().length && isNamespace(namespace, true)) || 'The project main PHP namespace must be valid!';
            }
        }, {
            name: 'module',
            message: 'What\'s the module name of your project (dash for none)?',
            default: function (answers) {
                return answers.project.substr(0, 1).toUpperCase() + answers.project.substr(1).toLowerCase();
            },
            validate: function (module) {
                const m = module.trim();
                if (m == '-') {
                    return true;
                }
                return m.length ? (isNamespace(module, true) || 'The project module name must be valid or empty!') : true;
            }
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
                return name.trim().length ? true : 'The author name cannot be empty!';
            }
        }, {
            name: 'authorEmail',
            message: 'What\'s the author\'s email address?',
            validate: function (email) {
                return email.trim().length ? (validator.isEmail(email) || 'The project author\'s email address must be valid or empty!') : true;
            }
        }, {
            name: 'authorWebsite',
            message: 'What\'s the author\'s website?',
            validate: function (url) {
                return (url).length ? (validator.isURL(url) || 'The project author\'s website must be a valid URL or empty!') : true;
            }
        }];

        return this.prompt(prompts).then(function (props) {
            if (props.module.trim() === '-') {
                props.module = null;
            }
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

        this._templateDirectory('files', '.', this.config.getAll());
        this._templateDirectory('directories', path.join('src', this.config.get('module') || '.'), this.config.getAll());
    };

    /**
     * Writing generator specific files
     */
    writing() {
        // Create the documentation directory
        this._mkdirp('doc');
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
