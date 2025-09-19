import fs from 'fs';
import path from 'path';
import Extractor from './extractor.js';
import Translator from './translator.js';
import Restorer from './restorer.js';
import Bottleneck from 'bottleneck';
import { initCache, getFromCache, setInCache, initRewriteCache, getFromRewriteCache, setInRewriteCache } from './cache.js';

// Helper function to detect version from source file path
function detectVersionFromPath(sourcePath, versions) {
    const absolutePath = path.resolve(sourcePath);
    
    // Check if it's in versioned_docs directory
    if (absolutePath.includes('versioned_docs')) {
        // Extract version from path like versioned_docs/version-byoc/tutorials/...
        const match = absolutePath.match(/versioned_docs\/version-([^\/]+)/);
        if (match) {
            const versionPath = match[1];
            // Find the version key that matches this path
            return Object.keys(versions).find(key => versions[key] === versionPath) || versionPath;
        }
    }
    
    // Default to current if it's in docs directory
    if (absolutePath.includes('docs/')) {
        return 'current';
    }
    
    // Fallback to current
    return 'current';
}

// Helper function to get versions from docusaurus config using siteConfig API
function getAvailableVersions(siteConfig) {
    try {
        const docsConfig = siteConfig.presets.find(preset => 
            preset[0] === 'classic' && preset[1] && preset[1].docs
        );
        
        if (!docsConfig || !docsConfig[1].docs.versions) {
            return { 
                versions: { current: 'current' }, 
                versionDirMap: { current: 'current' } 
            };
        }
        
        const versionsConfig = docsConfig[1].docs.versions;
        const versions = {};
        const versionDirMap = {};
        
        Object.keys(versionsConfig).forEach(versionKey => {
            const versionConfig = versionsConfig[versionKey];
            if (versionConfig.path) {
                versions[versionKey] = versionConfig.path;
                versionDirMap[versionKey] = `version-${versionConfig.path}`;
            } else {
                versions[versionKey] = versionKey;
                versionDirMap[versionKey] = versionKey;
            }
        });
        
        return { versions, versionDirMap };
    } catch (error) {
        console.warn('Warning: Could not read docusaurus config for versions. Using default.');
        return { 
            versions: { current: 'current' }, 
            versionDirMap: { current: 'current' } 
        };
    }
}



export default function i18nTranslator(context, options) {
  const { glossaries = {}, untranslatables = [], modelConfig = {}, throttleConfig = {} } = options;
  
  return {
    name: 'i18n-translator',
    extendCli(cli) {
      // Add help command for versions
      cli.command('i18n:versions')
        .description('Show available doc versions for translation')
        .action(() => {
          const { versions } = getAvailableVersions(context.siteConfig);
          console.log('Available doc versions:');
          Object.keys(versions).forEach(version => {
            console.log(`  - ${version}`);
          });
          console.log('\nUsage: docusaurus i18n:translate -s <file> -t <lang>   # Single file');
        console.log('   or: docusaurus i18n:translate -v <version> -t <lang>   # Batch version folder');
        });

      cli.command('i18n:translate')
        .option('-s, --source <source>', 'Source text file path')
        .option('-l, --source-lang <sourceLang>', 'Source language', 'en-US')
        .option('-t, --target-lang <targetLang>', 'Target language')
        .option('-v, --version-folder <version>', 'Translate all files in the specified version folder')
        .option('--force-translation', 'Force retranslation of all items')
        .option('--force-rewriting', 'Force rewriting of all complex blocks')
        .action(async (opts) => {
            if (!opts.targetLang) {
                console.error('Error: Target language must be specified with -t or --target-lang.');
                return;
            }
            
            // Validate mutually exclusive flags
            if (opts.source && opts.versionFolder) {
                console.error('Error: Cannot use both -s/--source and -v/--version-folder flags together.');
                console.error('Use -s for single file translation or -v for batch version translation.');
                return;
            }
            
            if (!opts.source && !opts.versionFolder) {
                console.error('Error: Must specify either -s/--source or -v/--version-folder flag.');
                return;
            }

            // Get available versions from docusaurus config
            const { versions, versionDirMap } = getAvailableVersions(context.siteConfig);
            
            if (opts.source) {
                // Single file translation mode
                const detectedVersion = detectVersionFromPath(opts.source, versions);
                console.log(`Translating ${opts.source} from ${opts.sourceLang} to ${opts.targetLang} (${detectedVersion} version)...`);
                await translateSingleFile(opts.source, detectedVersion, versions, versionDirMap, {
                    ...opts,
                    glossaries,
                    untranslatables,
                    modelConfig,
                    throttleConfig
                }, context);
            } else if (opts.versionFolder) {
                // Batch translation mode
                if (!versions[opts.versionFolder]) {
                    console.error(`Error: Invalid version '${opts.versionFolder}'. Valid versions are: ${Object.keys(versions).join(', ')}`);
                    return;
                }
                console.log(`Translating all files in ${opts.versionFolder} version from ${opts.sourceLang} to ${opts.targetLang}...`);
                await translateVersionFolder(opts.versionFolder, versions, versionDirMap, {
                    ...opts,
                    glossaries,
                    untranslatables,
                    modelConfig,
                    throttleConfig
                }, context);
            }
        });
    }
  }
}

