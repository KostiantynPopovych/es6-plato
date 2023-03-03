const micromatch = require("micromatch");
const { execSync } = require( "node:child_process");
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");

class GitHistory {
  static build(options) {
    return new GitHistory(options);
  }

  constructor(options) {
    this.options = options;

    this.history = this.buildHistory();
    this.files = this.listFiles();
  }

  buildGitLogCommand() {
    const isWindows = process.platform === "win32";

    return [
      "git",
      `-C ${this.options.directory}`,
      `log`,
      `--follow`,

      // Windows CMD handle quotes differently than linux, this is why we should put empty string as said in:
      // https://github.com/git-for-windows/git/issues/3131
      `--format=${isWindows ? "" : "''"}`,
      `--name-only`,
      this.options.since ? `--since="${this.options.since}"` : "",
      this.options.until ? `--until="${this.options.until}"` : "",

      // Windows CMD handle quotes differently
      isWindows ? "*" : "'*'",
    ]
      .filter((s) => s.length > 0)
      .join(" ");
  }

  buildHistory() {
    const gitLogCommand = this.buildGitLogCommand();
    const stdout = this.executeGitLogCommand(gitLogCommand);
    return stdout
      .split("\n")
      .filter((line) => {
        if (line.trim().length === 0) {
          return false;
        }
        if (!this.pathStillExists(line)) {
          return false;
        }
        if (!this.filterMatches(line)) {
          return false;
        }
        return true;
      })
      .sort();
  }

  executeGitLogCommand(gitLogCommand) {
    return execSync(gitLogCommand, { encoding: "utf8", maxBuffer: 32_000_000 });
  }

  listFiles() {
    return [...new Set(this.history)];
  }

  pathStillExists(fileName) {
    return existsSync(resolve(this.options.directory, fileName));
  }

  filterMatches(file) {
    if (this.options.filter && this.options.filter.length) {
      return this.options.filter.every((f) => micromatch.isMatch(file, f));
    }
    return true;
  }
}

module.exports = GitHistory;
