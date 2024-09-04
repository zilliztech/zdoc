---
title: "Import Data (Console) | BYOC"
slug: /import-data-on-web-ui
sidebar_label: "Console"
beta: FALSE
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

---

import Admonition from '@theme/Admonition';


# Import Data (Console)

This page introduces how to import the prepared data on the Zilliz Cloud console.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have prepared your data in either of the supported formats. 

    For details on how to prepare your data, refer to [Prepare Source Data](./prepare-source-data). You can also refer to the end-to-end notebook [Data Import from Zero to Hero](./data-import-zero-to-hero) to get more.

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Example Dataset](./example-dataset) and [Manage Collections](./manage-collections).

## Import data on the web UI{#import-data-on-the-web-ui}

Once data files are ready, you can upload them to an object storage bucket for data imports.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>You can have up to 10 running or pending import jobs in a collection.</p></li>
<li><p>The web console supports uploading a local JSON file of up to 1 GB. For larger files, it is recommended to <a href="./import-data-on-web-ui#remote-files-from-an-object-storage-bucket">upload from an object storage</a> instead. If you have any difficulties with data import, please <a href="https://support.zilliz.com/hc/en-us">create a support ticket</a>.</p></li>
</ul>

</Admonition>

### Remote files from an object storage bucket{#remote-files-from-an-object-storage-bucket}

To import remote files, you must first upload them to a remote bucket. You can easily convert your raw data into supported formats and upload the result files [using the BulkWriter tool](./use-bulkwriter). 

Once you have uploaded the prepared files to a remote bucket, select the object storage service and fill in the path to the files in the remote bucket and bucket credentials for Zilliz Cloud to pull data from your bucket. 

Based on your data security requirements, you can use either long-term credentials or session tokens during data import. For more information about using session tokens, refer to [the FAQ](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service).

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud now allows you to import data from any object storage service to any Zilliz Cloud cluster, regardless of the cloud provider hosting the clusters. For instance, you can import data from an AWS S3 bucket to a Zilliz Cloud cluster deployed on GCP.</p>

</Admonition>

![byoc-data-import-on-console-remote](/byoc/byoc-data-import-on-console-remote.png)

## Verify resultes{#verify-resultes}

You can view the progress and status of the import job on the [Jobs](./job-center) page.

## Supported object paths{#supported-object-paths}

For applicable object paths, refer to [Tips on Import Paths](./prepare-source-data#tips-on-import-paths).

## Related topics{#related-topics}

- [Prepare Source Data](./prepare-source-data)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)

- [Data Import from Zero to Hero](./data-import-zero-to-hero) 

