import { Liquid } from 'liquidjs';
import path from 'path';
import fs from 'node:fs/promises';

export abstract class BaseGenerator<TContext extends object> {
  public readonly outputDirectory: string;
  public readonly context: TContext;
  public readonly templateEngine: Liquid;

  public constructor(
    outputDirectory: string,
    context: TContext,
    templateEngine: Liquid
  ) {
    this.outputDirectory = outputDirectory;
    this.context = context;
    this.templateEngine = templateEngine;
  }

  public outputPathTo(...names: string[]): string {
    return path.join(this.outputDirectory, ...names);
  }

  protected async renderTo(templatePath: string, to: string): Promise<void> {
    const targetPath = this.outputPathTo(to);
    const dirname = path.dirname(targetPath);
    await fs.mkdir(dirname, { recursive: true });

    return fs.writeFile(
      targetPath,
      await this.templateEngine.renderFile(
        `${templatePath}.liquid`,
        this.context
      )
    );
  }

  protected async renderAllTo(mappings: Record<string, string>): Promise<void> {
    const templates = Object.entries(mappings);
    const promises = templates.map(async ([template, to]) => {
      await this.renderTo(template, to);
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
