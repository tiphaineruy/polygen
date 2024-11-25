import path from 'path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ASSETS_DIR = path.join(fileURLToPath(import.meta.url), 'data/assets');

export abstract class BaseGenerator {
  public readonly outputDirectory: string;

  protected constructor(outputDirectory: string) {
    this.outputDirectory = outputDirectory;
  }

  /**
   * Builds path to specified file, prefixing it with output directory, if any.
   *
   * @param names Path components
   */
  public outputPathTo(...names: string[]): string {
    return path.join(this.outputDirectory, ...names);
  }

  protected async writeTo(to: string, text: string): Promise<void> {
    const targetPath = this.outputPathTo(to);
    const dirname = path.dirname(targetPath);
    await fs.mkdir(dirname, { recursive: true });
    await fs.writeFile(targetPath, text, { encoding: 'utf8' });
  }

  protected async writeAllTo(
    contentMap: Record<string, string>
  ): Promise<void> {
    const promises = Object.entries(contentMap).map(([to, content]) =>
      this.writeTo(to, content)
    );
    await Promise.allSettled(promises);
  }

  protected async copyAsset(
    assetPath: string,
    to: string = assetPath
  ): Promise<void> {
    const targetPath = this.outputPathTo(to);
    const dirname = path.dirname(targetPath);
    await fs.mkdir(dirname, { recursive: true });

    await fs.cp(path.join(ASSETS_DIR, assetPath), targetPath, {
      recursive: true,
      errorOnExist: false,
    });
  }

  protected async copyAssets(assetMap: Record<string, string>): Promise<void> {
    const assets = Object.entries(assetMap);
    const promises = assets.map(async ([from, to]) => {
      await this.copyAsset(from, to);
    });
    await Promise.allSettled(promises);
  }

  /**
   * Helper method that generates specified files only when the source files
   * are newer than output files, which suggest that the output files are outdated.
   *
   * The comparison is done basing on `modified_time` attribute of every file.
   *
   * @param sources List of input files
   * @param outputs List of output files
   * @param cb Callback that generates the output files
   * @protected
   */
  protected async generating<R>(
    sources: string[],
    outputs: string[],
    cb: () => R
  ): Promise<R | void> {
    const sourceStats = await Promise.all(sources.map((file) => fs.stat(file)));
    const outputStats = await Promise.all(outputs.map((file) => fs.stat(file)));

    const sourceAccessTimes = sourceStats.map((e) => e.mtimeMs);
    const outputAccessTimes = outputStats.map((e) => e.mtimeMs);
    const latestSource = Math.max(...sourceAccessTimes);
    const oldestOutput = Math.min(...outputAccessTimes);

    if (latestSource > oldestOutput) {
      return cb();
    }
  }
}
