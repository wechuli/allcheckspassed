"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractOwnCheckNameFromWorkflow = extractOwnCheckNameFromWorkflow;
const yaml_1 = __importDefault(require("yaml"));
const inputsExtractor_1 = require("./inputsExtractor");
const octokit_1 = require("./octokit");
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function extractFilePath(input = process.env.GITHUB_WORKFLOW_REF) {
    if (input === undefined) {
        throw new Error("Error getting file path");
    }
    let splitAt = input.split("@");
    let splitOnSlash = splitAt[0].split("/");
    // take last element
    let lastElement = splitOnSlash[splitOnSlash.length - 1];
    return ".github/workflows/" + lastElement;
}
async function getFile(owner, repo, path, ref) {
    try {
        let file = await octokit_1.restClient.repos.getContent({
            owner,
            repo,
            path,
            ref
        });
        // parse the yaml file to json
        let fileContent = Buffer.from(file.data.content, 'base64').toString();
        return yaml_1.default.parse(fileContent);
    }
    catch (error) {
        throw new Error("Error getting file: " + error.message);
    }
}
async function extractOwnCheckNameFromWorkflow(owner = github.context.repo.owner, repo = github.context.repo.repo, path = extractFilePath(), ref = inputsExtractor_1.sanitizedInputs.commitSHA) {
    let jobName = process.env.GITHUB_JOB;
    try {
        let workflow = await getFile(owner, repo, path, ref);
        let checkName = workflow.jobs[jobName].name || jobName;
        return checkName;
    }
    catch (error) {
        core.warning(`Error extracting job name from workflow file, falling back to ${JSON.stringify(jobName)} (this may not be correct): ${error}`);
        // If we have some error getting and parsing the file, we just return the job name
        return jobName;
    }
}
//# sourceMappingURL=fileExtractor.js.map