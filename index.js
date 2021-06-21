const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');

const main = async () => {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { context = {} } = github;
    const { pull_request } = context.payload;

    const tags = await octokit.rest.repos.listTags({
        ...context.repo,
        branch: 'master',
    });

    const currentVersion = tags.data[0].name.replace(/\^v/, '');

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

    const RESPONDER = `[github-action-show-version]`;

    let message = `No new version will be released. Current: ${major}.${minor}.${fix} ${RESPONDER}`;

    if (nextVersion === 0) {
        console.log(message)
    } else if (nextVersion === 1) {
        message = `A new version (fix) will be released: ${major}.${minor}.${Number(fix) + 1} ${RESPONDER}`;
        console.log(message)
    } else {
        message = `A new version (feat) will be released: ${major}.${Number(minor) + 1}.${0} ${RESPONDER}`;
        console.log(message)
    }

    const comments = await octokit.rest.issues.listComments({
        ...context.repo,
        issue_number: pull_request.number,
    });

    const comment = comments.data.find(comment => comment.user.login === 'github-actions[bot]' && comment.body.includes(RESPONDER));

    if(repo.owner === 'data-driven-forms' && repo.repo === 'react-forms' && (
        commit && commit.body !== message
    )) {
        await fetch('https://us-central1-data-driven-forms.cloudfunctions.net/sendComment', {
            method: 'POST', body: {
                message,
                issueNumber: pull_request.number,
                commentId: comment && comment.id
            }
        })
    }
}

main().catch(error => core.setFailed(error.message));
