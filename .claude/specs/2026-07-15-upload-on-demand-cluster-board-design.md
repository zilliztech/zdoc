# Upload On-Demand Cluster Board Image

## Goal

Add a one-off Node.js script that downloads the Feishu whiteboard used in the
"Modify an on-demand cluster" section and uploads it to the configured S3 image
bucket.

## Design

The script will hardcode the whiteboard token
`M2XMwoWoih17BRbqhGhcb6i9njg` and use the existing
`plugins/lark-docs/larkImageDownloader.js` implementation. It will instantiate
the downloader, call `__downloadBoardPreview()` to retrieve the PNG, validate
the HTTP response, and pass the response buffer to `__uploadToS3()` using the
key `M2XMwoWoih17BRbqhGhcb6i9njg.png`.

Configuration will come from the repository's `.env` file through the
downloader's existing dotenv setup. The script will not add command-line
options or duplicate Feishu and S3 client logic.

## Error Handling

An unsuccessful Feishu response will raise an error containing its HTTP status.
Unexpected download or upload errors will be printed and cause a nonzero exit
status. A successful run will print the uploaded S3 object key.

## Testing

A focused test will replace the downloader module with a test double and verify
that the script downloads the hardcoded board token and uploads the returned
buffer under the expected PNG key. The test will be observed failing before the
script is implemented, then rerun after implementation.
