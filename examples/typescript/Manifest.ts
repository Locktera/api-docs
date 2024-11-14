/** Locktera container manifest */
export type Manifest = {
	/** Information about the container itself */
	container: ContainerInfo;

	/** Information about each content file, indexed by name */
	files?: Record<string, FileInfo>;
};

/** Information about the container itself */
export type ContainerInfo = {
	/**
	 * A list of email addreses, with an optional wilcdard on either side of the `@`, e.g.:
	 * - `example@gmail.com`: A single email address
	 * - `*@locktera.com`: Any email from a given domain
	 * - `*@*,`: Any logged-in viewer, regardless of email address
	 */
	recipients?: string[];

	/** Whether or not the content is downloadable. Only applies to viewers; the sender can always download all content */
	downloadable: boolean;

	/** Password to use for encryption, if desired. If provided, viewers must enter this password to decrypt the contents. */
	password?: string;

	/** Desired DRM rules */
	drm?: Drm;
};

/** Container-wide access rules */
export type Drm = {
	/**
	 * Whether the DRM should be modifiable after the container is encoded; default false.
	 * If true, the DRM will be stored in the Locktera database and be modifiable by API. If false, the DRM will be encrypted directly in the container and cannot be modified.
	 */
	dynamic?: boolean;

	/** Geolocation rules */
	geo?: DrmRules<GeoRule>;

	/**
	 * IPv4 address rules. The following formats are supported:
	 * - `192.168.1.10`: Single IP address
	 * - `192.168.1.0/24`: Subnet mask
	 * - `192.*.1.*`: Wildcard
	 * - `192.168.1.0-192.168.1.255`: Range
	 * - `192.168.1.10/255.0.255.0`: IP mask
	 */
	ip?: DrmRules<string>;

	/** The number of times each viewer can open the container */
	opens?: number;

	/** The time range for which the content is accessible */
	time?: TimeRule;
};

/**
 * List of allow and block rules of a particular type. For each type of DRM rule:
 * - If any allow rules are specified, only allow a viewer who matches an allow rule
 * - If there are only block rules, only allow a viewer who does not match any block rules
 */
export type DrmRules<T> = {
	/** Allow viewers matching these rules to access the content */
	allow?: T[];

	/** Block viewers matching these rules from accessing the content */
	block?: T[];
};

/** Geolocation rule */
export type GeoRule = {
	/** Continent name */
	continent?: string;

	/** Country name */
	country?: string;

	/** Subdivision (e.g. prefecture, province, state, county) */
	subdivision?: string;

	/** City name */
	city?: string;
};

/** Time-range rule */
export type TimeRule = {
	/** The time before which the content is inaccessible */
	start?: Date;

	/** The time after which the content is inaccessible */
	end?: Date;
};

/** Information about one content file */
export type FileInfo = {
	/** Content type of the file */
	type?: string;

	/** Number of pages in a document */
	pages?: number;

	/** Duration of a media file in seconds */
	duration?: number;

	/** Whether the file should be hidden from the viewer menu; default false */
	hidden?: boolean;

	/** Name of a file to view instead of this file when it is chosen from the menu */
	view_instead?: string;

	/** Name of a file to download instead of this file when the download button is pressed */
	download_instead?: string;
};
