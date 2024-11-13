import * as dotenv from 'dotenv';
import * as fs from 'node:fs/promises';
import mime from 'mime';
import * as path from 'path';
import { type Manifest } from '../Manifest.ts';

// Import IDs and keys from the environment file
dotenv.config({ path: '../../../env' });

const API_URL = process.env.API_URL;
const ORG_ID = process.env.ORG_ID;
const API_KEY = process.env.API_KEY;

if (!API_URL) throw new Error('API_URL is required');
if (!ORG_ID) throw new Error('ORG_ID is required');
if (!API_KEY) throw new Error('API_KEY is required');

async function api_fetch (url: string, init?: RequestInit) {
	url = [API_URL, url].join('/').replace(/\/+/g, '/'); // Combine the base API URL and remove duplicate slashes

	init = {
		...init,
		headers: {
			...init?.headers,
			'authorization': `Bearer ${API_KEY}`, // Add the Authorization header
		},
	};

	const response = await fetch(url, init);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}

	return await response.json();
}

async function verify_identity () {
	// Verify the Org ID & API key
	const org_data = await api_fetch(`/orgs/${ORG_ID}`);
	console.log('Logged in as:', org_data.email);
}

async function construct_manifest () {
	// Read the manifest from input/manifest.json
	const manifest: Manifest = JSON.parse(await fs.readFile('./input/manifest.json', 'utf-8'));
	manifest.files = {};

	// Add the other input files to the manifest
	for await (const file of fs.glob('./input/*')) {
		const basename = path.basename(file);
		if (basename === 'manifest.json') continue;

		manifest.files[basename] = {
			type: mime.getType(basename) || 'application/octet-stream',
		};
	}

	return manifest;
}

async function encode_container (manifest: Manifest) {
	console.log('Encoding manifest:', manifest);

	const body = new FormData();

	// Append the manifest to the body
	body.append('manifest', new Blob([JSON.stringify(manifest)], { type: 'application/json' }));

	// Append the files to the body
	for (const [name, file] of Object.entries(manifest.files!)) {
		const data = await fs.readFile(`./input/${name}`);
		body.append('files', new Blob([data], { type: file.type }), name);
	}

	// Encode the file!
	const encoded_manifest = await api_fetch(`/orgs/${ORG_ID}/containers/encode`, {
		method: 'POST',
		body,
	});

	console.log('Successfully encoded container:', encoded_manifest.container.uuid);
}

await verify_identity();
// const manifest = await construct_manifest();
// await encode_container(manifest);
