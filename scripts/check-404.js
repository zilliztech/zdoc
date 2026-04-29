/**
 * Script to check for 404 errors in the documentation
 * This script is used by the check-404.yml GitHub Action workflow
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Function to find all markdown files in the docs directory
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to extract links from markdown content
function extractLinks(content) {
  // Regular expression to match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    // Only check HTTP/HTTPS URLs, not relative or anchor links
    if (url.startsWith('http://') || url.startsWith('https://')) {
      links.push(url);
    }
  }

  return links;
}

// Main function to check for 404 errors
async function check404Errors() {
  console.log('Starting 404 check...');
  
  // Find all markdown files in docs directories
  const markdownDirs = [
    './docs',
    './docs-byoc',
    './reference'
  ];
  
  const allMarkdownFiles = [];
  markdownDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      findMarkdownFiles(dir, allMarkdownFiles);
    }
  });

  console.log(`Found ${allMarkdownFiles.length} markdown files`);

  // Extract all links from markdown files
  const allLinks = new Set(); // Use Set to avoid duplicates
  allMarkdownFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const links = extractLinks(content);
    links.forEach(link => allLinks.add(link));
  });

  console.log(`Found ${allLinks.size} unique external links`);

  // Check each link for 404 errors
  const linksArray = Array.from(allLinks);
  const errorLinks = [];

  for (let i = 0; i < linksArray.length; i++) {
    const link = linksArray[i];
    console.log(`Checking (${i + 1}/${linksArray.length}): ${link}`);
    
    try {
      const response = await axios.head(link, { timeout: 10000 }); // 10 second timeout
      
      if (response.status >= 400) {
        errorLinks.push({
          url: link,
          status: response.status
        });
        console.log(`  ❌ ${response.status} - ${link}`);
      } else {
        console.log(`  ✅ ${response.status} - ${link}`);
      }
    } catch (error) {
      // If HEAD request fails, try GET as fallback
      try {
        const response = await axios.get(link, { timeout: 10000 });
        
        if (response.status >= 400) {
          errorLinks.push({
            url: link,
            status: response.status
          });
          console.log(`  ❌ ${response.status} - ${link}`);
        } else {
          console.log(`  ✅ ${response.status} - ${link}`);
        }
      } catch (getError) {
        errorLinks.push({
          url: link,
          status: getError.response?.status || 'ERROR',
          message: getError.message
        });
        console.log(`  ❌ ERROR - ${link}: ${getError.message}`);
      }
    }
  }

  // Report results
  if (errorLinks.length > 0) {
    console.log('\n❌ Found broken links:');
    errorLinks.forEach(link => {
      console.log(`  Status ${link.status}: ${link.url}`);
      if (link.message) {
        console.log(`    Error: ${link.message}`);
      }
    });
    
    console.log(`\nTotal broken links: ${errorLinks.length}`);
    process.exit(1); // Exit with error code
  } else {
    console.log('\n✅ No broken links found!');
  }
}

// Run the check
check404Errors().catch(error => {
  console.error('Error during 404 check:', error);
  process.exit(1);
});