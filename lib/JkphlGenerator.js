const Generator = require('yeoman-generator');
const fs = require('fs-extra');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {
    /**
     * Copy a file while treating it as a template
     *
     * @param {String} src Source
     * @param {String} dest Destination
     * @param {Object} context Context
     * @private
     */
    _template(src, dest, context) {
        var ext = path.extname(src).toLowerCase();
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
        fs.walkSync(srcRoot).forEach(file => {
            const localPath = file.substr(srcRoot.length);
            this._mkdirp(path.join(destRoot, path.dirname(localPath)));
            this._template(file, path.join(destRoot, localPath), context);
        }, this);
    }

    /**
     * Recursively create a directory
     *
     * @param {String} dir Directory
     * @private
     */
    _mkdirp(dir) {
        mkdirp.sync(dir);
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
    }
}
