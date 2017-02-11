/* eslint-disable no-underscore-dangle, no-bitwise, no-restricted-properties */

const Generator = require('yeoman-generator');
const fs = require('fs-extra');
const walkSync = require('klaw-sync');
const path = require('path');
const mkdirp = require('mkdirp');
const ejs = require('ejs');
const yaml = require('js-yaml');
const merge = require('deepmerge');
const semver = require('semver');
const chalk = require('chalk');
const validator = require('validator');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const licenses = require('generator-license').licenses;
const giturl = require('git-url-parse');

const generators = [
    'main', // 1
    'github', // 2
    'codeclimate', // 4
    'scrutinizer', // 8
    'coverage', // 16
    'docs', // 32
    'apidocs', // 64
    'all', // 128
];
const generatorDependecies = [
    1, // main
    3, // main + github
    7, // main + github + codeclimage
    11, // main + github + scrutinizer
    19, // main + github + coverage
    35, // main + github + docs
    67, // main + apidocs
    127, // all
];
const inverseDependencies = {
    github: 62,
    codeclimate: 4,
    scrutinizer: 8,
    coverage: 16,
    docs: 32,
    apidocs: 64,
};

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

/**
 * Test whether a URL is a valid Github repository URL
 *
 * @param {String} url URL
 * @returns {Boolean} Is a valid Github repository URL
 */
function isGithubUrl(url) {
    try {
        const git = giturl(url);
        if ((git.resource === 'github.com') && (git.owner.length > 0) && (git.name.length > 0)) {
            return {
                ssh: `git@github.com:${git.owner}/${git.name}.git`,
                https: `https://github.com/${git.owner}/${git.name}`,
            };
        }
        return false;
    } catch (e) {
        return false;
    }
}

