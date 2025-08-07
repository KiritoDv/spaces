const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

async function run() {
    try {
        const client = new S3Client({
            forcePathStyle: false,
            region: core.getInput('region'),
            credentials: {
              accessKeyId: core.getInput('key'),
              secretAccessKey: core.getInput('secret')
            }
        });
        const params = {
            Bucket: core.getInput('bucket'),
            Key: core.getInput('dest'),
            Body: fs.readFileSync(core.getInput('src')),
            ACL: core.getInput('visibility').toLowerCase().trim(),
            Metadata: {}
        }
        const metadata = core.getMultilineInput('metadata');
        if(metadata){
            metadata.forEach((line) => {
                const [key, value] = line.replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/, '').split(':');
                params.Metadata[key] = value;
            })
        }

        const data = await client.send(new PutObjectCommand(params));
        core.setOutput('result', `${endpoint}/${params.Bucket}/${params.Key}`);
    } catch (err) {
        core.setFailed(err);
    }
}

run();
