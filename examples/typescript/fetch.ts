import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Get the absolute path of this file
const DIRNAME = path.dirname(new URL(import.meta.url).pathname);

// Load IDs and keys from the env file in the repository root
dotenv.config({ path: path.join(DIRNAME, '../../env') });

export const API_URL = process.env.API_URL;
export const ORG_ID = process.env.ORG_ID;
export const API_KEY = process.env.API_KEY;

if (!API_URL) throw new Error('API_URL is required');
if (!ORG_ID) throw new Error('ORG_ID is required');
if (!API_KEY) throw new Error('API_KEY is required');

async function apiFetch (url: string, init?: RequestInit) {
	// Combine the base API URL and remove duplicate slashes
	url = path.join(API_URL!, url);

	// Add the Authorization header containing the API key
	init = {
		...init,
		headers: {
			...init?.headers,
			'authorization': `Bearer ${API_KEY}`,
		},
	};

	const response = await fetch(url, init);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(error);
	}

	return response;
}

export async function verifyIdentity () {
	// Fetch our org information
	const user_rsp = await apiFetch(`/me`);
	const user_data = await user_rsp.json();
	console.log('Logged in as:', user_data.email);
}

export {
	apiFetch as default,
	apiFetch as fetch
};
