import * as glob from 'glob';
import mime from 'mime';
import * as fs from 'node:fs/promises';
import * as path from 'path';

import { type Manifest } from '../Manifest.ts';
import { ORG_ID, fetch } from '../fetch.ts';

async function verify_identity () {
	// Verify the Org ID & API key
	const org_data = await fetch(`/orgs/${ORG_ID}`);
	console.log('Logged in as:', org_data.email);
}

async function construct_manifest () {
	// Read the manifest from input/manifest.json
	const manifest: Manifest = JSON.parse(await fs.readFile('./input/manifest.json', 'utf-8'));
	manifest.files = {};

	// Add the other input files to the manifest
	for await (const file of await glob.globIterate('./input/*')) {
		const basename = path.basename(file);
		if (basename === 'manifest.json') continue;

		manifest.files[basename] = {
			type: mime.getType(basename) || 'application/octet-stream',
		};
	}

	console.log('Encoding manifest:', manifest);
	return manifest;
}

async function encode_container (manifest: Manifest) {
	const body = new FormData();

	// Append the manifest to the body
	body.append('manifest', new Blob([JSON.stringify(manifest)], { type: 'application/json' }));

	// Append the files to the body
	for (const [name, file] of Object.entries(manifest.files!)) {
		const data = await fs.readFile(`./input/${name}`);
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
const manifest = await construct_manifest();
await encode_container(manifest);
