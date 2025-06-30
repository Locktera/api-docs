# Decode

This example uses the Locktera API to list the files within an existing container and extract the contents of one of the files.

A walkthrough of the code follows.

## Imports

Since all of the data we need for this task is in the Locktera container, the only dependencies we have are on the Locktera API itself. Import our helper functions.

```typescript
import { ORG_ID, fetch, verifyIdentity } from '../fetch.ts';
```

## API operations

Both operations will use the `decode` API endpoint.

### listFiles()

Whenever we call the `decode` endpoint without specifying a file name, it decodes the manifest from within the file and returns it to us.

```typescript
async function listFiles (container_id: string) {
	return await fetch(`/users/${ORG_ID}/containers/${container_id}/decode`);
}
```

### getFile()

Whenever we include a file name to the `decode` endpoint, we get back the bytes from that file. We can also use the `Range` header to request specific bytes from the file.

```typescript
async function getFile (container_id: string, file_name: string) {
	return await fetch(`/users/${ORG_ID}/containers/${container_id}/decode/${encodeURIComponent(file_name)}`);
}
```

## The CLI

The command line requires a container ID, and optionally accepts a file name.

```typescript
// Normalize arguments
const container_id = process.argv[2].trim().toLowerCase();
const file_name = process.argv[3]?.trim();

// Verify arguments
if (!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(container_id)) {
	throw new Error('Invalid container ID; must be a UUID');
}

await verifyIdentity();
```

If the file name is omitted, it prints the list of files in the container from the manifest; if the file name is included, it returns the text of the desired file.

```typescript
if (!file_name) {
	// Get the list of files
	const list_files_rsp = await listFiles(container_id);
	const manifest = await list_files_rsp.json();
	console.log(`Files in ${manifest.container.name}.tera:`)
	for (const file_name in manifest.files) {
		console.log(`- ${file_name}`);
	}
} else {
```

Here we are assuming the requested file is text; if we instead processed the response body stream, we could handle binary data instead.

```typescript
	const rsp = await getFile(container_id, file_name);
	const text = await rsp.text();
	console.log(`Content of ${file_name}:\n`);
	console.log(text);
}
```
