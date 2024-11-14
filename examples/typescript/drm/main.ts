import * as fs from 'node:fs/promises';

import { type DynamicDrm } from '../DynamicDrm.ts';
import { ORG_ID, fetch, verify_identity } from '../fetch.ts';

async function get_drm (container_id: string) {
	return await fetch(`/orgs/${ORG_ID}/containers/${container_id}/drm`) as DynamicDrm;
}

async function put_drm (container_id: string, drm: DynamicDrm) {
	await fetch(`/orgs/${ORG_ID}/containers/${container_id}/drm`, {
		method: 'PUT',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(drm),
	});
}

if (process.argv.length !== 5) {
	console.log(`Usage:
	npm run drm get $CONTAINER_ID $FILE_NAME - outputs $CONTAINER_ID's DRM to $FILE_NAME
	npm run drm put $CONTAINER_ID $FILE_NAME - sets $CONTAINER_ID's DRM from $FILE_NAME
	`);
	process.exit(0);
}

const action = process.argv[2].trim().toLowerCase();
const container_id = process.argv[3].trim().toLowerCase();
const file_name = process.argv[4].trim().toLowerCase();

if (action !== 'get' && action !== 'put') {
	throw new Error(`Invalid action; use \`get\` or \`put\``);
}

if (!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(container_id)) {
	throw new Error(`Invalid container ID; must be a UUID`);
}

await verify_identity();

if (action === 'get') {
	const drm = await get_drm(container_id);
	await fs.writeFile(file_name, JSON.stringify(drm, null, '\t'));
} else if (action === 'put') {
	const input = await fs.readFile(file_name, 'utf-8');
	const drm: DynamicDrm = JSON.parse(input.trim());
	await put_drm(container_id, drm);
}
