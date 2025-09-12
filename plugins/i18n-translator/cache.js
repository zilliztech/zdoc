import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('./translation.db');

function getHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

// Content-based hashing for rewrite cache - extracts semantic content
function getContentFingerprint(template, content, originalSourceText, targetLang) {
    // Extract placeholder structure from template
    const placeholders = template.match(/%%TEXT\d+%%/g) || [];
    const placeholderSignature = placeholders.join(',');
    
    // Normalize content for comparison
    const normalizedContent = normalizeContent(content);
    const normalizedOriginalSource = normalizeContent(originalSourceText);
    
    // Create semantic fingerprint
    const fingerprintData = `${placeholderSignature}|||${normalizedContent}|||${normalizedOriginalSource}|||${targetLang}`;
    return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

// Normalize content by removing minor variations
function normalizeContent(content) {
    return content
        .trim()
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[。！？]\s*/g, '。') // Normalize sentence endings
        .replace(/[，、]\s*/g, '，'); // Normalize commas
}

// Calculate similarity between two content strings (0-1)
function calculateSimilarity(content1, content2) {
    const normalized1 = normalizeContent(content1);
    const normalized2 = normalizeContent(content2);
    
    // Simple word-based similarity
    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    
    const wordSet1 = new Set(words1);
    const wordSet2 = new Set(words2);
    
    const intersection = new Set([...wordSet1].filter(word => wordSet2.has(word)));
    const union = new Set([...wordSet1, ...wordSet2]);
    
    return intersection.size / union.size; // Jaccard similarity
}

// Legacy hash function for backward compatibility
function getRewriteHash(template, content, originalSourceText, targetLang) {
    const data = `${template}|||${content}|||${originalSourceText}|||${targetLang}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

export function initRewriteCache() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Add new columns for fuzzy matching if they don't exist
            db.run(`
                CREATE TABLE IF NOT EXISTS rewrites (
                    rewrite_hash TEXT PRIMARY KEY,
                    template TEXT,
                    original_content TEXT,
                    target_lang TEXT,
                    rewritten_content TEXT,
                    content_fingerprint TEXT,
                    placeholder_signature TEXT,
                    normalized_content TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    reject(err);
                } else {
                    // Add new columns for existing records
                    db.run(`ALTER TABLE rewrites ADD COLUMN content_fingerprint TEXT`, (err) => {
                        // Ignore error if column already exists
                    });
                    db.run(`ALTER TABLE rewrites ADD COLUMN placeholder_signature TEXT`, (err) => {
                        // Ignore error if column already exists
                    });
                    db.run(`ALTER TABLE rewrites ADD COLUMN normalized_content TEXT`, (err) => {
                        // Ignore error if column already exists
                        resolve();
                    });
                }
            });
        });
    });
}

export function getFromRewriteCache(template, content, originalSourceText, targetLang) {
    return new Promise((resolve, reject) => {
        // First try exact match (backward compatibility)
        const exactHash = getRewriteHash(template, content, originalSourceText, targetLang);
        
        db.get(
            'SELECT rewritten_content FROM rewrites WHERE rewrite_hash = ?',
            [exactHash],
            (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    // Exact match found
                    resolve(row.rewritten_content);
                } else {
                    // Try fuzzy matching
                    fuzzyMatchFromCache(template, content, originalSourceText, targetLang)
                        .then(result => resolve(result))
                        .catch(reject);
                }
            }
        );
    });
}

