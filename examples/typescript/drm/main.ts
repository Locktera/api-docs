/**
 * # DRM
 *
 * This example uses the Locktera API to read and write the DRM rules for an existing Locktera container.
 *
 * A walkthrough of the code follows.
 *
 * ## Imports
 *
 * First we'll import the libraries we'll need.
 */

import * as fs from 'node:fs/promises'; // Used to read and write the DRM rules file

/**
 * We will also need to import libraries specific to the task at hand - interacting with the Locktera API.
 */

import { type DynamicDrm } from '../DynamicDrm.ts'; // The definition of Locktera DRM rules
import { ORG_ID, fetch, verifyIdentity } from '../fetch.ts'; // Our org ID, authenticated fetch function, and sanity check function

/**
 * ## API operations
 *
 * We will `GET` and `PUT` the endpoint for a specified container's DRM using the authenticated fetch function.
 *
 * ### getDrm()
 */

async function getDrm (container_id: string) {
	const rsp = await fetch(`/users/${ORG_ID}/containers/${container_id}/drm`);
	return await rsp.json() as DynamicDrm;
}

/**
 * ### patchDrm()
 */

async function patchDrm (container_id: string, drm: DynamicDrm) {
	await fetch(`/users/${ORG_ID}/containers/${container_id}/drm`, {
		method: 'PATCH',
		headers: {
			'content-type': 'application/json', // Be sure to set the content type!
		},
		body: JSON.stringify(drm),
	});
}

/**
 * ## The CLI
 *
 * We will use command line arguments to specify the action, container ID, and DRM rules file name. First, we will collect and verify the arguments.
 */

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

/**
 * Then we will verify that our Org ID and API key are good by fetching our org information. If either value is bad, this function will throw.
 */

await verifyIdentity();

/**
 * Finally, we will handle the two possible actions.
 */

if (action === 'get') {
	// Fetch the DRM from the API
	const drm = await getDrm(container_id);

	// Write it to the output file
	await fs.writeFile(file_name, JSON.stringify(drm, null, '\t'));

	console.log('Wrote to', file_name);
} else if (action === 'put') {
	// Read the contents of the input file
	const input = await fs.readFile(file_name, 'utf-8');

	// Parse it to JSON to ensure it's syntactically valid
	const drm: DynamicDrm = JSON.parse(input.trim());

	// Update the container's DRM
	await patchDrm(container_id, drm);

	console.log('Updated from', file_name);
}
