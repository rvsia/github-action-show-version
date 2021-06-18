const core = require('@actions/core');
const github = require('@actions/github');
const { readFileSync } = require('fs')
const fetch = require('node-fetch');

const main = async () => {
    const file = readFileSync('package.json');
    const currentVersion = JSON.parse(file).version;
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(GITHUB_TOKEN);

    console.log('Current version: ', currentVersion);

    const [major, minor, fix] = currentVersion.split('.');

    const commits = await fetch(github.context.payload.pull_request.commits_url).then(data => data.json())

    let nextVersion = 0;

    commits.forEach(({commit}) => {
        console.log('analyzing: ', commit.message)
        if (commit.message.match(/^fix\(\w+\):/)) {
            nextVersion = nextVersion === 0 ? 1 : nextVersion;
            console.log('changes status to fix');
        } else if (commit.message.match(/^feat\(\w+\):/)) {
            nextVersion = 2;
            console.log('changes status to feat')
        }
    })

    let message = `No new version will be released. Current: ${major}.${minor}.${fix}`;

    if (nextVersion === 0) {
        console.log(message)
    } else if (nextVersion === 1) {
        message = `A new version (fix) will be released: ${major}.${minor}.${Number(fix) + 1}`;
        console.log(message)
    } else {
        message = `A new version (feat) will be released: ${major}.${Number(minor) + 1}.${0}`;
        console.log(message)
    }

    const { context = {} } = github;
    const { pull_request } = context.payload;

    await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number: pull_request.number,
        body: message
    });
}

main().catch(error => core.setFailed(error.message));
