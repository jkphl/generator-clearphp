/* eslint-disable no-underscore-dangle */

const Generator = require('yeoman-generator');
const fs = require('fs-extra');
const path = require('path');
const mkdirp = require('mkdirp');
const ejs = require('ejs');
const yaml = require('js-yaml');
const merge = require('deepmerge');

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

module.exports = class extends Generator {
    /**
     * Constructor
     *
     * @param {String|Array} args Arguments
     * @param {Object} options Options
     */
    constructor(args, options) {
        super(args, options);

        // Determine the stages to run
        this.runGenerators = 0;
        if ('run' in options) {
            const runIndex = generators.indexOf(options.run);
            if (runIndex >= 0) {
                this.runGenerators = generatorDependecies[runIndex];
            }
        }

        this.config.defaults({ run: { main: false } });
    }

    /**
     * Return wheter a particular stage should be run
     *
     * @param {Sting} run Run stage
     * @returns {Boolean} Whether this stage should be run
     */
    shouldRun(run) {
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
    static __mkdirp(dir) {
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
};
