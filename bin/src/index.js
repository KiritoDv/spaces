"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const core_1 = __importDefault(require("@actions/core"));
const client_s3_1 = require("@aws-sdk/client-s3");
const endpoint = `https://${core_1.default.getInput('secret')}.digitaloceanspaces.com`;
const client = new client_s3_1.S3Client({
    endpoint: endpoint,
    forcePathStyle: false,
    region: core_1.default.getInput('region'),
    credentials: {
        accessKeyId: core_1.default.getInput('key'),
        secretAccessKey: core_1.default.getInput('secret')
    }
});
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const params = {
                Bucket: core_1.default.getInput('bucket'),
                Key: core_1.default.getInput('dest'),
                Body: fs_1.default.readFileSync(core_1.default.getInput('src')),
                ACL: core_1.default.getBooleanInput('private') ? 'private' : 'public',
                Metadata: {}
            };
            const metadata = core_1.default.getMultilineInput('metadata');
            if (metadata) {
                metadata.forEach((line) => {
                    const [key, value] = line.replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/, '').split(':');
                    params.Metadata[`x-amz-meta-${key}`] = value;
                });
            }
            const data = yield client.send(new client_s3_1.PutObjectCommand(params));
            core_1.default.setOutput(`${endpoint}/${params.Bucket}/${params.Key}`, data);
        }
        catch (err) {
            core_1.default.setFailed(err);
        }
    });
}
run();
