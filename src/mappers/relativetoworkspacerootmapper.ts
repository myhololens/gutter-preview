import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs';

import { AbsoluteUrlMapper } from './mapper';
import { ImageCache } from '../util/imagecache';

class RelativeToWorkspaceRootFileUrlMapper implements AbsoluteUrlMapper {
    private additionalSourceFolder: string = '';
    private workspaceFolder: string;
    private paths: { [alias: string]: string | string[] };
    private aliases: string[];

    map(fileName: string, imagePath: string) {
        let absoluteImagePath: string;

        if (this.workspaceFolder) {
            let rootPath = url.parse(this.workspaceFolder);
            const pathName = url.parse(imagePath).pathname;
            if (pathName) {
                const pathsToTest = [pathName];
                if (this.paths['']) {
                    let aliases = this.paths[''];
                    if (!Array.isArray(aliases)) {
                        aliases = [aliases];
                    }
                    aliases.forEach(alias => {
                        const resolvedPath = path.join(alias, pathName);
                        pathsToTest.push(resolvedPath);
                    });
                }
                const segments = pathName.split('/');
                const firstSegment = segments[0];
                if (firstSegment && this.aliases.indexOf(firstSegment) > -1) {
                    let aliases = this.paths[firstSegment];
                    if (!Array.isArray(aliases)) {
                        aliases = [aliases];
                    }
                    aliases.forEach(alias => {
                        segments[0] = alias;
                        const resolvedPath = segments.join('/');
                        pathsToTest.push(resolvedPath);
                    });
                }

                for (let index = 0; index < pathsToTest.length; index++) {
                    const testPath = pathsToTest[index];
                    let testImagePath = path.join(rootPath.href, testPath);
                    if (ImageCache.has(testImagePath) || fs.existsSync(testImagePath)) {
                        absoluteImagePath = testImagePath;
                    } else {
                        let testImagePath = path.join(rootPath.href, this.additionalSourceFolder, testPath);
                        if (ImageCache.has(testImagePath) || fs.existsSync(testImagePath)) {
                            absoluteImagePath = testImagePath;
                        }
                    }
                }
            }
        }
        return absoluteImagePath;
    }

    refreshConfig(workspaceFolder: string, sourcefolder: string, paths: { [alias: string]: string | string[] }) {
        this.workspaceFolder = workspaceFolder;
        this.additionalSourceFolder = sourcefolder;
        this.paths = paths;
        this.aliases = Object.keys(paths);
    }
}
export const relativeToWorkspaceRootFileUrlMapper: AbsoluteUrlMapper = new RelativeToWorkspaceRootFileUrlMapper();
