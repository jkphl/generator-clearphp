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
            validate: function (url) {
                return (url).length ? (validator.isURL(url) || 'The git repository URL must be a valid URL or empty!') : true;
            }
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

        // Initialize a git repository
        if (this.git) {
            var that = this;
            var done = this.async();

            // (Re)Initialize the Git repository
            exec('`which git` init', function (error, stdout, stderr) {
                if (!error) {

                    var setupGit = function () {
                        exec('`which git` remote add origin "' + that.git + '" && `which git` config core.filemode false', function (error, stdout, stderr) {

                            // Mark the generator as run
                            that._setRun('git');

                            done(error);
                        });
                    };

                    // Look for existing origin entries
                    exec('`which git` remote -v', function (error, stdout, stderr) {
                        if (!error) {
                            if (stdout.length) {
                                for (var l = 0, lines = stdout.split('\n'), removeOrigin = false; l < lines.length; ++l) {
                                    if (lines[l].indexOf('origin') === 0) {
                                        removeOrigin = true;
                                        break;
                                    }
                                }

                                // If there's another origin entry: Remove it before setting up the repo
                                if (removeOrigin) {
                                    exec('`which git` remote rm origin', function (error, stdout, stderr) {
                                        if (error) {
                                            done(error);
                                        } else {

                                            // Setup the repo
                                            setupGit();
                                        }
                                    });

                                } else {

                                    // Setup the repo
                                    setupGit();
                                }

                            } else {
                                // Setup the repo
                                setupGit();
                            }

                        } else {
                            done(error);
                        }
                    });

                } else {
                    done(error);
                }
            });
        }
    };
};
