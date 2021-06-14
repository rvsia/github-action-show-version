const core = require('@actions/core');
const github = require('@actions/github');

const { readFileSync } = require('fs')

const main = async () => {
    const file = fs.readFileSync('package.json');
    const currentVersion = JSON.parse(file).version;

    console.log('Current version: ', currentVersion);

    const nameToGreet = core.getInput('who-to-greet');
    const commits = github.context.payload.commits;

    let nextVersion = 0;

    commits.forEach((commit) => {
        console.log(commit.message, nextVersion, commit.message.match(/^fix(\w+):/))
        if(commit.message.match(/^fix\(\w+\):/)) {
            nextVersion = nextVersion === 0 ? 1 : nextVersion;
        } else if (commit.message.match(/^feat\(\w+\):/)) {
            nextVersion = 2;
        }
    })

    if(nextVersion === 0) {
        console.log('no version will be released')
    } else if(nextVersion === 1) {
        console.log('next version is fix')
    } else {
        console.log('next version is feature')
    }
}

main().catch(error => core.setFailed(error.message));