// Fuzzy matching function
async function fuzzyMatchFromCache(template, content, originalSourceText, targetLang, similarityThreshold = 0.85) {
    return new Promise((resolve, reject) => {
        // Extract placeholder signature and normalize content
        const placeholders = template.match(/%%TEXT\d+%%/g) || [];
        const placeholderSignature = placeholders.join(',');
        const normalizedContent = normalizeContent(content);
        const contentFingerprint = getContentFingerprint(template, content, originalSourceText, targetLang);
        
        // First try content fingerprint match
        db.get(
            'SELECT rewritten_content FROM rewrites WHERE content_fingerprint = ? AND target_lang = ?',
            [contentFingerprint, targetLang],
            (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    // Content fingerprint match found
                    resolve(row.rewritten_content);
                } else {
                    // Try similarity-based matching
                    db.all(
                        'SELECT rewritten_content, normalized_content, placeholder_signature FROM rewrites WHERE target_lang = ?',
                        [targetLang],
                        (err, rows) => {
                            if (err) {
                                reject(err);
                            } else {
                                const bestMatch = findBestMatch(rows, placeholderSignature, normalizedContent, similarityThreshold);
                                resolve(bestMatch ? bestMatch.rewritten_content : null);
                            }
                        }
                    );
                }
            }
        );
    });
}

// Find the best match from cache entries
function findBestMatch(cacheEntries, placeholderSignature, normalizedContent, similarityThreshold) {
    let bestMatch = null;
    let highestSimilarity = 0;
    
    for (const entry of cacheEntries) {
        // Check placeholder structure similarity
        const placeholderSimilarity = calculatePlaceholderSimilarity(
            placeholderSignature, 
            entry.placeholder_signature || ''
        );
        
        // Check content similarity
        const contentSimilarity = calculateSimilarity(
            normalizedContent, 
            entry.normalized_content || ''
        );
        
        // Combined similarity score
        const combinedSimilarity = (placeholderSimilarity * 0.3) + (contentSimilarity * 0.7);
        
        if (combinedSimilarity > similarityThreshold && combinedSimilarity > highestSimilarity) {
            highestSimilarity = combinedSimilarity;
            bestMatch = entry;
        }
    }
    
    return bestMatch;
}

// Calculate similarity between placeholder signatures
function calculatePlaceholderSimilarity(sig1, sig2) {
    if (!sig1 || !sig2) return 0;
    
    const placeholders1 = sig1.split(',');
    const placeholders2 = sig2.split(',');
    
    const set1 = new Set(placeholders1);
    const set2 = new Set(placeholders2);
    
    const intersection = new Set([...set1].filter(p => set2.has(p)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size; // Jaccard similarity
}

export function setInRewriteCache(template, content, originalSourceText, targetLang, rewrittenContent) {
    return new Promise((resolve, reject) => {
        const hash = getRewriteHash(template, content, originalSourceText, targetLang);
        
        // Generate fuzzy matching data
        const placeholders = template.match(/%%TEXT\d+%%/g) || [];
        const placeholderSignature = placeholders.join(',');
        const normalizedContent = normalizeContent(content);
        const contentFingerprint = getContentFingerprint(template, content, originalSourceText, targetLang);
        
        db.run(
            `REPLACE INTO rewrites (
                rewrite_hash, template, original_content, target_lang, rewritten_content,
                content_fingerprint, placeholder_signature, normalized_content
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [hash, template, content, targetLang, rewrittenContent, contentFingerprint, placeholderSignature, normalizedContent],
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}

export function initCache() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS translations (
                    source_text_hash TEXT PRIMARY KEY,
                    source_text TEXT,
                    target_lang TEXT,
                    translated_text TEXT
                )
            `, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

export function getFromCache(sourceText, targetLang) {
    return new Promise((resolve, reject) => {
        const hash = getHash(sourceText);
        db.get(
            'SELECT translated_text FROM translations WHERE source_text_hash = ? AND target_lang = ?',
            [hash, targetLang],
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.translated_text : null);
                }
            }
        );
    });
}

export function setInCache(sourceText, targetLang, translatedText) {
    return new Promise((resolve, reject) => {
        const hash = getHash(sourceText);
        db.run(
            'REPLACE INTO translations (source_text_hash, source_text, target_lang, translated_text) VALUES (?, ?, ?, ?)',
            [hash, sourceText, targetLang, translatedText],
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}
