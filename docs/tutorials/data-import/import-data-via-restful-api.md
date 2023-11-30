---
slug: /docs/import-data-via-restful-api
beta: FALSE
notebook: FALSE
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Import Data via RESTful API

This tutorial guides you through the process of importing data into an existing collection by calling the RESTful API.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have obtained an API key for your cluster. For details, see [Manage API Keys](./manage-api-keys).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset).

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Create Collection](./create-collection).

## Prepare data files{#prepare-data-files}

Zilliz Cloud supports data import from local or remote files in JSON or NumPy formats. If your data is in a different format, convert it using the **BulkWriter** tool. For details, see [Prepare Data Import](./use-bulkwriter-for-data-import).

The following figure demonstrates how to prepare your data in JSON or NumPy formats.

![data_import-preparetion](/img/data_import-preparetion.png)

When preparing data files, consider the following based on the file format:

- **JSON data**
    - Each import supports one JSON file, prohibiting simultaneous multiple JSON file uploads.

    - The JSON file contains a key called "root" at the top level. This key's value is an array of dictionaries, where each dictionary represents an entity that needs to be imported. The keys in each dictionary should match the schema of the target collection.

    - If `autoId` is set to `true` on the primary key, do not include the primary key in the dictionary. Zilliz Cloud will generate the primary keys automatically.

    - If `enable_dynamic_key` is enabled in the collection schema, all dictionary keys that are not defined in the collection schema will be saved as dynamic fields.

- **NumPy data**
    - Allows uploading multiple files at once or organizing these files into a folder for batch uploading.

    - The folder may have up to two subfolders, each subfolder must not exceed 10 GB, and the parent folder's maximum size is 100 GB.

    - For NumPy files, each file represents a column in the target collection of the import and its name should be the same as a field name. Organize the Numpy files that represent all necessary collection fields in a folder before the import.

    - If `autoId` is set to `true` on the primary key, skip preparing the NumPy file for the primary key.

    - If `enable_dynamic_key` is enabled in the collection schema, you should prepare an optional NumPy file named `$meta.npy` to include the values of the fields that are not defined in the collection schema.

- **Folder organization**
    - Ensures data type consistency within the folder, allowing a maximum of two subfolders.

    - In cases where a folder contains:
        - Both JSON and NumPy data or more than two subfolders, an error will occur during data import.

        - NumPy files along with unsupported data types, an error will occur.

    - Example of valid paths:
        - `/dataset/data.json`: Only for the specific JSON file in the dataset folder.

        - `/dataset/*.npy`: Only for all NumPy files in the dataset folder.

        - `/dataset/`: Only if it contains only a JSON file or all necessary NumPy files.

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

## Import data using the RESTful API{#import-data-using-the-restful-api}

To import data, you must first upload them to an object storage bucket, such as AWS S3 or Google Cloud Storage (GCS). Once uploaded, obtain the file path and bucket credentials for Zilliz Cloud to pull data from your bucket. For supported object paths, see [Supported object paths](./import-data-via-restful-api#supported-object-paths).

<Admonition type="info" icon="📘" title="Notes">

For successful data import, ensure that the object storage bucket you use is located in the same cloud as your cluster.

</Admonition>

Once the object path and bucket credentials are obtained, call the API as follows:

```bash
# replace url and token with your own
curl --request POST \\
     --url "<https://controller.api.$>{CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header "accept: application/json" \\
     --header "content-type: application/json" \\
     -d '{
       "clusterId": "${CLUSTER_ID}",
       "collectionName": "medium_articles",
       "objectUrl": "gs://publicdataset-zillizcloud-com/medium_articles_2020.json"
       "accessKey": "your-access-key"
       "secretKey": "your-secret-key"
     }'
```

In the command above, replace `${CLOUD_REGION_ID}`, `${TOKEN}`, and `${CLUSTER_ID}` with your cloud region identifier, API key, and cluster ID, respectively. You can obtain `CLOUD_REGION_ID` and `CLUSTER_ID` from your cluster's public endpoint. For instance, in the public endpoint `https://in03-3bf3c31f4248e22.api.aws-us-east1.zillizcloud.com`, `CLOUD_REGION_ID` is `aws-us-east1` and `CLUSTER_ID` is `in03-3bf3c31f4248e22`. For more information, see [Manage Cluster](./manage-cluster).

Upon executing the request, you will receive a job ID. Use this job ID to monitor the import progress with the following command:

```bash
curl --request GET \\
     --url "<https://controller.api.$>{CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import/get?jobId=${JOBID}&clusterId=${CLUSTERID}" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header "accept: application/json" \\
     --header "content-type: application/json" \\
```

For details, see [Import](/reference/import) and [Get Import Progress](/reference/get-import-progress).

### Supported object paths{#supported-object-paths}

If you are importing data from AWS S3, you can use either S3 URI or object URL. The following are some examples:

- s3://bucket-name/key-name (AWS S3 URI)

- https://bucket-name.s3.region-code.amazonaws.com/key-name (AWS Object URL, virtual-hosted–style)

- https://s3.region-code.amazonaws.com/bucket-name/key-name (AWS Object URL, path-style)

For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

If you are importing data from Google Cloud Storage (GSC), you can use either authenticated URL, public URL, or gsutil URI. The following are some examples:

- https://storage.googleapis.com/YOUR_BUCKET_NAME/OBJECT_NAME (GSC public URL)

- gs://YOUR_BUCKET_NAME/OBJECT_NAME (GSC gsutil URI)

For more details, see [Share the object](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object).

## Verify the result{#verify-the-result}

If the command output is similar as follows, the data is imported successfully:

```bash
{
    "code": 200,
    "data": {
        "jobId": "string"
    }
}
```

You can also go to the Zilliz Cloud console to view the result and job details:

![data_import_complete_restful](/img/data_import_complete_restful.png)

