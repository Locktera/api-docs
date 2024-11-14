export type Manifest = {
	/// Information about the container itself
	container: ContainerInfo;

	/// Information about each file, by name
	files?: Record<string, FileInfo>;
};

export type ContainerInfo = {
	/**
	 * A list of email addreses, with an optional wilcdard on either side of the @, e.g.:
	 * [
	 * 	'example@gmail.com', // A single email address
	 * 	'*@locktera.com', // Any email from a given domain
	 * 	'*@*,' // Any logged-in viewer, regardless of email address
	 * ]
	 */
	recipients?: string[];

	/// Whether or not the content is downloadable. Only applies to viewers; the sender can always download all content
	downloadable: boolean;

	/// The password to use for encryption, if desired. If provided, viewers must enter this password to decrypt the contents.
	password?: string;

	/// Desired DRM rules
	drm?: Drm;
};

export type Drm = {
	/// Whether the DRM should be modifiable after the container is encoded
	dynamic?: boolean;

	/// Geolocation rules
	geo?: DrmRules<GeoRule>;

	/**
	 * IPv4 address rules. The following formats are supported:
	 * [
	 * 	'192.168.1.10', // Single IP address
	 * 	'192.168.1.0/24', // Subnet mask
	 * 	'192.*.1.*', // Wildcard
	 * 	'192.168.1.0-192.168.1.255', // Range
	 * 	'192.168.1.10/255.0.255.0', // IP mask
	 * ]
	 */
	ip?: DrmRules<string>;

	/// The number of times each viewer can open the container
	opens?: number;

	/// The time range for which the content is accessible
	time?: TimeRule;
};

export type DrmRules<T> = {
	/// Allow viewers matching these rules to access the content
	allow?: T[];

	/// Block viewers matching these rules from accessing the content
	block?: T[];
};

export type GeoRule = {
	/// The continent name
	continent?: string;

	/// The country name
	country?: string;

	/// The subdivision (e.g. prefecture, province, state, county)
	subdivision?: string;

	/// The city name
	city?: string;
};

export type TimeRule = {
	/// The time before which the content is inaccessible
	start?: Date;

	/// The time after which the content is inaccessible
	end?: Date;
};

export type FileInfo = {
	/// The content type of the file
	type?: string;

	/// The number of pages in a document
	pages?: number;

	/// The duration of a media file in seconds
	duration?: number;

	/// Whether the file should be hidden from the viewer menu; default `false`
	hidden?: boolean;

	/// The name of a file to view instead of this file when it is chosen from the menu
	view_instead?: string;

	/// The name of a file to download instead of this file when the download button is pressed
	download_instead?: string;
};
