---
slug: /import-data-on-web-ui
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Import Data on Web UI

This tutorial guides you through the process of importing data into an existing collection on the Zilliz Cloud web UI.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Create Collection](./create-collection-2).

## Prepare data files{#prepare-data-files}

Zilliz Cloud supports data import from local or remote files in JSON or NumPy formats. If your data is in a different format, convert it using the **BulkWriter** tool. For details, see [Prepare Data Import](./use-bulkwriter-for-data-import).

The [example dataset](./example-dataset-1) used in this tutorial is a row-based JSON file that can be directly [imported locally](./import-data-on-web-ui#local-json-file).

### Local JSON file{#local-json-file}

- Only JSON format is supported for local file import.

- Maximum file size: 512 MB for serverless clusters, 1 GB for dedicated clusters. For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

- Only one JSON file can be uploaded per import.

### Remote files{#remote-files}

When importing data from remote files, consider the following based on the file format:

- **JSON data**
    - Each import supports one JSON file, prohibiting simultaneous multiple JSON file uploads.

- **NumPy data**
    - Allows uploading multiple files at once or organizing these files into a folder for batch uploading.

    - The folder may have up to two subfolders, each subfolder must not exceed 10 GB, and the parent folder's maximum size is 100 GB.

- **Folder organization**
    - Ensure data type consistency within the folder, allowing a maximum of two subfolders.

    - In cases where a folder contains:
        - Both JSON and NumPy data or more than two subfolders, an error will occur during data import.

        - NumPy files along with unsupported data types, only the NumPy files will be imported, ignoring the unsupported files.

    - Example of valid paths: `/dataset1/` or `/dataset2/sub/`.

To convert the example dataset into multiple NumPy files, use the following code:

```python
import json
import numpy

with open('path/to/medium_articles_2020_dpr.json') as f:
    dataset = json.load(f)
    keys = dataset['rows'][0].keys()

    for key in keys:
        numpy.save(f'{key}.npy', numpy.array([ x[key] for x in dataset['rows'] ]))

    # For JSON fields, you should dump the field values before saving them
    # numpy.save(f'json_field.npy', numpy.array([
    #     json.dumps({"year": 2015, "price": 23.43}),
    #     json.dumps({"year": 2018, "price": 15.05}),
    #     json.dumps({"year": 2020, "price": 36.68}),
    #     json.dumps({"year": 2019, "price": 20.14}),
    #     json.dumps({"year": 2021, "price": 9.36}))
    # ]))
```

## Import data on the web UI{#import-data-on-the-web-ui}

Once data files are ready, you can import them directly from your local drive or upload them to an object storage bucket, such as AWS S3 or Google Cloud GCS, for data imports.

<Admonition type="info" icon="📘" title="Notes">

For successful data import, ensure that the object storage bucket you use is located in the same cloud as your cluster.

</Admonition>

### Local JSON file{#local-json-file}

To import data, you can either drag and drop a local file into the upload area, or click **upload a file** and select the file.

![import_data_from_local_files](/img/import_data_from_local_files.png)

### Remote files from an object storage bucket{#remote-files-from-an-object-storage-bucket}

To import remote files, you must first upload them to the bucket. You can upload a JSON file or a group of NumPy files to the bucket. Once uploaded, fill in the file path and bucket credentials for Zilliz Cloud to pull data from your bucket.

To import NumPy files in a batch, provide the path to the folder containing all the NumPy files, for example, **/mydata/np/**.

For supported object paths, see [Supported object paths](./import-data-on-web-ui#supported-object-paths).

![import_data_from_object_storage](/img/import_data_from_object_storage.png)

### Supported object paths{#supported-object-paths}

If you are importing data from AWS S3, you can use either S3 URI or object URL. The following are some examples:

- s3://bucket-name/key-name (AWS S3 URI)

- [https://bucket-name.s3.region-code.amazonaws.com/key-name](https://bucket-name.s3.region-code.amazonaws.com/key-name) (AWS Object URL, virtual-hosted–style)

- [https://s3.region-code.amazonaws.com/bucket-name/key-name](https://s3.region-code.amazonaws.com/bucket-name/key-name) (AWS Object URL, path-style)

For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

If you are importing data from Google Cloud Storage (GSC), you can use either authenticated URL, public URL, or gsutilURI. The following are some examples:

- [https://storage.googleapis.com/YOUR_BUCKET_NAME/OBJECT_NAME](https://storage.googleapis.com/YOUR_BUCKET_NAME/OBJECT_NAME) (GSC public URL)

- gs://YOUR_BUCKET_NAME/OBJECT_NAME (GSC gsutilURI)

For more details, see [Share the object](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object).

## Verify the result{#verify-the-result}

After you click **Import**, the process starts, and you can view the import progress in real time.

![data_import_progress](/img/data_import_progress.png)

After the import is complete, you will receive the following information. At this point, you can view job details or start exploring the imported data for what interests you.

![data_import_complete](/img/data_import_complete.png)

## Related topics{#related-topics}

- [Prepare Data Import](./use-bulkwriter-for-data-import)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)