// Helper function to translate a single file
async function translateSingleFile(sourceFile, version, versions, versionDirMap, opts, context) {
    await initCache();
    await initRewriteCache();

    const file = fs.readFileSync(sourceFile, 'utf8');
    const targetLangGlossary = opts.glossaries ? opts.glossaries[opts.targetLang] || [] : [];
    const untranslatables = opts.untranslatables || [];
    const extractor = new Extractor({content: file, targetLang: opts.targetLang, glossary: targetLangGlossary, untranslatables});

    // write the template to a file for debugging if DEBUG_LEVEL is set to 1 or higher
    if (process.env.DEBUG_LEVEL && process.env.DEBUG_LEVEL >= 1) {
        const templateContent = extractor.templates.map(template => template.template).join('\n\n');
        console.log(`Writing template to file for debugging: ${sourceFile}.template.md`);
        fs.writeFileSync(`${sourceFile}.template.md`, templateContent);
    }

    const translator = new Translator({
        modelConfig: opts.modelConfig || {},
        throttleConfig: opts.throttleConfig || {}
    });

    const cachedItems = [];
    const itemsToTranslate = [];

    for (const item of extractor.translatables) {
        const cached = opts.forceTranslation ? null : await getFromCache(item.text, opts.targetLang);
        if (cached) {
            cachedItems.push({ ...item, translatedText: cached });
        } else {
            itemsToTranslate.push(item);
        }
    }

    console.log(`Found ${extractor.translatables.length} items: ${cachedItems.length} from cache, ${itemsToTranslate.length} to translate.`);

    let completedItems = 0;
    const translationPromises = itemsToTranslate.map(async item => {
        const translatedText = await translator.translate(item.text, opts.sourceLang, opts.targetLang, item.specialTerms || []);
        completedItems++;
        const percentage = Math.round((completedItems / itemsToTranslate.length) * 100);
        if (itemsToTranslate.length > 0) {
            process.stdout.write(`Progress: ${completedItems}/${itemsToTranslate.length} (${percentage}%) translated.\r`);
        }
        setInCache(item.text, opts.targetLang, translatedText);
        return {
            ...item,
            translatedText: translatedText
        };
    });

    const newTranslatedItems = await Promise.all(translationPromises);
    const allTranslatedItems = [...cachedItems, ...newTranslatedItems];

    process.stdout.write('\n');
    console.log('Translation complete. Reconstructing file...');

    const restorer = new Restorer(extractor.templates, allTranslatedItems, extractor.frontmatter, extractor.slugs, opts.sourceLang, opts.targetLang, {
        forceRewriting: opts.forceRewriting,
        rewriteCache: {
            get: getFromRewriteCache,
            set: setInRewriteCache
        }
    });

    // show the slugs for debugging if DEBUG_LEVEL is set to 1 or higher
    if (process.env.DEBUG_LEVEL && process.env.DEBUG_LEVEL >= 1) {
        console.log('Slugs:');
        console.log(JSON.stringify(restorer.slugs, null, 2));
    }

    const translatedMarkdown = await restorer.restore();

    // Calculate the correct relative path based on the detected version
    let relativePath;
    if (version === 'current') {
        relativePath = path.relative('docs', sourceFile);
    } else {
        // For versioned docs, they are in versioned_docs/version-{path}/
        const versionPath = versions[version] || version;
        relativePath = path.relative(`versioned_docs/version-${versionPath}`, sourceFile);
    }
    const targetDir = versionDirMap[version] || version;
    
    const targetPath = path.join(
        context.siteDir,
        'i18n',
        opts.targetLang,
        'docusaurus-plugin-content-docs',
        targetDir,
        relativePath
    );

    const targetDirPath = path.dirname(targetPath);
    if (!fs.existsSync(targetDirPath)) {
        fs.mkdirSync(targetDirPath, { recursive: true });
    }

    fs.writeFileSync(targetPath, translatedMarkdown);
    console.log(`Successfully wrote translated file to ${targetPath}`);
}

// Helper function to translate all files in a version folder
async function translateVersionFolder(version, versions, versionDirMap, opts, context) {
    const versionPath = versions[version] || version;
    let sourceDir;
    
    if (version === 'current') {
        sourceDir = 'docs';
    } else {
        sourceDir = `versioned_docs/version-${versionPath}`;
    }
    
    if (!fs.existsSync(sourceDir)) {
        console.error(`Error: Source directory '${sourceDir}' not found.`);
        return;
    }
    
    // Find all markdown files in the directory recursively
    const markdownFiles = [];
    const findMarkdownFiles = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                findMarkdownFiles(filePath);
            } else if (file.endsWith('.md')) {
                markdownFiles.push(filePath);
            }
        });
    };
    
    findMarkdownFiles(sourceDir);
    
    if (markdownFiles.length === 0) {
        console.log('No markdown files found in the specified version.');
        return;
    }
    
    console.log(`Found ${markdownFiles.length} markdown files to translate.`);
    
    // Translate each file
    for (let i = 0; i < markdownFiles.length; i++) {
        const file = markdownFiles[i];
        console.log(`\n[${i + 1}/${markdownFiles.length}] Translating ${file}...`);
        await translateSingleFile(file, version, versions, versionDirMap, opts, context);
    }
    
    console.log(`\nBatch translation complete! Translated ${markdownFiles.length} files in ${version} version.`);
}
