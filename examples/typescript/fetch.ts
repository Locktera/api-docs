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

async function api_fetch (url: string, init?: RequestInit) {
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
		const error = await response.json();
		throw new Error(error.message);
	}

	return await response.json();
}

export {
	api_fetch as default,
	api_fetch as fetch
};
