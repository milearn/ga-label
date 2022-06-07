const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");
function getLabelObj(str) {
    const obj = {}
    const lines = str.split('\n');
    if(lines.length === 0) {
        core.setFailed('labels syntax is wrong or not provided');
    }
    lines.forEach(function(line) {
        const [baseBranch, labels] = line.split(":").map(val => val.trim());
        obj[baseBranch] = labels.split(",").map(val => val.trim());
    })
    return obj
}
(async () => {
  try {
      
    const githubToken = process.env['GITHUB_TOKEN'];

    if (!githubToken) {
        core.setFailed("GITHUB_TOKEN does not exist.");
        return;
    }
    const octokit = getOctokit(githubToken);
    const { owner, repo } = context.repo;
    const labelsObj = getLabelObj(core.getInput('labels'));
    const baseBranch = context.payload.pull_request.base.ref;
    let labels = labelsObj[baseBranch];

    if(!labels || labels.length === 0) {
        labels = core
        .getInput("default")
        .split("\n")
        .filter((x) => x !== "");
        
    }
    if(labels.length === 0) {
        core.setOutput(`No label found for ${baseBranch}. Skipping....`)
        return;
    }
    const issueNumber = context.issue.number;
    core.info(`Add labels: ${labels} to ${owner}/${repo}#${issueNumber}`);

    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
})();