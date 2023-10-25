---
slug: /import-data-via-restful-api
beta: FALSE
notebook: FALSE
sidebar_position: 3
---



# Import Data via RESTful API

This tutorial guides you through the process of importing data into an existing collection by calling the RESTful API.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have obtained an API key for your cluster. For details, see [Manage API Keys](./manage-api-keys).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Use Customized Schema](./undefined).

## Prepare data files{#prepare-data-files}

Using the RESTful API, you can import data from a single JSON file or multiple NumPy files. If your data is in a different format, you can first convert it using the BulkWriter conversion tool. For details, see [Use BulkWriter for Data Import](./use-bulkwriter-for-data-import).

When preparing data files, note that:

- When importing JSON data, each import only supports one JSON file. This means that you cannot upload multiple JSON files at once.

- For NumPy data, you have the option to upload multiple files at once or organize these files into a folder with no more than two subfolders and upload them in a batch. Note that each subfolder cannot exceed 10 GB in size, and the maximum size for the parent folder is 100 GB.

- When organizing multiple files in a folder, ensure that data types are consistent for all files inside the folder, and that the folder contains no more than two subdirectories. If a folder contains both JSON and NumPy data, or more than two subdirectories, an error will occur during data import. If a folder contains NumPy files and other unsupported data types, Zilliz Cloud will only import the NumPy files and ignore the unsupported files. For example, you can specify a valid path similar to **/dataset1/** or **/dataset2/sub/**.

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

:::info Notes

For successful data import, ensure that the object storage bucket you use is located in the same cloud as your cluster.

:::

Once the object path and bucket credentials are obtained, call the API as follows:

```bash
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

In the preceding code, `${CLOUD_REGION_ID}` represents the identifier of the specific cloud region where your cluster is hosted, `${TOKEN}` is the API key of your cluster used for authorizing the API request, and `${CLUSTER_ID}` is the ID of your cluster. Make sure to replace these placeholders with the corresponding actual values when making the API call. You can obtain `CLOUD_REGION_ID` and `CLUSTER_ID` from the public endpoint of your cluster. For example, in public endpoint [**https://in03-3bf3c31f4248e22.api.gcp-us-west1.zillizcloud.com**](https://in03-3bf3c31f4248e22.api.gcp-us-west1.zillizcloud.com), `CLOUD_REGION_ID` is **gcp-us-west1** and `CLUSTER_ID` is **in03-3bf3c31f4248e22**. For more information, see [Manage Cluster](./manage-cluster).

After submitting the request, you will receive a job ID. To check the progress of the import, use the returned job ID as follows:

```bash
curl --request GET \\
     --url "<https://controller.api.$>{CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import/get?jobId=${JOBID}&clusterId=${CLUSTERID}" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header "accept: application/json" \\
     --header "content-type: application/json" \\
```

For details, see [Import](https://docs.zilliz.com/reference/import) and [Get Import Progress](https://docs.zilliz.com/reference/get-import-progress).

### Supported object paths{#supported-object-paths}

If you are importing data from AWS S3, you can use either S3 URI or object URL. The following are some examples:

- s3://bucket-name/key-name (AWS S3 URI)

- [https://bucket-name.s3.region-code.amazonaws.com/key-name](https://bucket-name.s3.region-code.amazonaws.com/key-name) (AWS Object URL, virtual-hosted–style)

- [https://s3.region-code.amazonaws.com/bucket-name/key-name](https://s3.region-code.amazonaws.com/bucket-name/key-name) (AWS Object URL, path-style)

For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

If you are importing data from Google Cloud Storage (GSC), you can use either authenticated URL, public URL, or gsutil URI. The following are some examples:

- [https://storage.googleapis.com/YOUR_BUCKET_NAME/OBJECT_NAME](https://storage.googleapis.com/YOUR_BUCKET_NAME/OBJECT_NAME) (GSC public URL)

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

