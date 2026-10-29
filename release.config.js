/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ["master", { name: "development", prerelease: "beta" }],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "feat", scope: "web", release: "minor" },
          { type: "feat", scope: "frontend", release: "minor" },
          { type: "feat", scope: "api", release: "minor" },
          { type: "feat", scope: "backend", release: "minor" },
          { type: "fix", scope: "web", release: "patch" },
          { type: "fix", scope: "frontend", release: "patch" },
          { type: "fix", scope: "api", release: "patch" },
          { type: "fix", scope: "backend", release: "patch" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "refactor", scope: "frontend", release: "minor" },
          { type: "refactor", scope: "web", release: "minor" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        writerOpts: {
          transform: (commit) => {
            const modifiedCommit = { ...commit };
            const frontendScopes = ["frontend", "web"];
            const backendScopes = ["backend", "api"];

            if (modifiedCommit.type === "feat") {
              if (frontendScopes.includes(modifiedCommit.scope)) {
                modifiedCommit.type = "✨ Frontend Features";
              } else if (backendScopes.includes(modifiedCommit.scope)) {
                modifiedCommit.type = "🚀 Backend Features";
              } else {
                modifiedCommit.type = "📦 Features";
              }
            } else if (modifiedCommit.type === "fix") {
              if (frontendScopes.includes(modifiedCommit.scope)) {
                modifiedCommit.type = "🐛 Frontend Fixes";
              } else if (backendScopes.includes(modifiedCommit.scope)) {
                modifiedCommit.type = "🐛 Backend Fixes";
              } else {
                modifiedCommit.type = "🛠️ Bug Fixes";
              }
            } else if (modifiedCommit.type === "perf") {
              modifiedCommit.type = "⚡ Performance Improvements";
            } else {
              return null;
            }

            if (typeof modifiedCommit.hash === "string") {
              modifiedCommit.shortHash = modifiedCommit.hash.substring(0, 7);
            }

            return modifiedCommit;
          },
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
};

