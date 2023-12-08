// const Scraper = require('./larkDocScraper.js')

// const scraper = new Scraper('OUWXw5c4gia34ZkQUcEcMFbWn6s', 'PnsobATKVayIDFs6hhQcChlGnje')

// scraper.fetch(recursive=false, page_token="BDOHwqlMDiei78kdUefcjSQUnEg")

const Writer = require('./larkDocWriter.js')

const writer = new Writer('OUWXw5c4gia34ZkQUcEcMFbWn6s')

writer.write_faqs('.')