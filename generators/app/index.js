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
        super(args, Object.assign(options, { run: 'all' }));
    }

    /**
     * Initializing
     */
    initializing() {
        super.initializing();
    }

    /**
     * Prompting
     */
    prompting() {
        super.prompting();
    }

    /**
     * Configuration preparations
     *
     * @type {Object}
     */
    configuring() {
        super.configuring();
    };
};
