class Churn {
	constructor(path) {
		this.path = path;
		this.changes = 0;
	}

	increment() {
		this.changes += 1;
		return this;
	}

	getValue() {
		return this.changes;
	}
}

module.exports = Churn;
