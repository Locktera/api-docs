/**
 * # Encode
 *
 * This example uses the Locktera API to encode all contents from a folder.
 *
 * To customize the content to be encoded by the example, look at and modify the contents of the `input` folder.
 *
 * A walkthrough of the code follows.
 *
 * ## Imports
 *
 * First we'll import the libraries we'll need.
 */

import * as glob from 'glob'; // Used to find content files to encode
import mime from 'mime'; // Used to determine content file types
import * as fs from 'node:fs/promises'; // Used to read the manifest
import * as path from 'path'; // Used to get path basenames

/**
 * We will also need to import libraries specific to the task at hand - creating a Locktera container manifest and interacting with the Locktera API.
 */

import { type Manifest } from '../Manifest.ts'; // The definition of the Locktera container manifest
import { ORG_ID, fetch, verify_identity } from '../fetch.ts'; // Our org ID, authenticated fetch function, and sanity check function

/**
 * ## Encode operations
 *
 * We will use the encode endpoint of the Locktera API, but first we need to describe our container.
 *
 * ### construct_manifest()
 *
 * This function constructs a Locktera container manifest from the contents of the `input` folder. The `manifest.json` file forms the basis of the manifest, mostly consisting of any DRM rules. Then, we `glob` other files from the folder to fill out the `files` section of the manifest with their metadata.
 *
 * See the `Manifest.ts` file in the `typescript` directory for the type definition.
 */

async function construct_manifest () {
	// Read the manifest from input/manifest.json
	const manifest: Manifest = JSON.parse(await fs.readFile('./input/manifest.json', 'utf-8'));

	/**
	 * We could actually stop here and just return this basic manifest. As long as we provide a basic manifest and a set of files to the API, we don't need to include any information about those files - the API will discover each file's name, content type, and size from the API request body.
	 *
	 * For instructional purposes, however, we will go ahead and fill in the basic information about each file we want to include.
	 */

	manifest.files = {};

	// Add content files to the manifest
	for await (const file of glob.globIterate('./input/*')) {
		// Strip the directory name
		const basename = path.basename(file);

		// Don't include the manifest itself in the container!
		if (basename === 'manifest.json') continue;

		/**
		 * Since this is a basic example, we will just include the content type for each file. The content type must be provided either here in the manifest, or in the request body. If it is in both locations, the manifest will override the request body.
		 *
		 * For more advanced use cases, we can include metadata like page counts or media durations, as well as controlling what files are viewed versus what files are downloaded. These advanced features will be demonstrated in a later example.
		 */

		// Create an informational record for each content file, indexed by name
		manifest.files[basename] = {
			// Determine the file type based on the file extension
			type: mime.getType(basename) || 'application/octet-stream',
		};
	}

	console.log('Encoding manifest:', manifest);
	return manifest;
}

/**
 * ### encode_container()
 *
 * This function takes our previously-constructed manifest and sends it and the content files to the Locktera API for encryption. This is probably the most complex function of the entire API, both in terms of its functionality and in terms of how the request must be constructed.
 */

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

		/**
		 * As mentioned in `construct_manifest()`, the content type of each file must be specified in either the manifest or the request body. We are also including them here to show how it is done.
		 */
	}

	// Encode the file!
	const encoded_manifest = await fetch(`/users/${ORG_ID}/containers/encode`, {
		method: 'POST',
		body,
	});

	console.log('Successfully encoded container:', encoded_manifest.container.uuid);
}

/**
 * ## Bringing it all together
 *
 * We will finally call the 3 API operations in sequence to encode our container.
 */

await verify_identity();
const manifest = await construct_manifest();
await encode_container(manifest);
