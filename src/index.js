const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const endpoint = `https://${core.getInput('secret')}.digitaloceanspaces.com`;
const client = new S3Client({
    endpoint: endpoint,
    forcePathStyle: false,
    region: core.getInput('region'),
    credentials: {
      accessKeyId: core.getInput('key'),
      secretAccessKey: core.getInput('secret')
    }
});

async function run() {
    try {
        const params = {
            Bucket: core.getInput('bucket'),
            Key: core.getInput('dest'),
            Body: fs.readFileSync(core.getInput('src')),
            ACL: core.getBooleanInput('private') ? 'private' : 'public',
            Metadata: {}
        }
        const metadata = core.getMultilineInput('metadata');
        if(metadata){
            metadata.forEach((line) => {
                const [key, value] = line.replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/, '').split(':');
                params.Metadata[`x-amz-meta-${key}`] = value;
            })
        }

        const data = await client.send(new PutObjectCommand(params));
        core.setOutput('result', `${endpoint}/${params.Bucket}/${params.Key}`);
    } catch (err) {
        core.setFailed(err);
    }
}

run();