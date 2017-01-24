const PhpGenerator = require('../../lib/PhpGenerator.js');
const yosay = require('yosay');

module.exports = class extends PhpGenerator {
    /**
     * Constructor
     *
     * @param {String|Array} args Arguments
     * @param {Object} options Options
     */
    constructor(args, options) {
        super(args, Object.assign(options, { run: 'apidocs' }));
    }

    /**
     * Initializing
     */
    initializing() {
        return super.initializing();
    }

    /**
     * Prompting
     */
    prompting() {
        return super.prompting();
    }

    /**
     * Configuration preparations
     *
     * @type {Object}
     */
    configuring() {
        return super.configuring();
    };

    /**
     * Writing files
     *
     * @type {Object}
     */
    writing() {
        return super.writing();
    };

    /**
     * Installing
     */
    install() {
        return super.install();
    }

    /**
     * End
     */
    end() {
        return super.end();
    }
};
