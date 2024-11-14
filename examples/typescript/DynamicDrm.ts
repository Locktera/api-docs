import { type Drm } from './Manifest.ts';

/** DRM rules modifiable after container creation */
export type DynamicDrm = Drm & {
	/** See `ContainerInfo.recipients` */
	recipients?: string[];

	/** See `ContainerInfo.downloadable` */
	downloadable: boolean;
};
