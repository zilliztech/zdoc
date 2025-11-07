/**
 * MDX Patching Module
 * Contains the MDX patching logic extracted from larkDocWriter.js __mdx_patches method
 */

// Function to apply MDX patches as per the larkDocWriter.js implementation
async function applyMdxPatches(content) {
    try {
        // Dynamically import the MDX compile function due to ES module restrictions
        const { compile } = await import('@mdx-js/mdx');
        
        let patchedContent = content;
        let maxIterations = 50; // Prevent infinite loops
        let iteration = 0;

        while (iteration < maxIterations) {
            try {
                // Try to compile the current content
                await compile(patchedContent, { development: false });
                console.log(`MDX compilation succeeded after ${iteration} fixes`);
                return patchedContent; // If compilation succeeds, return the fixed content
            } catch (error) {
                console.log(`MDX compilation error detected (iteration ${iteration + 1}): ${error.message}`);

                // Identify problematic characters based on the error
                let madeChanges = false;
                let line, column, offset;
                switch (error.ruleId) {
                    case 'acorn':
                        line = error.place.line;
                        column = error.place.column;
                        offset = error.place.offset;
                        
                        if (offset !== undefined && offset > 0 && offset < patchedContent.length) {
                            for (let i = offset - 1; i >= 0; i--) {
                                if (patchedContent[i] === '{') {
                                    patchedContent = patchedContent.slice(0, i) + '\\' + patchedContent.slice(i);
                                    madeChanges = true;
                                    break;
                                }
                            }
                        }
                        break;
                    case 'end-tag-mismatch':
                        let tag = error.message.match(/<(?!\/)([A-Za-z][A-Za-z0-9:_-]*)\b[^>]*>/g)?.[0];
                        let pos = error.message.match(/(\d+):(\d+)-(\d+):(\d+)/);
                        if (tag && pos) {
                            const start = { line: parseInt(pos[1]), column: parseInt(pos[2]) }

                            patchedContent = patchedContent.split('\n').map((line, index) => {
                                if (index === start.line - 1) {
                                    line = line.slice(0, start.column - 1) + '\\' + line.slice(start.column - 1)
                                    madeChanges = true;
                                }

                                return line
                            }).join('\n')
                        }
                        
                        break;
                    case 'unexpected-closing-slash':
                        // For this specific error "Unexpected closing slash `/` in tag, expected an open tag first"
                        // it typically means there's a stray `</content>` tag or similar erroneous closing tag
                        // Remove erroneous closing tags at the end of document
                        const originalContent = patchedContent;
                        patchedContent = patchedContent.replace(/<\/(?:content|[\w\d]+)>\s*$/, '');
                        if (originalContent !== patchedContent) {
                            madeChanges = true;
                        } else {
                            // If no match at end, look for the erroneous tag anywhere in the content
                            // that might be causing the slash error
                            patchedContent = patchedContent.replace(/<[/](\w+)>/g, (match, tagName) => {
                                // If this tag doesn't have a matching opening tag, remove it
                                const openingTagCount = (patchedContent.match(new RegExp(`<${tagName}(?:\\s|>|/>)`, 'g')) || []).length;
                                const closingTagCount = (patchedContent.match(new RegExp(`<\\/${tagName}>`, 'g')) || []).length;
                                
                                // If there are more closing tags than opening tags, this closing tag is erroneous
                                if (closingTagCount > openingTagCount) {
                                    return ''; // Remove the erroneous closing tag
                                }
                                return match;
                            });
                            
                            if (originalContent !== patchedContent) {
                                madeChanges = true;
                            }
                        }
                        break;
                    case 'unexpected-character':
                        if (error.message.includes('U+002C') || error.message.includes('U+002A')) {
                            offset = error.place.offset;
                            if (offset !== undefined && offset > 0 && offset < patchedContent.length) {
                                for (let i = offset-1; i >= 0; i--) {
                                    if (patchedContent[i] === '<') {
                                        patchedContent = patchedContent.slice(0, i) + '\\' + patchedContent.slice(i);
                                        madeChanges = true;
                                        break;
                                    }
                                }
                            }
                        }
                        break;
                    default: 
                        madeChanges = false;
                        break;
                }

                if (!madeChanges) {
                    console.warn('No changes made to content, breaking loop to prevent infinite iteration');
                    break;
                }
            }

            iteration++;
        }

        if (iteration >= maxIterations) {
            console.warn(`Maximum MDX patch iterations (${maxIterations}) reached, returning last attempt`);
        }

        return patchedContent;
    } catch (error) {
        console.error('Failed to apply MDX patches:', error.message);
        return content; // Return original content if patching fails
    }
}

module.exports = {
    applyMdxPatches
};