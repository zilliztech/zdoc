---
slug: /import-data-on-web-ui
beta: FALSE
notebook: FALSE
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Import Data (Console)

This page introduces how to import the prepared data on the Zilliz Cloud console.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have prepared your data in either of the supported formats. 

    For details on how to prepare your data, refer to [Prepare Source Data](./prepare-source-data). You can also refer to the end-to-end notebook [Data Import from Zero to Hero](./data-import-zero-to-hero) to get more.

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Example Dataset](./example-dataset) and [Create Collection](./create-collection).

## Import data on the web UI{#import-data-on-the-web-ui}

Once data files are ready, you can upload them to an object storage bucket for data imports.

<Admonition type="info" icon="📘" title="Notes">

For successful data import, ensure that the object storage bucket you use is located in the same cloud as your cluster.

</Admonition>

### Remote files from an object storage bucket{#remote-files-from-an-object-storage-bucket}

To import remote files, you must first upload them to a remote bucket. You can easily convert your raw data into supported formats and upload the result files [using the BulkWriter tool](./use-bulkwriter). 

Once you have uploaded the prepared files to a remote bucket, fill in the path to the files in the remote bucket and bucket credentials for Zilliz Cloud to pull data from your bucket.

![byoc-data-import-on-console-remote](/byoc/byoc-data-import-on-console-remote.png)

### Supported object paths{#supported-object-paths}

The following table lists applicable remote bucket URIs and some quick examples for you to build a valid import path.

- **Object access URIs**

    |  **URI Style**                            |  **URI Format**                                                 |
    | ----------------------------------------- | --------------------------------------------------------------- |
    |  **AWS S3 URI**                           |  `s3://bucket-name/object-name`                                 |
    |  **AWS Object URL, virtual-hosted–style** |  `https://bucket-name.s3.region-code.amazonaws.com/object-name` |
    |  **AWS Object URL, path-style**           |  `https://s3.region-code.amazonaws.com/bucket-name/object-name` |

    For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

- **Quick examples**

    |  **File Type** |  **Quick Examples**                                                                        |
    | -------------- | ------------------------------------------------------------------------------------------ |
    |  **JSON**      |  `s3://bucket-name/json-folder/`<br/> `s3://bucket-name/json-folder/data.json`          |
    |  **NumPy**     |  `s3://bucket-name/numpy_folder/`<br/> `s3://bucket-name/folder/*.npy`                  |
    |  **Parquet**   |  `s3://bucket-name/parquet-folder/`<br/> `s3://bucket-name/parquet-folder/data.parquet` |

- **Required permissions**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

## Verify the result{#verify-the-result}

After the import is complete, you will receive the following information. At this point, you can view job details or start exploring the imported data for what interests you.

![data_import_complete](/byoc/data_import_complete.png)

## Related topics{#related-topics}

- [Prepare Source Data](./prepare-source-data)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)

- [Data Import from Zero to Hero](./data-import-zero-to-hero) 

