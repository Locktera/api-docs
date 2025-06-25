```typescript
import { ORG_ID, fetch, verifyIdentity } from '../fetch.ts';

async function listFiles (container_id: string) {
	return await fetch(`/users/${ORG_ID}/containers/${container_id}/decode`);
}

async function getFile (container_id: string, file_name: string) {
	return await fetch(`/users/${ORG_ID}/containers/${container_id}/decode/${encodeURIComponent(file_name)}`);
}

// Normalize arguments
const container_id = process.argv[2].trim().toLowerCase();
const file_name = process.argv[3]?.trim();

// Verify arguments
if (!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(container_id)) {
	throw new Error('Invalid container ID; must be a UUID');
}

await verifyIdentity();

if (!file_name) {
	// Get the list of files
	const list_files_rsp = await listFiles(container_id);
	const manifest = await list_files_rsp.json();
	console.log(`Files in ${manifest.container.name}.tera:`)
	for (const file_name in manifest.files) {
		console.log(`- ${file_name}`);
	}
} else {
	const rsp = await getFile(container_id, file_name);
	const text = await rsp.text();
	console.log(`Content of ${file_name}:\n`);
	console.log(text);
}
```
