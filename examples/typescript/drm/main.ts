import * as fs from 'node:fs/promises'; // Used to read and write the DRM rules file

import { type DynamicDrm } from '../DynamicDrm.ts'; // The definition of Locktera DRM rules
import { ORG_ID, fetch, verify_identity } from '../fetch.ts'; // Our org ID, authenticated fetch function, and sanity check function

async function get_drm (container_id: string) {
    return await fetch(`/orgs/${ORG_ID}/containers/${container_id}/drm`) as DynamicDrm;
}

async function put_drm (container_id: string, drm: DynamicDrm) {
    await fetch(`/orgs/${ORG_ID}/containers/${container_id}/drm`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json', // Be sure to set the content type!
        },
        body: JSON.stringify(drm),
    });
}

// Print usage if incorrect
if (process.argv.length !== 4) {
    console.log(`Usage:
    npm run drm get $CONTAINER_ID - outputs $CONTAINER_ID's DRM to $CONTAINER_ID.json
    npm run drm put $CONTAINER_ID - sets $CONTAINER_ID's DRM from $CONTAINER_ID.json
`);
    process.exit(0);
}

// Normalize arguments
const action = process.argv[2].trim().toLowerCase();
const container_id = process.argv[3].trim().toLowerCase();

// Verify arguments
if (action !== 'get' && action !== 'put') {
    throw new Error('Invalid action; use `get` or `put`');
}

if (!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(container_id)) {
    throw new Error('Invalid container ID; must be a UUID');
}

const file_name = container_id + '.json';

await verify_identity();

if (action === 'get') {
    // Fetch the DRM from the API
    const drm = await get_drm(container_id);

    // Write it to the output file
    await fs.writeFile(file_name, JSON.stringify(drm, null, '\t'));

    console.log('Wrote to', file_name);
} else if (action === 'put') {
    // Read the contents of the input file
    const input = await fs.readFile(file_name, 'utf-8');

    // Parse it to JSON to ensure it's syntactically valid
    const drm: DynamicDrm = JSON.parse(input.trim());

    // Update the container's DRM
    await put_drm(container_id, drm);

    console.log('Updated from', file_name);
}
