const core = require("@actions/core");
const { github, context } = require("@actions/github");

(async () => {
  try {
      
    const githubToken = process.env['GITHUB_TOKEN'];
    core.info(githubToken);

    if (!githubToken) {
        core.setFailed("GITHUB_TOKEN does not exist.");
        return;
    }
    
    const octokit = github.getOctokit(githubToken)
    const { owner, repo } = context.repo;
    const labels = core
      .getInput("labels")
      .split("\n")
      .filter((x) => x !== "");
    const issueNumber = context.payload.number;

    core.info(`Add labels: ${labels} to ${owner}/${repo}#${issueNumber}`);

    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
})();