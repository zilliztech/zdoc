export type GeneratedDocument = Readonly<{
  path: string;
  contents: string;
}>;

export type PublicationSourceIdentity = Readonly<{
  type: string;
  [key: string]: string;
}>;

export type PublicationContext = Readonly<{
  site: 'en' | 'zh-CN';
  manual: string;
  publicationRoot: string;
  baselineCommit: string;
  sourceIdentity: PublicationSourceIdentity;
}>;

export interface PublicationAdapter {
  id: string;
  transformDocument(document: GeneratedDocument, context: PublicationContext): GeneratedDocument;
  validatePublication(root: string, context: PublicationContext): Promise<void>;
}
