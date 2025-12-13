---
title: "Import Data (Console) | BYOC"
slug: /import-data-on-web-ui
sidebar_label: "Console"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page introduces how to import the prepared data on the Zilliz Cloud console. | BYOC"
type: origin
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - console
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Import Data (Console)

This page introduces how to import the prepared data on the Zilliz Cloud console.

## Import data on the web UI\{#import-data-on-the-web-ui}

Once data files are ready, you can upload them to an object storage bucket for data imports.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>You can have up to 10,000 running or pending import jobs in a collection.</p></li>
<li><p>The web console supports uploading a local JSON or Parquet file of up to 1 GB. For larger files, it is recommended to <a href="./import-data-on-web-ui#remote-files-from-an-object-storage-bucket">upload from an object storage</a> instead. If you have any difficulties with data import, please <a href="https://support.zilliz.com/hc/en-us">create a support ticket</a>.</p></li>
</ul>

</Admonition>

### Remote files from an object storage bucket\{#remote-files-from-an-object-storage-bucket}

To import remote files, you must first upload them to a remote bucket. You can easily convert your raw data into supported formats and upload the result files [using the BulkWriter tool](./use-bulkwriter). 

Once you have uploaded the prepared files to a remote bucket, select the object storage service and fill in the path to the files in the remote bucket and bucket credentials for Zilliz Cloud to pull data from your bucket. 

Based on your data security requirements, you can use either long-term credentials or short-term tokens during data import. 

For more information about obtaining credentials, refer to:

- Amazon S3: [Authenticate using long-term credentials](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [Manage HMAC keys for service accounts](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [View account access keys](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

For more information about using short-term tokens, refer to [this FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service).

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud now allows you to import data from any object storage service to any Zilliz Cloud cluster, regardless of the cloud provider hosting the clusters. For instance, you can import data from an AWS S3 bucket to a Zilliz Cloud cluster deployed on GCP.</p>

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

## Verify results\{#verify-results}

You can view the progress and status of the import job on the [Jobs](./job-center) page.

## Supported object paths\{#supported-object-paths}

For applicable object paths, refer to [Storage Options](./data-import-storage-options) and [Format Options](./data-import-format-options).

## Related topics\{#related-topics}

- [Storage Options](./data-import-storage-options)

- [Format Options](./data-import-format-options)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)

- [Data Import Hands-On](./data-import-zero-to-hero)

