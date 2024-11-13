import { DrmRules, GeoRule, TimeRule } from './Manifest.ts';

export type DynamicDrm = {
	dynamic: boolean;
	recipients?: string[];
	downloadable: boolean;
	geo?: DrmRules<GeoRule>;
	ip?: DrmRules<string>;
	opens?: number;
	time?: TimeRule;
};
