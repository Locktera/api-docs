# Encode Example

The `encode` example shows how to use the Locktera API with Node.js to encode a Locktera container.

## Prerequisites

- Node.js v20 or later

## Installation

1. Navigate to this directory.
2. Install dependencies:
	```sh
	npm install
	```

## Customization

The script will take the DRM rules from `input/manifest.json` and each other content file from the `input` folder and create a new container in your Locktera library.

You can customize `input/manifest.json` to change the DRM rules or make them static, and you can add or remove files from the `input` directory to try out different types of content.

## Running the Script

Once you are satisfied with the contents of the `input` folder, run the script to encode the container:

```sh
npm run start
```

The script should log your current user (based on your ORG_ID and API_KEY), and at the conclusion of encoding will log the new container's UUID. You can view and manage the new container from your Locktera [Library](https://test.locktera.com/#/files).
