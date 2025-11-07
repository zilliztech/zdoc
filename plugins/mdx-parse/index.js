/**
 * MDX-PARSE Command Line Interface for Docusaurus
 * This CLI plugin can be run with: npx docusaurus mdx-parse
 */

module.exports = function (context, options) {
  return {
    name: 'docusaurus-mdx-parse-plugin',
    extendCli(cli) {
      cli
        .command('mdx-parse')
        .description('Validate and patch MDX documents to ensure proper structure')
        .option('-s, --source <source>', 'Source document to validate and patch')
        .option('-t, --target <target>', 'Target document to validate and patch')
        .option('-d, --directory <dir>', 'Directory containing MDX files to process')
        .option('-v, --verbose', 'Enable verbose logging')
        .action(async (opts) => {
          console.log('Running MDX-PARSE command...');
          
          // Import the MDX patching functionality
          const { applyMdxPatches } = require('./mdxPatcher');
          
          if (opts.directory) {
            // Process all MDX files in the specified directory
            const fs = require('fs');
            const path = require('path');
            
            if (!fs.existsSync(opts.directory)) {
              console.error(`Directory does not exist: ${opts.directory}`);
              process.exit(1);
            }
            
            const mdxFiles = fs.readdirSync(opts.directory).filter(file => 
              path.extname(file) === '.md' || path.extname(file) === '.mdx'
            );
            
            console.log(`Found ${mdxFiles.length} MDX files in ${opts.directory}`);
            
            for (const file of mdxFiles) {
              const filePath = path.join(opts.directory, file);
              console.log(`Processing ${filePath}...`);
              
              const originalContent = fs.readFileSync(filePath, 'utf8');
              const patchedContent = await applyMdxPatches(originalContent);
              
              if (originalContent !== patchedContent) {
                fs.writeFileSync(filePath, patchedContent);
                console.log(`Patched: ${filePath}`);
              } else {
                if (opts.verbose) {
                  console.log(`No changes needed: ${filePath}`);
                }
              }
            }
            
            console.log('MDX-PARSE directory processing completed.');
            return;
          }
          
          if (opts.source && opts.target) {
            // Process source and target files
            const fs = require('fs');
            
            if (!fs.existsSync(opts.source)) {
              console.error(`Source file does not exist: ${opts.source}`);
              process.exit(1);
            }
            
            if (!fs.existsSync(opts.target)) {
              console.error(`Target file does not exist: ${opts.target}`);
              process.exit(1);
            }
            
            console.log(`Validating and patching source: ${opts.source}`);
            console.log(`Validating and patching target: ${opts.target}`);
            
            // Patch source file
            const sourceContent = fs.readFileSync(opts.source, 'utf8');
            const patchedSourceContent = await applyMdxPatches(sourceContent);
            
            if (sourceContent !== patchedSourceContent) {
              fs.writeFileSync(opts.source, patchedSourceContent);
              console.log(`Patched source: ${opts.source}`);
            }
            
            // Patch target file
            const targetContent = fs.readFileSync(opts.target, 'utf8');
            const patchedTargetContent = await applyMdxPatches(targetContent);
            
            if (targetContent !== patchedTargetContent) {
              fs.writeFileSync(opts.target, patchedTargetContent);
              console.log(`Patched target: ${opts.target}`);
            }
            
            console.log('MDX-PARSE source and target processing completed.');
            return;
          }
          
          if (opts.source) {
            // Process single file
            const fs = require('fs');
            
            if (!fs.existsSync(opts.source)) {
              console.error(`File does not exist: ${opts.source}`);
              process.exit(1);
            }
            
            console.log(`Validating and patching: ${opts.source}`);
            
            const originalContent = fs.readFileSync(opts.source, 'utf8');
            const patchedContent = await applyMdxPatches(originalContent);
            
            if (originalContent !== patchedContent) {
              fs.writeFileSync(opts.source, patchedContent);
              console.log(`Patched: ${opts.source}`);
            } else {
              if (opts.verbose) {
                console.log(`No changes needed: ${opts.source}`);
              }
            }
            
            console.log('MDX-PARSE single file processing completed.');
            return;
          }
          
          console.log('No valid options provided. Use --help for usage information.');
        });
    },
  };
};