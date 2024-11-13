export type Manifest = {
	container?: ContainerInfo;
	files?: Record<string, FileInfo>;
};

export type ContainerInfo = {
	recipients?: string[];
	downloadable?: boolean;
	password?: string;
	drm?: Drm;
};

export type Drm = {
	dynamic?: boolean;
	geo?: DrmRules<GeoRule>;
	ip?: DrmRules<string>;
	opens?: number;
	time?: TimeRule;
}

export type DrmRules<T> = {
	allow?: T[];
	block?: T[];
}

export type GeoRule = {
	continent?: string;
	country?: string;
	subdivision?: string;
	city?: string;
}

export type TimeRule = {
	start?: Date;
	end?: Date;
}

export type FileInfo = {
	type?: string;
	hidden?: boolean;
	view_instead?: string; // View this file instead of the current one
	download_instead?: string; // Download this file instead of the current one
};
