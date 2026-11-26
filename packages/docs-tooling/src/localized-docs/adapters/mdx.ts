import { validateFrontmatter } from '../../mdx/index.ts'
import { toMdx } from '../../shared-docs/adapters/mdx.ts'
import type { Component } from '../../shared-docs/core/site/types.ts'
import type { AdaptedLocalizedPage, DiagnosticContext, LocalizedDocsError, MdxAdapter } from '../core/types.ts'
import { localizedError } from '../core/types.ts'

export const localizedMdxAdapter: MdxAdapter = {
  async toMdx(
    adapted: AdaptedLocalizedPage,
    context: DiagnosticContext,
  ): Promise<{ mdx: string } | { errors: LocalizedDocsError[] }> {
    try {
      validateFrontmatter(adapted.markdown, context.file)
    } catch (error) {
      return {
        errors: [
          localizedError(
            'ADAPT_MDX_INVALID',
            error instanceof Error ? error.message : String(error),
            context,
            1,
          ),
        ],
      }
    }

    const result = await toMdx(
      {
        markdown: adapted.markdown,
        components: adapted.components as Component[],
        provenance: adapted.provenance,
      },
      context,
      { preserveFrontMatter: true },
    )
    if ('errors' in result) {
      return { errors: result.errors }
    }
    return { mdx: result.mdx }
  },
}
