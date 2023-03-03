const nodePath = require('path');
const GitHistory = require('./GitHistory');
const Churn = require('./churn');

class Churns {
	static from(history, options) {
		return new Churns(history, options);
	}

	constructor(history, options) {
		this.options = options;
		this.churnByPath = this.computeChurnsPerFiles(history, options);
	}

	get files() {
		return [...this.churnByPath.keys()];
	}

	getByPath(path) {
		const churn = this.churnByPath.get(path);
		if (!churn) {
			throw new Error('churn not found for path: ' + path);
		}
		return churn;
	}

	computeChurnsPerFiles(history, options) {
		return history.reduce((map, subPath) => {
			const path = nodePath.join(options.directory, subPath);
			if (map.has(path)) {
				const actualChurn = map.get(path);
				if (actualChurn) {
					actualChurn.increment();
				} else {
					throw new Error('A churn should have existed for path: ' + path);
				}
			} else {
				const churn = new Churn(path).increment();
				map.set(path, churn);
			}
			return map;
		}, new Map());
	}
}

module.exports = Churns;
