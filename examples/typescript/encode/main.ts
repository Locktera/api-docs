import * as glob from 'glob'; // Used to find content files to encode
import mime from 'mime'; // Used to determine content file types
import * as fs from 'node:fs/promises'; // Used to read the manifest
import * as path from 'path'; // Used to get path basenames

import { type Manifest } from '../Manifest.ts'; // The definition of the Locktera container manifest
import { ORG_ID, fetch } from '../fetch.ts'; // Our org ID and authenticated fetch function

async function verify_identity () {
    // Fetch our org information
    const org_data = await fetch(`/orgs/${ORG_ID}`);

    // Print our email address
    console.log('Logged in as:', org_data.email);
}

async function construct_manifest () {
    // Read the manifest from input/manifest.json
    const manifest: Manifest = JSON.parse(await fs.readFile('./input/manifest.json', 'utf-8'));

    manifest.files = {};

    // Add content files to the manifest
    for await (const file of await glob.globIterate('./input/*')) {
        // Strip the directory name
        const basename = path.basename(file);

        // Don't include the manifest itself in the container!
        if (basename === 'manifest.json') continue;

        // Create an informational record for each content file, indexed by name
        manifest.files[basename] = {
            // Determine the file type based on the file extension
            type: mime.getType(basename) || 'application/octet-stream',
        };
    }

    console.log('Encoding manifest:', manifest);
    return manifest;
}

async function encode_container (manifest: Manifest) {
    // The data will be sent to the API as multipart form data, so we will use the FormData class to build the body
    const body = new FormData();

    // The manifest must be sent as the value for the `manifest` key
    body.append('manifest', new Blob([JSON.stringify(manifest)], { type: 'application/json' }));

    for (const [name, file] of Object.entries(manifest.files!)) {
        // Since a Node.js `Blob` can only be constructed from strings or binary buffers, we must read the entire content file into a binary buffer
        const data = await fs.readFile(`./input/${name}`);

        // Each content file must be appended to the value of the `files` key
        body.append('files', new Blob([data], { type: file.type }), name);

    }

    // Encode the file!
    const encoded_manifest = await fetch(`/orgs/${ORG_ID}/containers/encode`, {
        method: 'POST',
        body,
    });

    console.log('Successfully encoded container:', encoded_manifest.container.uuid);
}

await verify_identity();
const manifest = construct_manifest();
// await encode_container(manifest);
