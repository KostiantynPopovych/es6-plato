var babel = require("@babel/core");

const DEFAULT_BABEL_PARSER_OPTIONS =
  {
    plugins: [
      '@babel/plugin-transform-typescript',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      '@babel/plugin-proposal-private-methods'
    ],
    presets: ['@babel/preset-env']
  };

/**
 * Provides a convenience wrapper around Babel parser.
 */
class BabelParserInternal
{
	/**
   * Parses the given source with Babel parser.
   *
   * @param {string}   source - Javascript source code to parse.
   * @param {object}   [options] - Overrides default babel parser options.
   * @param {object}   [override] - Provides helper directives to override options to simplify modification of default
   *                                Babel parser options.
   *
   * @returns {object}
   */
	static parse(source, options = void 0, override = void 0)
	{
		// Make a copy of the default options.
		const defaultOptions = { ...DEFAULT_BABEL_PARSER_OPTIONS };

		if (typeof override === 'object')
		{
			// If decoratorsBeforeExport is defined as an override then set that value.
			if (typeof override.decoratorsBeforeExport === 'boolean')
			{
				defaultOptions.plugins[5][1].decoratorsBeforeExport = override.decoratorsBeforeExport;
			}

			// If decoratorsLegacy is enabled as an override then the actual implementation is swapped for
			// decorators-legacy.
			if (typeof override.decoratorsLegacy === 'boolean' && override.decoratorsLegacy)
			{
				defaultOptions.plugins[5] = 'decorators-legacy';
			}


			// If pipelineOperatorProposal is defined as an override then set that value.
			if (typeof override.pipelineOperatorProposal === 'string')
			{
				defaultOptions.plugins[20][1].proposal = override.pipelineOperatorProposal;
			}

			// If flow is enabled as an override 'typescript' must be removed and 'flow' added.
			if (typeof override.flow === 'boolean' && override.flow)
			{
				const index = defaultOptions.plugins.indexOf('typescript');
				if (index > -1)
				{
					defaultOptions.plugins.splice(index, 1);
				}

				defaultOptions.plugins.push('flow');
			}
		}

		options = typeof options === 'object' ? options : defaultOptions;
		options.sourceType = typeof options.sourceType === 'string' ? options.sourceType : 'unambiguous';
		return babel.parseSync(source, options);
	}
}

/**
 * Wires up BabelParser on the plugin eventbus. The following event bindings are available:
 *
 * `typhonjs:babel:parser:file:parse`: Invokes `parseFile`.
 * `typhonjs:babel:parser:source:parse`: Invokes `parseSource`.
 *
 * @param {PluginEvent} ev - The plugin event.
 * @ignore
 */
function onPluginLoad(ev)
{
	const eventbus = ev.eventbus;

	eventbus.on('typhonjs:babel:parser:parse', BabelParserInternal.parse, BabelParserInternal);
}

module.exports = {
	default: BabelParserInternal,
	onPluginLoad: onPluginLoad
};
