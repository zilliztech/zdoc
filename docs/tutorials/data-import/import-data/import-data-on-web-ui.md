---
slug: /import-data-on-web-ui
sidebar_label: Console
beta: FALSE
notebook: FALSE
type: origin
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Import Data (Console)

This page introduces how to import the prepared data on the Zilliz Cloud console.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have prepared your data in either of the supported formats. 

    For details on how to prepare your data, refer to [Prepare Source Data](./prepare-source-data). You can also refer to the end-to-end notebook [Data Import from Zero to Hero](./data-import-zero-to-hero) to get more.

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Example Dataset](./example-dataset) and [Manage Collections](./manage-collections).

## Import data on the web UI{#import-data-on-the-web-ui}

Once data files are ready, you can import them directly from your local drive or upload them to an object storage bucket, such as AWS S3 or Google Cloud GCS, for data imports.

<Admonition type="info" icon="📘" title="Notes">

<p>For successful data import, ensure that the object storage bucket you use is located in the same cloud as your cluster.</p>

</Admonition>

### Local JSON file{#local-json-file}

To import data, you can either drag and drop a local file into the upload area, or click __upload a file__ and select the file.

![data-import-on-console](/img/data-import-on-console.png)

### Remote files from an object storage bucket{#remote-files-from-an-object-storage-bucket}

To import remote files, you must first upload them to a remote bucket. You can easily convert your raw data into supported formats and upload the result files [using the BulkWriter tool](./use-bulkwriter). 

Once you have uploaded the prepared files to a remote bucket, fill in the path to the files in the remote bucket and bucket credentials for Zilliz Cloud to pull data from your bucket.

![data-import-on-console-remote](/img/data-import-on-console-remote.png)

### Supported object paths{#supported-object-paths}

The following table lists applicable remote bucket URIs and some quick examples for you to build a valid import path.

<Tabs defaultValue="aws" values={[{"label":"AWS","value":"aws"},{"label":"GCP","value":"gcs"},{"label":"Azure","value":"azure"}]}>

<TabItem value="aws">

- __Object access URIs__

    |  __URI Style__                            |  __URI Format__                                                 |
    | ----------------------------------------- | --------------------------------------------------------------- |
    |  __AWS S3 URI__                           |  `s3://bucket-name/object-name`                                 |
    |  __AWS Object URL, virtual-hosted–style__ |  `https://bucket-name.s3.region-code.amazonaws.com/object-name` |
    |  __AWS Object URL, path-style__           |  `https://s3.region-code.amazonaws.com/bucket-name/object-name` |

    For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

- __Quick examples__

    |  __File Type__ |  __Quick Examples__                                                                        |
    | -------------- | ------------------------------------------------------------------------------------------ |
    |  __JSON__      |  `s3://bucket-name/json-folder/`<br/> `s3://bucket-name/json-folder/data.json`          |
    |  __NumPy__     |  `s3://bucket-name/numpy_folder/`<br/> `s3://bucket-name/folder/*.npy`                  |
    |  __Parquet__   |  `s3://bucket-name/parquet-folder/`<br/> `s3://bucket-name/parquet-folder/data.parquet` |

- __Required permissions__

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

</TabItem>

<TabItem value="gcs">

- __Object access URIs__

    |  __URI Style__      |  __URI Format__                                           |
    | ------------------- | --------------------------------------------------------- |
    |  __GSC public URL__ |  `https://storage.googleapis.com/bucket_name/object_name` |
    |  __GSC gsutil URI__ |  `gs://bucket_name/object_name`                           |

    For more details, see [Share the object](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object).

- __Quick examples__

    |  __File Type__ |  __Quick Examples__                                                                        |
    | -------------- | ------------------------------------------------------------------------------------------ |
    |  __JSON__      |  `gs://bucket-name/json-folder/`<br/> `gs://bucket-name/json-folder/data.json`          |
    |  __NumPy__     |  `gs://bucket-name/numpy-folder/`<br/> `gs://bucket-name/numpy-folder/*.npy`            |
    |  __Parquet__   |  `gs://bucket-name/parquet-folder/`<br/> `gs://bucket-name/parquet-folder/data.parquet` |

- __Required permissions__

    - `storage.objects.get`

    - `storage.objects.list`

</TabItem>

<TabItem value="azure">

- __Object access URIs__

    |  __URI Style__              |  __URI Format__                                           |
    | --------------------------- | --------------------------------------------------------- |
    |  __Azure storage blob URI__ |  `https://storage.googleapis.com/bucket_name/object_name` |

    For more details, see [Resource URI Syntax](https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax).

- __Quick examples__

    |  __File Type__ |  __Quick Examples__                                                                                                                                              |
    | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  __JSON__      |  `https://myaccount.blob.core.windows.net/bucket-name/json-folder/`<br/> `https://myaccount.blob.core.windows.net/bucket-name/json-folder/data.json`          |
    |  __NumPy__     |  `https://myaccount.blob.core.windows.net/bucket-name/numpy-folder/`<br/> `https://myaccount.blob.core.windows.net/bucket-name/numpy-folder/*.npy`            |
    |  __Parquet__   |  `https://myaccount.blob.core.windows.net/bucket-name/parquet-folder/`<br/> `https://myaccount.blob.core.windows.net/bucket-name/parquet-folder/data.parquet` |

</TabItem>

</Tabs>

## Verify the result{#verify-the-result}

After the import is complete, you will receive the following information. At this point, you can view job details or start exploring the imported data for what interests you.

![data_import_complete](/img/data_import_complete.png)

## Related topics{#related-topics}

- [Prepare Source Data](./prepare-source-data)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)

- [Data Import from Zero to Hero](./data-import-zero-to-hero) 

