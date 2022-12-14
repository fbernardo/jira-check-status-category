const core = require("@actions/core");
const http = require("@actions/http-client");
const github = require("@actions/github");

async function run() {
  try {
    let taskId = core.getInput("task-id");

    if (!taskId) {
      const { eventName } = github.context;
      if (eventName !== "pull_request") {
        core.setFailed(
          `No task-id provided, trying to get it from the PR title but this is not PR.`
        );
        return;
      }

      const prTitle = github.context.payload.pull_request.title;
      const regex = /^(?<id>[A-Za-z]+\-[0-9]+)?/m;
      let result;
      if ((result = regex.exec(prTitle)) !== null) {
        taskId = result.groups.id;
      }
    }

    if (!taskId) {
      core.setFailed(
        `No task-id provided and no task-id found on the PR title.`
      );
      return;
    }

    const categoryId = core.getInput("category-id");
    const jiraHost = core.getInput("jira-host");
    const jiraUsername = core.getInput("jira-username");
    const jiraPassword = core.getInput("jira-password");

    const additionalHeaders = {};
    additionalHeaders["Authorization"] = `Basic ${Buffer.from(
      `${jiraUsername}:${jiraPassword}`
    ).toString("base64")}`;

    const client = new http.HttpClient();
    const response = await client.getJson(
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
