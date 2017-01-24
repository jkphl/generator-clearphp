/* eslint-disable no-underscore-dangle */

const Generator = require('yeoman-generator');
const fs = require('fs-extra');
const path = require('path');
const mkdirp = require('mkdirp');
const ejs = require('ejs');
const yaml = require('js-yaml');
const merge = require('deepmerge');
const semver = require('semver');
const validator = require('validator');
const spawn = require('child_process').spawn;
const licenses = require('generator-license').licenses;

const generators = [
    'main', // 1
    'git', // 2
    'codeclimate', // 4
    'scrutinizer', // 8
    'coverage', // 16
    'docs', // 32
    'apidocs', // 64
    'all' // 128
];
const generatorDependecies = [
    1, // main
    3, // main + git
    7, // main + git + codeclimage
    11, // main + git + scrutinizer
    19, // main + git + coverage
    35, // main + git + docs
    67, // main + apidocs
    127 // all
];

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
     * Constructor
     *
     * @param {String|Array} args Arguments
     * @param {Object} options Options
     */
    constructor(args, options) {
        super(args, options);
        this.config.defaults({ run: 0 });

        // Determine the stages to run
        const runIndex = generators.indexOf(options.run || 'none');
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
            const child = spawn('php', ['-r', "preg_match('/^\\d+(\\.\\d+)*/', PHP_VERSION, $phpVersion); echo $phpVersion[0];"])
            child.stdout.on('data', (chunk) => this.php += chunk.toString());
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

            let dir = path.basename(process.cwd()).split('-', 2);
            while (dir.length < 2) {
                dir.unshift(null);
            }

            // Ask for project key, author and TYPO3 version
            prompts = [{
                name: 'vendor',
                message: 'What\'s the vendor key (Github profile / organization)?',
                default: this.config.get('vendor') || dir[0],
                validate: function (vendor) {
                    return vendor.trim().length ? true : 'The vendor key cannot be empty!';
                }
            }, {
                name: 'project',
                message: 'What\'s the project key?',
                default: this.config.get('project') || dir[1],
                validate: function (project) {
                    return project.trim().length ? true : 'The project key cannot be empty!';
                }
            }, {
                name: 'description',
                message: 'Please describe your project',
                default: this.config.get('description') || null,
                validate: function (description) {
                    return description.trim().length ? true : 'The project description cannot be empty!';
                }
            }, {
                name: 'website',
                message: 'What\'s the project homepage?',
                default: this.config.get('website') || null,
                validate: function (url) {
                    return (url).length ? (validator.isURL(url) || 'The project homepage must be a valid URL or empty!') : true;
                }
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
                default: (answers) => this.config.get('namespace') || (answers.vendor.substr(0, 1).toUpperCase() + answers.vendor.substr(1).toLowerCase()),
                validate: function (namespace) {
                    return (namespace.trim().length && isNamespace(namespace, true)) || 'The project main PHP namespace must be valid!';
                }
            }, {
                name: 'module',
                message: 'What\'s the module name of your project (dash for none)?',
                default: (answers) => this.config.get('module') || (answers.project.substr(0, 1).toUpperCase() + answers.project.substr(1).toLowerCase()),
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
                default: this.config.get('php') || this.php,
                validate: function (version) {
                    return (semver.valid(version) || semver.validRange(version)) ? true : 'Please enter a valid semver value (range)!';
                }
            }, {
                name: 'authorName',
                message: 'What\'s the author\'s name?',
                default: this.config.get('authorName') || null,
                validate: function (name) {
                    return name.trim().length ? true : 'The author name cannot be empty!';
                }
            }, {
                name: 'authorEmail',
                message: 'What\'s the author\'s email address?',
                default: this.config.get('authorEmail') || null,
                validate: function (email) {
                    return email.trim().length ? (validator.isEmail(email) || 'The project author\'s email address must be valid or empty!') : true;
                }
            }, {
                name: 'authorWebsite',
                message: 'What\'s the author\'s website?',
                default: this.config.get('authorWebsite') || null,
                validate: function (url) {
                    return (url).length ? (validator.isURL(url) || 'The project author\'s website must be a valid URL or empty!') : true;
                }
            }];
        }

        // If the git stage should be run
        if (this._shouldRun('git')) {
            prompts.push({
                name: 'git',
                message: 'What\'s the Git repository URL for this project?',
                default: this.config.get('git') || null,
                validate: function (url) {
                    const isURL = validator.isURL(url, { protocols: ['http', 'https', 'ssh'] }) || /^[a-z0-9]+@[a-z0-9]+\.[a-z]+:.+$/i.test(url);
                    return url.length ? (isURL || 'The git repository URL must be a valid URL or empty!') : true;
                }
            });
        }

        return this.prompt(prompts).then((props) => {
            if (props.module.trim() === '-') {
                props.module = null;
            }
            for (let prop in props) {
                if (props.hasOwnProperty(prop)) {
                    this.config.set(prop, props[prop]);
                }
            }
            this.config.save();

            // If the main stage should be run: Mix in the license generator
            if (this._shouldRun('main')) {
                this.composeWith(require.resolve('generator-license'), {
                    name: props.authorName,
                    email: props.authorEmail,
                    website: props.authorWebsite,
                    license: props.license
                });
            }
        });
    }

    /**
     * Configuration preparations
     */
    configuring() {
        this.composer = this._loadJsonConfig(this.destinationPath('composer.json'), this.templatePath('main/configure/composer.json'));
        this.gitattributes = this._loadTextConfig(this.destinationPath('.gitattributes'), this.templatePath('git/configure/_gitattributes'))
        this.gitignore = this._loadTextConfig(this.destinationPath('.gitignore'), this.templatePath('git/configure/_gitignore'))
        this.travis = this._loadYamlConfig(this.destinationPath('.travis.yml'), this.templatePath('git/configure/_travis.yml'))
    };

    /**
     * Writing files
     */
    writing() {
        // If the main stage should be run
        if (this._shouldRun('main')) {
            this._dumpJsonConfig(this.composer, this.destinationPath('composer.json'));
            this._templateDirectory('main/files', '.', this.config.getAll());
            this._templateDirectory('main/src', path.join('src', this.config.get('module') || '.'), this.config.getAll());
        }

        // If the git stage should be run
        if (this._shouldRun('git')) {
            this._dumpYamlConfig(this.travis, this.destinationPath('.travis.yml'));
            this._dumpTextConfig(this.gitattributes, this.destinationPath('.gitattributes'));
            this._dumpTextConfig(this.gitignore, this.destinationPath('.gitignore'));
        }
    };

    /**
     * Installing
     */
    install() {
        // If the git stage should be run
        if (this._shouldRun('git')) {
            // Initialize a git repository
            const git = this.config.get('git');
            if (git) {
                var that = this;
                var done = this.async();

                // (Re)Initialize the Git repository
                exec('`which git` init', function (error, stdout, stderr) {
                    if (!error) {

                        var setupGit = function () {
                            exec('`which git` remote add origin "' + git + '" && `which git` config core.filemode false', function (error, stdout, stderr) {

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
        }
    }

    /**
     * Return wheter a particular stage should be run
     *
     * @param {Sting} run Run stage
     * @returns {Boolean} Whether this stage should be run
     */
    _shouldRun(run) {
        const runIndex = run ? generators.indexOf(run) : -1;
        return (runIndex >= 0) ? (this.runGenerators & Math.pow(2, runIndex)) : false;
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
     * Configure a YAML file
     *
     * @param {String} src YAML file with values to set
     * @param {String} dest YAML file to configure
     * @param {Object} context Context
     * @private
     */
    _configureYAMLTemplate(src, dest, context) {
        const srcDoc = yaml.safeLoad(this._read(this.templatePath(src)));
        let destDoc = {};
        try {
            if (fs.lstatSync(this.destinationPath(dest)).isFile()) {
                destDoc = yaml.safeLoad(this._read(this.destinationPath(dest)));
            }
        } catch (e) {
        }

        destDoc = merge(destDoc, srcDoc);
        this._write(this.destinationPath(dest), ejs.render(yaml.safeDump(destDoc), context));
    }

    /**
     * Configure a JSON file
     *
     * @param {String} src JSON file with values to set
     * @param {String} dest JSON file to configure
     * @param {Object} context Context
     * @private
     */
    _configureJSONTemplate(src, dest, context) {
        const srcDoc = require(this.templatePath(src));
        let destDoc = {};
        try {
            if (fs.lstatSync(this.destinationPath(dest)).isFile()) {
                destDoc = require(this.destinationPath(dest));
            }
        } catch (e) {
        }

        destDoc = merge(destDoc, srcDoc);
        this._write(this.destinationPath(dest), ejs.render(JSON.stringify(destDoc, null, 4), context));
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
        }
        return JSON.parse(ejs.render(this._read(jsonConfig), this.config.getAll()));
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
        }
        return yaml.safeLoad(ejs.render(this._read(yamlConfig), this.config.getAll()));
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
        }
        return ejs.render(this._read(textConfig), this.config.getAll()).split('\n');
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
     * Copy a directory
     *
     * @param {String} src Source
     * @param {String} dest Destination
     * @private
     */
    _directory(src, dest) {
        fs.copySync(this.templatePath(src), this.destinationPath(dest));
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
        console.log(srcRoot, destRoot);
        fs.walkSync(srcRoot).forEach((file) => {
                const localDir = path.dirname(file.substr(srcRoot.length));
                this._mkdirp(path.join(destRoot, localDir));

                // Skip .gitignore files
                let targetFile = path.basename(file);
                if (targetFile !== '.gitignore') {
                    if (targetFile.substr(0, 1) === '_') {
                        targetFile = `.${targetFile.substr(1)}`;
                    }
                    this._template(file, path.join(destRoot, localDir, targetFile), context);
                }
            },
            this
        );
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

    /**
     * Test whether a generator has run before
     *
     * @param {String} name Generator name
     * @returns {Boolean} Whether the generator has run before
     * @private
     */
    _hasRunBefore(name) {
        const run = this.config.get('run');
        return (typeof run === 'object') && (name in run) && run[name];
    }

    /**
     * Mark a generator as run
     *
     * @param {String} name Generator name
     * @private
     */
    _setRun(name) {
        const run = this.config.get('run') || {};
        run[name] = true;
        this.config.set('run', run);
        this.config.save();
    }
}
;