module.exports = class extends Generator {
    /**
     * Constructor
     *
     * @param {String|Array} args Arguments
     * @param {Object} options Options
     */
    constructor(args, options) {
        super(args, options);
        this.config.defaults({
            run: 0,
            github: '',
            codeclimate: '',
            scrutinizer: false,
            coverage: false,
            docs: false,
            apidocs: false,
            year: (new Date()).getFullYear(),
        });

        // Determine the stages to run
        this.stage = options.run || 'none';
        const runIndex = generators.indexOf(this.stage);
        this.runGenerators = (runIndex >= 0) ? generatorDependecies[runIndex] : 0;
        this.runGenerators &= ~this.config.get('run');

        // Change the source root directory
        this._sourceRoot = path.join(__dirname, 'templates');
    }

    /**
     * Initializing
     */
    initializing() {
        // If the main stage should be run
        if (this._shouldRun('main')) {
            this.php = '>=';
            const done = this.async();
            const child = spawn('php', ['-r', "preg_match('/^\\d+(\\.\\d+)/', PHP_VERSION, $phpVersion); echo $phpVersion[0];"]);
            child.stdout.on('data', (chunk) => {
                this.php += chunk.toString();
            });
            child.on('close', done);
        }
    }

    /**
     * Prompting methods
     */
    prompting() {
        let prompts = [];

        // If the main stage should be run
        if (this._shouldRun('main')) {
            const dir = path.basename(process.cwd()).split('-', 2);
            while (dir.length < 2) {
                dir.unshift(null);
            }

            // Ask for project key, author and TYPO3 version
            prompts = [{
                name: 'vendor',
                message: 'What\'s the vendor key (e.g. Github profile / organization)?',
                default: this.config.get('vendor') || dir[0],
                validate(vendor) {
                    return vendor.trim().length ? true : 'The vendor key cannot be empty!';
                },
            }, {
                name: 'project',
                message: 'What\'s the project key?',
                default: this.config.get('project') || dir[1],
                validate(project) {
                    return project.trim().length ? true : 'The project key cannot be empty!';
                },
            }, {
                name: 'description',
                message: 'Please describe your project',
                default: this.config.get('description') || null,
                validate(description) {
                    return description.trim().length ? true : 'The project description cannot be empty!';
                },
            }, {
                name: 'website',
                message: 'What\'s the project homepage?',
                default: this.config.get('website') || null,
                validate(url) {
                    return (url).length ? (validator.isURL(url) || 'The project homepage must be a valid URL or empty!') : true;
                },
            }, {
                name: 'license',
                message: 'What\'s the project license?',
                default: this.config.get('license') || 'MIT',
                type: 'list',
                choices: licenses,
            }, {
                name: 'stability',
                message: 'What\'s the minimum stability for project dependencies?',
                default: this.config.get('stability') || 'stable',
                type: 'list',
                choices: ['stable', 'RC', 'beta', 'alpha', 'dev'],
            }, {
                name: 'namespace',
                message: 'What\'s your project\'s main PHP namespace?',
                default: answers => this.config.get('namespace') || (answers.vendor.substr(0, 1).toUpperCase() + answers.vendor.substr(1).toLowerCase()),
                validate(namespace) {
                    return (namespace.trim().length && isNamespace(namespace, true)) || 'The project main PHP namespace must be valid!';
                },
            }, {
                name: 'module',
                message: 'What\'s the module name of your project (dash for none)?',
                default: answers => this.config.get('module') || (answers.project.substr(0, 1).toUpperCase() + answers.project.substr(1).toLowerCase()),
                validate: m => ((m && m.length) ? (isNamespace(m, true) || 'The project module name must be valid or empty!') : true),
                filter: m => ((m.length && (m.trim() === '-')) ? null : m),
            }, {
                name: 'php',
                message: 'What\'s the project\'s PHP version requirement?',
                default: this.config.get('php') || this.php,
                validate(version) {
                    return (semver.valid(version) || semver.validRange(version)) ? true : 'Please enter a valid semver value (range)!';
                },
            }, {
                name: 'authorName',
                message: 'What\'s the author\'s name?',
                default: this.config.get('authorName') || null,
                validate(name) {
                    return name.trim().length ? true : 'The author name cannot be empty!';
                },
            }, {
                name: 'authorEmail',
                message: 'What\'s the author\'s email address?',
                default: this.config.get('authorEmail') || null,
                validate(email) {
                    return (email.trim().length && validator.isEmail(email)) ? true : 'The project author\'s email address must be valid!';
                },
            }, {
                name: 'authorWebsite',
                message: 'What\'s the author\'s website?',
                default: this.config.get('authorWebsite') || null,
                validate(url) {
                    return (url.length && validator.isURL(url)) ? true : 'The project author\'s website must be a valid URL!';
                },
            }];
        }

        // If the github stage should be run
        if (this._shouldRun('github')) {
            prompts.push({
                name: 'github',
                message: 'What\'s the Github repository URL for this project (dash for none)?',
                default: answers => (this.config.get('github') ? this.config.get('github').http : false) || `https://github.com/${(answers.vendor || this.config.get('vendor')).toLowerCase()}/${(answers.project || this.config.get('project')).toLowerCase()}`,
                validate: url => ((url === false) ? 'The URL must be empty or a valid Github repository URL!' : true),
                filter(url) {
                    if (url.trim() === '-') {
                        return '';
                    }
                    return isGithubUrl(url);
                },
            });
        }

        // If the codeclimate stage should run
        if (this._shouldRun('codeclimate')) {
            prompts.push({
                name: 'codeclimate',
                message: 'What\'s the Code Climate API token?',
                default: this.config.get('codeclimate') || null,
                when: a => typeof (a.github || this.config.get('github')) === 'object',
            });
        }

        // If the scrutinizer stage should run
        if (this._shouldRun('scrutinizer')) {
            prompts.push({
                name: 'scrutinizer',
                message: 'Would you like to use Scrutinizer?',
                type: 'confirm',
                when: a => typeof (a.github || this.config.get('github')) === 'object',
            });
        }

        // If the coverage stage should run
        if (this._shouldRun('coverage')) {
            prompts.push({
                name: 'coverage',
                message: 'Would you like to use Coveralls?',
                type: 'confirm',
                when: a => typeof (a.github || this.config.get('github')) === 'object',
            });
        }

        // If the docs stage should run
        if (this._shouldRun('docs')) {
            prompts.push({
                name: 'docs',
                message: 'Would you like to use Read The Docs for creating a documention?',
                type: 'confirm',
                when: a => typeof (a.github || this.config.get('github')) === 'object',
            });
        }

        // If the docs stage should run
        if (this._shouldRun('apidocs')) {
            prompts.push({
                name: 'apidocs',
                message: 'Would you like to create an API documention?',
                type: 'confirm',
            });
        }

        return this.prompt(prompts).then((props) => {
            for (const prop in props) {
                if (Object.prototype.hasOwnProperty.call(props, prop)) {
                    this.config.set(prop, props[prop]);
                }
            }

            this.config.save();

            for (const d in inverseDependencies) {
                if (!this.config.get(d)) {
                    this.runGenerators &= ~inverseDependencies[d];
                }
            }

            // If the main stage should be run: Mix in the license generator
            if (this._shouldRun('main')) {
                this.composeWith(require.resolve('generator-license'), {
                    name: props.authorName,
                    email: props.authorEmail,
                    website: props.authorWebsite,
                    license: props.license,
                });
            }
        });
    }

    /**
     * Configuration preparations
     */
    configuring() {
        this.composerRequire = [];
        this.composer = this._loadJsonConfig(this.destinationPath('composer.json'), this.templatePath('main/configure/composer.json'));

        // Load the Github configuration files
        if (this.config.get('github')) {
            this.gitattributes = this._loadTextConfig(this.destinationPath('.gitattributes'), this.templatePath('github/configure/_gitattributes'));
            this.gitignore = this._loadTextConfig(this.destinationPath('.gitignore'), this.templatePath('github/configure/_gitignore'));
            this.travis = this._loadYamlConfig(this.destinationPath('.travis.yml'), this.templatePath('github/configure/_travis.yml'));
        }

        // If the main stage should be run
        if (this._shouldRun('main')) {
            this.composerRequire.push('clue/graph-composer:dev-master', 'phpunit/phpunit', 'squizlabs/php_codesniffer');
        }

        if (this._shouldRun('github')) {
            this.composer = this._jsonConfig(this.composer, this.templatePath('github/configure/composer.json'));
        }

        // If the codeclimate stage should be run
        if (this._shouldRun('codeclimate')) {
            this.composerRequire.push('codeclimate/php-test-reporter');
            this.gitattributes = this._textConfig(this.gitattributes, this.templatePath('codeclimate/configure/_gitattributes'));
            this.travis = this._yamlConfig(this.travis, this.templatePath('codeclimate/configure/_travis.yml'));
        }

        // If the scrutinizer stage should be run
        if (this._shouldRun('scrutinizer')) {
            this.gitattributes = this._textConfig(this.gitattributes, this.templatePath('scrutinizer/configure/_gitattributes'));
            this.travis = this._yamlConfig(this.travis, this.templatePath('scrutinizer/configure/_travis.yml'));
        }

        // If the coverage stage should be run
        if (this._shouldRun('coverage')) {
            this.composerRequire.push('satooshi/php-coveralls');
            this.travis = this._yamlConfig(this.travis, this.templatePath('coverage/configure/_travis.yml'));
        }

        // If the docs stage should be run
        if (this._shouldRun('docs')) {
            this.gitattributes = this._textConfig(this.gitattributes, this.templatePath('docs/configure/_gitattributes'));
        }

        // If the apidocs stage should be run
        if (this._shouldRun('apidocs')) {
            this.composerRequire.push('theseer/phpdox:dev-master', 'phploc/phploc', 'phpmd/phpmd');
            this.composer = this._jsonConfig(this.composer, this.templatePath('apidocs/configure/composer.json'));

            if (this.hasGithub) {
                this.gitignore = this._textConfig(this.gitignore, this.templatePath('apidocs/configure/_gitignore'));
                this.gitattributes = this._textConfig(this.gitattributes, this.templatePath('apidocs/configure/_gitattributes'));
            }
        }
    }

    /**
     * Writing files
     */
    writing() {
        // If the main stage should be run
        if (this._shouldRun('main')) {
            this._templateDirectory('main/files', '.', this.config.getAll());
            this._templateDirectory('main/src', path.join('src', this.config.get('module') || '.'), this.config.getAll());

            // Else: Always copy the README file
        } else {
            this._template('main/files/README.md', '.', this.config.getAll());
        }

        // If the github stage should be run
        if (this._shouldRun('github')) {
            this._templateDirectory('github/files', '.', this.config.getAll());
        }

        // If the codeclimate stage should be run
        if (this._shouldRun('codeclimate')) {
            this._templateDirectory('codeclimate/files', '.', this.config.getAll());
        }

        // If the scrutinizer stage should be run
        if (this._shouldRun('scrutinizer')) {
            this._templateDirectory('scrutinizer/files', '.', this.config.getAll());
        }

        // If the docs stage should be run
        if (this._shouldRun('docs')) {
            this._templateDirectory('docs/files', '.', this.config.getAll());
        }

        // If the apidocs stage should be run
        if (this._shouldRun('apidocs')) {
            this._templateDirectory('apidocs/files', '.', this.config.getAll());
        }

        // --- Configuration file dump ---

        // If the composer configuration should be dumped
        if (this._shouldRun('main', 'github', 'apidocs')) {
            this._dumpJsonConfig(this.composer, this.destinationPath('composer.json'));
        }

        // If the Travis CI configuration should be dumped
        if (this._shouldRun('github', 'codeclimate', 'scrutinizer')) {
            this._dumpYamlConfig(this.travis, this.destinationPath('.travis.yml'));
        }

        // If the gitattributes configuration should be dumped
        if (this._shouldRun('github', 'codeclimate', 'scrutinizer', 'docs', 'apidocs')) {
            this._dumpTextConfig(this.gitattributes, this.destinationPath('.gitattributes'));
        }

        // If the gitignore configuration should be dumped
        if (this._shouldRun('github', 'apidocs')) {
            this._dumpTextConfig(this.gitignore, this.destinationPath('.gitignore'));
        }
    }

    /**
     * Installing
     */
    install() {
        // If there are composer packages to be installed
        if (this.composerRequire.length) {
            this.log.info(chalk.yellow('Please be patient while composer downloads and installs the project dependencies ...'));
            this.log();
            this.spawnCommandSync('composer', ['require', '--dev', ...this.composerRequire]);
            this.log();
        }

        // If the github stage should be run
        if (this._shouldRun('github')) {
            // Initialize a git repository
            const github = this.config.get('github').ssh;
            if (github) {
                const that = this;
                const done = this.async();

                // (Re)Initialize the Git repository
                exec('`which git` init', (error1) => { // , stdout, stderr
                    if (!error1) {
                        const setupGit = function setupGit() {
                            exec(`\`which git\` remote add origin "${github}" && \`which git\` config core.filemode false`, (e) => {
                                if (!e) {
                                    that._templateDirectory('github/hooks', '.git/hooks', that.config.getAll());
                                }
                                done(e);
                            });
                        };

                        // Look for existing origin entries
                        exec('`which git` remote -v', (error2, stdout2) => { // , stderr
                            if (!error2) {
                                if (stdout2.length) {
                                    const lines = stdout2.split('\n');
                                    let removeOrigin = false;
                                    for (let l = 0; l < lines.length; ++l) {
                                        if (lines[l].indexOf('origin') === 0) {
                                            removeOrigin = true;
                                            break;
                                        }
                                    }

                                    // If there's another origin entry:
                                    // Remove it before setting up the repo
                                    if (removeOrigin) {
                                        exec('`which git` remote rm origin', (error3) => { // , stdout3, stderr
                                            if (error3) {
                                                done(error3);
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
                                done(error2);
                            }
                        });
                    } else {
                        done(error1);
                    }
                });
            }
        }
    }

    /**
     * End
     */
    end() {
        let hasRun = 0;
        for (let g = 0; g < generators.length; ++g) {
            const stage = Math.pow(2, g);
            if (this.runGenerators & stage) {
                hasRun |= stage;
            }
        }
        this.config.set('run', this.config.get('run') | hasRun);
    }

    /**
     * Return whether a particular stage should be run
     *
     * The method accepts an arbitrary number or stage arguments and returns
     * true if at least one of them should be run
     *
     * @param {String*} stages Run stages
     * @returns {Boolean} Whether this stage should be run
     */
    _shouldRun(...stages) {
        const shouldRun = stages.reduce((res, stageName) => {
            // Find the stage index
            const stageIndex = stageName ? generators.indexOf(stageName) : -1;

            // If the stage index is valid and the stage var is empty or not applicable
            if (stageIndex >= 0) {
                return (res < 0) ? Math.pow(2, stageIndex) : (res | Math.pow(2, stageIndex));
            }
            return res;
        }, -1);

        return (shouldRun > 0) ? !!(this.runGenerators & shouldRun) : false;
    }

    /**
     * Test whether the given run stage has a non-empty run variable (or doesn't need one)
     *
     * @param {String} stage Run stage
     * @returns {Boolean} Has a valid run variable
     * @private
     */
    _shouldRunVar(stage) {
        return (['codeclimate', 'scrutinizer', 'coverage', 'docs', 'apidocs'].indexOf(stage) < 0) || !this.config.get(stage);
    }

    /**
     * Copy a file while treating it as a template
     *
     * @param {String} src Source
     * @param {String} dest Destination
     * @param {Object} context Context
     * @private
     */
    _template(src, dest, context) {
        const ext = path.extname(src).toLowerCase();
        if (['.png', '.jpg', '.gif'].indexOf(ext) >= 0) {
            this._copy(src, dest);
        } else {
            this.fs.copyTpl(this.templatePath(src), this.destinationPath(dest), context || this);
        }
    }

    /**
     * Copy a file
     *
     * @param {String} src Source
     * @param {String} dest Destination
     * @private
     */
    _copy(src, dest) {
        this.fs.copy(this.templatePath(src), this.destinationPath(dest));
    }

    /**
     * Apppend the contents of a file to another
     *
     * @param {String} src Source file
     * @param {String} dest Dest file
     * @param {Object} context Context
     * @private
     */
    _appendTemplate(src, dest, context) {
        const str = this._read(this.templatePath(src));
        fs.appendFileSync(this.destinationPath(dest), ejs.render(str, context));
    }

    /**
     * Load a JSON configuration file
     *
     * @param {String} current Current config file path (preferred)
     * @param {String} template Template file path (if not already existing)
     * @return {Object} JSON configuration
     * @private
     */
    _loadJsonConfig(current, template) {
        let jsonConfig = template;
        try {
            if (fs.lstatSync(current).isFile()) {
                jsonConfig = current;
            }
        } catch (e) {
            // Keep the template
        }
        return JSON.parse(ejs.render(this._read(jsonConfig), this.config.getAll()));
    }

    /**
     * Configure via a JSON file
     *
     * @param {Object} config Current configuration
     * @param {String} src JSON file with values to set
     * @return {Object} Modified configuration
     * @private
     */
    _jsonConfig(config, src) {
        return merge(config, JSON.parse(ejs.render(this._read(src), this.config.getAll())));
    }

    /**
     * Dump a JSON configuration file
     *
     * @param {Object} json JSON configuration
     * @param {String} dest Destination path
     * @private
     */
    _dumpJsonConfig(json, dest) {
        this._write(dest, JSON.stringify(json, null, 4));
    }

    /**
     * Load a YAML configuration file
     *
     * @param {String} current Current config file path (preferred)
     * @param {String} template Template file path (if not already existing)
     * @return {Object} YAML configuration
     * @private
     */
    _loadYamlConfig(current, template) {
        let yamlConfig = template;
        try {
            if (fs.lstatSync(current).isFile()) {
                yamlConfig = current;
            }
        } catch (e) {
            // Keep the template
        }
        return yaml.safeLoad(ejs.render(this._read(yamlConfig), this.config.getAll()));
    }

    /**
     * Configure via a YAML file
     *
     * @param {Object} config Current configuration
     * @param {String} src YAML file with values to set
     * @return {Object} Modified configuration
     * @private
     */
    _yamlConfig(config, src) {
        return merge(config, yaml.safeLoad(ejs.render(this._read(src), this.config.getAll())));
    }

    /**
     * Dump a YAML configuration file
     *
     * @param {Object} yml YAML configuration
     * @param {String} dest Destination path
     * @private
     */
    _dumpYamlConfig(yml, dest) {
        this._write(dest, yaml.safeDump(yml));
    }

    /**
     * Load a text configuration file
     *
     * @param {String} current Current config file path (preferred)
     * @param {String} template Template file path (if not already existing)
     * @return {Array} Text configuration
     * @private
     */
    _loadTextConfig(current, template) {
        let textConfig = template;
        try {
            if (fs.lstatSync(current).isFile()) {
                textConfig = current;
            }
        } catch (e) {
            // Keep the template
        }
        return ejs.render(this._read(textConfig), this.config.getAll()).split('\n').filter(v => v.trim().length);
    }

    /**
     * Configure via a text file
     *
     * @param {Array} config Current configuration
     * @param {String} src Text file with values to set
     * @return {Array} Modified configuration
     * @private
     */
    _textConfig(config, src) {
        return [...config, ...ejs.render(this._read(src), this.config.getAll()).split('\n')].filter(v => v.trim().length);
    }

    /**
     * Dump a text configuration file
     *
     * @param {Array} text Text configuration
     * @param {String} dest Destination path
     * @private
     */
    _dumpTextConfig(text, dest) {
        this._write(dest, text.join('\n'));
    }

    /**
     * Recursively copy a directory and treat all files as templates
     *
     * @param {String} src Source
     * @param {String} dest Destination
     * @param {Object} context Context
     * @private
     */
    _templateDirectory(src, dest, context) {
        const srcRoot = this.templatePath(src);
        const destRoot = this.destinationPath(dest);
        walkSync(srcRoot, { nodir: true }).forEach((file) => {
            const localDir = path.dirname(file.path.substr(srcRoot.length));
            this._mkdirp(path.join(destRoot, localDir));

            // Skip .gitignore files
            let targetFile = path.basename(file.path);
            if (targetFile !== '.gitignore') {
                if (targetFile.substr(0, 1) === '_') {
                    targetFile = `.${targetFile.substr(1)}`;
                }
                this._template(file.path, path.join(destRoot, localDir, targetFile), context);
            }
        }, this);
    }

    /**
     * Recursively create a directory
     *
     * @param {String} dir Directory
     * @return {Boolean} Success
     * @private
     */
    _mkdirp(dir) {
        return this.constructor.__mkdirp(dir);
    }

    /**
     * Recursively create a directory
     *
     * @param {String} dir Directory
     * @return {Boolean} Success
     * @private
     */
    static
    __mkdirp(dir) {
        return mkdirp.sync(dir);
    }

    /**
     * Read a file and return the content as string
     *
     * @param {String} src File path
     * @return {String} File content
     * @private
     */
    _read(src) {
        return this.fs.read(src);
    }

    /**
     * Write contents into a file
     *
     * @param {String} dest File path
     * @param {String} contents Contents
     * @private
     */
    _write(dest, contents) {
        this.fs.write(dest, contents);
    }
};
