---
slug: /import-data-on-web-ui
beta: FALSE
notebook: FALSE
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Import Data on Web UI

This tutorial guides you through the process of importing data into an existing collection on the Zilliz Cloud web UI.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have created a cluster. For details, see [Create Cluster](./create-cluster).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset).

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Create Collection](./create-collection).

## Prepare data files{#prepare-data-files}

Zilliz Cloud supports data import from local or remote files in JSON or NumPy formats. If your data is in a different format, convert it using the **BulkWriter** tool. For details, see [Prepare Data Import](./use-bulkwriter-for-data-import).

The [example dataset](./example-dataset) used in this tutorial is a row-based JSON file that can be directly [imported locally](./import-data-on-web-ui#local-json-file).

The following figure demonstrates how to prepare your data in JSON or NumPy formats.

![data_import-preparetion_en](/img/data_import-preparetion_en.png)

### Local JSON file{#local-json-file}

- Each import operation supports a single JSON file.

- Maximum file size: 512 MB for serverless clusters, 1 GB for dedicated clusters. For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

- The JSON file must include a top-level key named "rows". The value of this key should be an array of dictionaries, with each dictionary representing an entity to import. The keys in each dictionary should align with the schema of the target collection.

- If `autoId` is set to `true` for the primary key, exclude the primary key from the dictionary. Zilliz Cloud will automatically generate the primary keys.

- If `enable_dynamic_field` is set to `true` in the collection schema, any dictionary keys not defined in the collection schema will be stored as key-value pairs in the same magic field `$meta`. You can retrieve them as schema-defined fields during searches and queries.

### Remote files{#remote-files}

When importing data from remote files, consider the following based on the file format:

- **JSON data**

    - Each import operation supports a single JSON file, preventing simultaneous uploads of multiple JSON files.

    - The JSON file must include a top-level key named "rows." The value of this key should be an array of dictionaries, with each dictionary representing an entity to import. The keys within each dictionary should align with the schema of the target collection.

    - When the `autoId` is set to `true` for the primary key, exclude the primary key from the dictionary. Zilliz Cloud will automatically generate the primary keys.

    - If the `enable_dynamic_field` is set to `true` in the collection schema, any dictionary keys not defined in the schema will be stored as key-value pairs in the same magic field `$meta`. You can retrieve these fields as schema-defined ones during searches and queries.

- **NumPy data**

    - Allows the upload of multiple files simultaneously or the organization of these files into a folder for batch uploading.

    - The folder structure can have up to one level of subfolders, with each subfolder not exceeding 10 GB, and the parent folder's maximum size at 100 GB.

    - For NumPy files, each file signifies a column in the target collection during import, and its name should match a field name. Organize Numpy files representing all necessary collection fields in a folder before initiating the import.

    - If `autoId` is set to `true` on the primary key, exclude the preparation of the NumPy file for the primary key.

    - If `enable_dynamic_field` is set to `true` in the collection schema, consider preparing an optional NumPy file named `$meta.npy` to include values for necessary fields not defined in the collection schema. You can retrieve these fields as schema-defined fields in searches and queries.

- **Folder organization**

    - The data folder permits a maximum of one level of subfolders. Ensure that the data folder contains only one file type.

    - An error will occur during the data import when:

        - The specified folder contains both JSON and NumPy data or more than one level of subfolders.

        - The folder contains NumPy files along with unsupported data types.

    - Examples of valid paths:

        - `/dataset/data.json` or `/dataset/subfolder/data.json`

            This applies to the specific JSON file in the dataset folder.

        - `/dataset/*.npy` or `/dataset/subfolder/*.npy`

            This applies to all NumPy files in the dataset folder.

        - `/dataset/` or `/dataset/subfolder/`

            This applies if it contains only a JSON file or all necessary NumPy files.

To convert the example dataset into multiple NumPy files, use the following code. [This article](https://milvus.io/docs/bulk_insert.md#Create-NumPy-files) provides more detailed scripts to generate NumPy files for each valid data type Milvus supports.

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

- https://bucket-name.s3.region-code.amazonaws.com/key-name (AWS Object URL, virtual-hosted–style)

- https://s3.region-code.amazonaws.com/bucket-name/key-name (AWS Object URL, path-style)

For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

If you are importing data from Google Cloud Storage (GSC), you can use either authenticated URL, public URL, or gsutilURI. The following are some examples:

- https://storage.googleapis.com/YOUR_BUCKET_NAME/OBJECT_NAME (GSC public URL)

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

