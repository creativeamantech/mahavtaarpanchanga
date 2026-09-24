/**
 * External Astrology Repository Metadata
 * Every imported calculation, formula or algorithmic constant MUST carry this trace.
 */
export interface RepositoryMetadata {
  /** Canonical name of the upstream source */
  repositoryName: string;
  /** Git URL or published package handle */
  repositoryUrl: string;
  /** Commit SHA or semver version verified during audit */
  commitOrVersion: string;
  /** License type (e.g. MIT, GPL-3.0, Apache-2.0) */
  license: string;
  /** Exact module/file path in the upstream repository */
  sourceFilePath: string;
  /** Primary astrological treatise referenced by this code (e.g. BPHS, Phaladeepika) */
  key?: string;
  nameEn?: string;
  nameHi?: string;
  nameSa?: string;
  sourceText?: string;
  classicalTextReference?: string;
  /** Specific chapter & verse numbers (e.g. BPHS Ch. 3, Shloka 12-15) */
  shlokaReference?: string;
  /** Explanation of mathematical adaptations or TypeScript translations */
  adaptationNotes: string;
}

/**
 * Interface that all external algorithm adapters must implement
 */
export interface IRepositoryAdapter<TInput, TOutput> {
  readonly metadata: RepositoryMetadata;
  execute(input: TInput): TOutput;
}
