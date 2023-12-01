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

![data_import-preparetion_en](/img/data_import-preparetion_en.png)

When preparing data files, consider the following based on the file format:

- **JSON data**
    - Each import operation supports a single JSON file, preventing simultaneous uploads of multiple JSON files.

    - The JSON file must include a top-level key named "rows." The value of this key should be an array of dictionaries, with each dictionary representing an entity to import. The keys within each dictionary should align with the schema of the target collection.

    - When the `autoId` is set to `true` for the primary key, exclude the primary key from the dictionary. Zilliz Cloud will automatically generate the primary keys.

    - If the `enable_dynamic_field` is set to `true` in the collection schema, any dictionary keys not defined in the schema will be stored as key-value pairs in the same magic field `$meta`. You can retrieve these fields as schema-defined ones during searches and queries.

- **NumPy data**
    - Allows the upload of multiple files simultaneously or the organization of these files into a folder for batch uploading.

    - The folder structure can have up to one level of subfolders, with each subfolder not exceeding 10 GB and the parent folder's maximum size set at 100 GB.

    - For NumPy files, each file signifies a column in the target collection during import, and its name should match a field name. Organize NumPy files representing all necessary collection fields in a folder before initiating the import.

    - If `autoId` is set to `true` for the primary key, exclude the preparation of the NumPy file for the primary key.

    - If `enable_dynamic_field` is set to `true` in the collection schema, consider preparing an optional NumPy file named $meta.npy to include values for fields not defined in the collection schema if needed. You can retrieve these fields as schema-defined ones during searches and queries.

- **Folder organization**
    - The data folder permits a maximum of one level of subfolders. Ensure that the data folder contains only one file type.

    - An error will occur during the data import when
        - The specified folder contains both JSON and NumPy data or more than one level of subfolders, or

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

