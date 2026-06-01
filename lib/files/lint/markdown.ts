import { applyFixes } from 'markdownlint';
import { lint as lintSync } from 'markdownlint/sync';

// Lint the Markdown and correct any issues
export async function lintMarkdown(
  md: string,
  options?: {
    fix?: boolean;
  },
): Promise<string> {
  const results = await lintSync({ strings: { content: md } });

  if (options?.fix) {
    const fixed = applyFixes(md, results.content);
    return fixed;
  }

  return md;
}
