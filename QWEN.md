# TRANSLATION WORKFLOW

This is a Docusaurus site, and this document explains the workflow for translating documents into specified languages.

## Path Information

Currently, there are two document sets that need to be translated:

- Cloud Manual

    - Source language: English (./docs/tutorials)
    - Target languages: Japanese (./i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials)

- BYOC Manual

    - Source language: English (./docs/versioned_docs/version-byoc/tutorials)
    - Target languages: Japanese (./i18n/ja-JP/docusaurus-plugin-content-docs/version-byoc/tutorials)

## Translation process

The folder structure inside the target language folder (e.g. `./i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials`) is the same as the source language folder, but with the translated content.

To translate a document, simply copy the English version of the document into the target language folder and start translating it.

During the translation, ensure：

- The translated content is in the correct format (e.g. markdown, HTML, etc.)
- The translated content is accurate and follows the same structure and terminology as the English version
- All links and references are kept as is.
- Any erroneous tags (such as `</content>`) are removed from translated files.
- Markdown formatting markers (such as `**`, `*`, `_`, `__`, etc.) may need spaces depending on context:
  - When formatting markers are adjacent to non-space characters without proper word boundaries, spaces may be needed for correct rendering
  - When English words/numbers are embedded within foreign language text (e.g., `**1つのバックアップ**`), standard formatting without extra spaces is often correct
  - When formatting contains special characters like HTML entities (e.g., `**&#36;0.02**`), proper spacing might be required
- English words embedded in foreign language text should maintain proper formatting according to the original context
- All bold, italic, and other formatting elements render correctly after translation

Once the translation is complete, submit a pull request to the `master` branch of the `zdoc` repository.

## Tool requirements

Add a tool named `MDX-PARSE` to be able to parse the source and target documents. The MDX-PARSE tool is implemented as a Docusaurus plugin and can be run with the command: `npx docusaurus mdx-parse`

## Translation steps

1. Review the English source document and identify possible glossary terms as well as the phrases that need to be preserved as is.
2. Check the existing glossary file in the `glossary/{language-code}` folder at the root of the repository and update it with new terms as needed.
3. Add the glossary terms as well as the phrases that should be preserved as is to the glossary file.
4. Translate the document into the target language.
5. Compare the translated document with the English source document to ensure that the translation is accurate and follows the same structure and terminology as the English version.
6. Use the `MDX-PARSE` tool to parse the source and target documents and ensure the document structure is not broken:
   - For a single file: `npx docusaurus mdx-parse -s <source-file>`
   - For comparing two files: `npx docusaurus mdx-parse -s <source-file> -t <target-file>`
   - For processing a directory: `npx docusaurus mdx-parse -d <directory>`
7. Submit a pull request to the `master` branch of the `zdoc` repository.
8. Once the pull request is approved, merge it into the `master` branch.

## Note

- The glossary file should be updated as the translation process progresses to ensure that the translations are accurate and up-to-date.
- The `MDX-PARSE` tool should be used to ensure that the document structure is not broken during the translation process.
- The translated document should be reviewed by a native speaker of the target language to ensure that the translation is accurate and follows the same structure and terminology as the English version.
- The MDX-PARSE tool is implemented as a Docusaurus plugin and integrates with the build process.
- After translation, verify that all documents maintain proper MDX structure using the validation command.
- When translating, pay close attention to removing any erroneous content that might be appended during file creation.
