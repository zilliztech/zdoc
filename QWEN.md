# Translate Workflow

This is a Docusaurus site, and this document explains the workflow for translating documents into specified languages.

## Path Information

Currently, there are two document sets that need to be translated:

- Cloud Manual

    Source language: English (./docs/tutorials)
    Target languages: Japanese (./i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials)

- BYOC Manual

    Source language: English (./docs/versioned_docs/version-byoc/tutorials)
    Target languages: Japanese (./i18n/ja-JP/docusaurus-plugin-content-docs/version-byoc/tutorials)


Currently, the Target folders contains the Japanese translation of the legacy documents. The latest source documents may have updates that are not reflected in the Target folders. Therefore, the translation process may have the following steps:

1. Use `git diff v2.22.0 v2.21.0 -- {target_folder}/**/*.md` to find the changes made to the source documents since the last translation.
2. Use the identified changes as a reference to update the corresponding translated documents in the Target folders. For documents that only have keyword changes, keep them as-is.
3. Use `npx docusaurus mdx-parse` to validate the translated documents.

## Translation Process

To translate the documents, follow these steps:

1. Clone the repository and create a new branch for the translation.
2. Use `git diff v2.22.0 v2.21.0 -- {target_folder}/**/*.md` to find the changes made to the source documents since the last translation. 
    - For any new file, create a new translation file in the Target folder.
    - For any updated file, update the corresponding translation file in the Target folder.
    - For any deleted file, delete the corresponding translation file from the Target folder.
    - Ignore all keyword changes, and leave them as-is.
3. Use the identified changes as a reference to update the corresponding translated documents in the Target folders.
4. Use `npx docusaurus mdx-parse` to validate the translated documents.
5. Commit the changes to the Target folders.
6. Create a pull request to merge the changes into the main branch.

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
- HTML structure is properly maintained, especially for tables and lists:
  - Make sure all table tags (`<table>`, `<tr>`, `<td>`, `<th>`) are properly opened and closed
  - Ensure nested tags are properly closed in the correct order (e.g., if `<p><ul>` is used, close with `</ul></p>`)
  - When translating content within table cells, maintain the same HTML structure as the original
  - Ensure all HTML elements are properly nested within each other without cross-closing
- Code-like content in regular text (e.g., `List<String>`) should be preserved exactly as-is to avoid being misinterpreted as HTML tags
- In the frontmatter, notice that the `title` and `description` fields should be translated as well. In common cases, the `title` field should be the same as the actual title of the doc in a hash symbol (e.g., `# Title`), while the `description` field should be the content of the first paragraph of the document.
- When translate the docs in `versioned_docs`, compare it with its counterpart in `docs` to identify the differences and translate them accordingly based on the translation in `docs`.
- Ignore `&#36;` in the translation, as it is a special character that represents a currency symbol.

