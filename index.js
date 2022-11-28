const core = require("@actions/core");
const http = require("@actions/http-client");

async function run() {
  try {
    const taskId = core.getInput("task-id");
    const categoryId = core.getInput("category-id");
    const jiraHost = core.getInput("jira-host");
    const jiraUsername = core.getInput("jira-username");
    const jiraPassword = core.getInput("jira-password");

    const additionalHeaders = {};
    additionalHeaders["Authorization"] = `Basic ${Buffer.from(
      `${jiraUsername}:${jiraPassword}`
    ).toString("base64")}`;

    const client = new http.HttpClient();
    const response = await client.getJSON(
      `https://${jiraHost}/rest/api/latest/issue/${taskId}?fields=status`,
      additionalHeaders
    );

    const statusCode = response.statusCode;
    const result = response.result;

    if (statusCode != 200 || !result) {
      core.setFailed("Invalid response from JIRA.");
      return;
    }

    if (
      result.fields &&
      result.fields.status &&
      result.fields.status.statusCategory &&
      result.fields.status.statusCategory.id
    ) {
      if (result.fields.status.statusCategory.id != categoryId) {
        core.setFailed(
          `Invalid status category: ${result.fields.status.statusCategory.id}`
        );
      }
    } else {
      core.setFailed("Invalid response from JIRA.");
      return;
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
