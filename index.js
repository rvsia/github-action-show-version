const core = require('@actions/core');
const github = require('@actions/github');
const { readFileSync } = require('fs')
const fetch = require('node-fetch');

const main = async () => {
    const file = readFileSync('package.json');
    const currentVersion = JSON.parse(file).version;

    console.log('Current version: ', currentVersion);

    const [major, minor, fix] = currentVersion.split('.');

    const commits = await fetch(github.context.payload.pull_request.commits_url).then(data => data.json())

    console.log('commits', commits)

    let nextVersion = 0;

    commits.forEach((commit) => {
        console.log('analyzing: ', commit.message)
        if (commit.message.match(/^fix\(\w+\):/)) {
            nextVersion = nextVersion === 0 ? 1 : nextVersion;
            console.log('changes status to fix');
        } else if (commit.message.match(/^feat\(\w+\):/)) {
            nextVersion = 2;
            console.log('changes status to feat')
        }
    })

    if (nextVersion === 0) {
        console.log('no version will be released ', `${major}.${minor}.${fix}`)
    } else if (nextVersion === 1) {
        console.log('next version is fix ', `${major}.${minor}.${fix + 1}`)
    } else {
        console.log('next version is feature ', `${major}.${minor + 1}.${0}`)
    }
}

main().catch(error => core.setFailed(error.message));
