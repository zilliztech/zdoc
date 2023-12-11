---
slug: /import-data-via-sdks
beta: FALSE
notebook: 05_use_local-bulk-writer.ipynb,06_use_remote-bulk-writer.ipynb,07_use_bulk_import.ipynb
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Import Data via SDKs

This guide helps you learn how to use our SDKs to import data into a collection with the bulk-writer and bulk-insert APIs.

## Before you start{#before-you-start}

Ensure that

- You have installed the latest SDKs. For details, refer to [Install SDKs](./install-sdks). Currently, the bulk-writer and bulk-import APIs are available only in the Python SDK.

- You have created a cluster on Zilliz Cloud. For details, refer to [Create Cluster](./create-cluster).

- You have downloaded [the example dataset in CSV format](https://drive.google.com/file/d/12RkoDPAlk-sclXdjeXT6DMFVsQr4612w/view?usp=sharing). To learn more about the dataset, read [the introduction here](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset).

## Procedure{#procedure}

In order to import your data into Zilliz Cloud, utilizing the bulk-writer API to transform your dataset into a suitable format is necessary. Once this step is complete, you can then easily bulk-import the converted dataset by making use of the bulk-import API.

### Converting your data{#converting-your-data}

In this part, you need to call the bulk-writer API to create a RemoteBulkWriter, which allows you to rewrite your dataset to a cloud object storage bucket. For details, refer to [Prepare Data Import](./use-bulkwriter-for-data-import).

1. Fetch the schema of the collection you have already created.

    According to the dataset, the collection schema contains two fields: id and vector. The id field acts as the primary key and increments automatically. The vector field has a dimension of 768. All other fields in the dataset are considered dynamic fields.

    ```python
    from pymilvus import (
        connections,
        FieldSchema, CollectionSchema, DataType,
        Collection,
        utility,
        bulk_import,
        get_import_progress,
        list_import_jobs,
    )
    
    # set up your collection
    
    connections.connect(
      alias='default', 
      #  Public endpoint obtained from Zilliz Cloud
      uri=CLUSTER_ENDPOINT,
      # API key or a colon-separated cluster username and password
      token=TOKEN, 
    )
    
    # Get an existing collection
    collection = Collection("medium_articles_2020")
    
    # Get the schema of the collection
    schema = collection.schema
    ```

1. Make your dataset consumable for the bulk-writer API.

    The example dataset is in CSV format. You can use the Pandas library to process it. The ultimate goal is to generate a list of dictionaries so that you can feed them to BulkWriter in the next step.

    ```python
    import json
    import pandas as pd
    
    # Read the dataset into a data frame
    dataset = pd.read_csv("New_Medium_data.csv")
    
    # To retrieve a row from the dataset, do as follows:
    row = dataset.iloc[0].to_dict()
    row["vector"] = json.loads(row["vector"])
    ```

1. Pass the schema to the RemoteBulkWriter along with other necessary parameters.

    The example below shows the use of an AWS S3 bucket. Use a bucket located on the same cloud as your Zilliz Cloud cluster.

    ```python
    from pymilvus import RemoteBulkWriter
    
    # To connect to AWS S3
    # For details on creating IAM keys, refer to 
    # https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey
    
    connect_param = RemoteBulkWriter.ConnectParam(
        endpoint="s3.amazonaws.com",
        access_key=IAM_ACCESS_KEY,
        secret_key=IAM_SECRET_KEY,
        bucket_name=YOUR_BUCKET_NAME,
    )
    
    # To connect to Google Cloud Storage
    # For details on creating HMAC keys, refer to 
    # https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create
    #
    # connect_param = RemoteBulkWriter.ConnectParam(
    #     endpoint="storage.googleapis.com",
    #     access_key=HMAC_ACCESS_KEY,
    #     secret_key=HMAC_SECRET_KEY,
    #     bucket_name=YOUR_BUCKET_NAME,
    # )
    
    # Instantiate a writer
    writer = RemoteBulkWriter(
        schema=schema, # Schema of the target collection
        remote_path="bulk_data", # Remote output folder relative to the root of the specified bucket
        connect_param=connect_param, # Bucket connection
    )
    
    # Feed data rows to the writer
    for i in range(len(dataset)):
        try:
            row = dataset.iloc[i].to_dict()
            row["vector"] = json.loads(row["vector"])
            writer.append_row(row)
        except Exception as e:
            print(e)
            break;
    
    writer.commit()
    print(writer.data_path)
    
    # Output
    # A path relative to the designated bucket
    # /bulk_data/8f808cdc-ce4d-4aed-89b9-2f343d44b2e0
    ```

1. Check the result.

    The following example demonstrates how to use MinIO’s Python client to verify the generated files in a specified storage bucket. Feel free to use any other methods to perform the check.

    ```python
    from minio import Minio
    
    minio_client = Minio(
        endpoint="s3.amazonaws.com",
        access_key=IAM_ACCESS_KEY,
        secret_key=IAM_SECRET_KEY,
        secure=True,
    )
    
    found = minio_client.bucket_exists(YOUR_BUCKET_NAME)
    
    if found:
        objects = minio_client.list_objects(YOUR_BUCKET_NAME, prefix=str(remote_path)[1:], recursive=True)
        files = [ x.object_name for x in objects ]
    
    # Output
    # [
    #    'bulk_data/08a92d25-c703-4694-bfaa-5be4e8d0f6f9/1/vector.npy'
    #    'bulk_data/08a92d25-c703-4694-bfaa-5be4e8d0f6f9/1/$meta.npy'
    # ]
    ```

### Bulk-inserting data{#bulk-inserting-data}

As an alternative to the RESTful API, you can use its Python wrapper, PyMilvus’ bulk-import API.

1. Import the bulk-import APIs.

    ```python
    import time
    from pymilvus import (
        bulk_import,
        get_import_progress,
        list_import_jobs,
    )
    ```

1. Start a bulk-import task.

    You can get the ID of the bulk-import task from the return. In the `bulk_import` request, you should use your API Key instead of the cluster credentials. To get an API key, refer to [Manage API Keys](./manage-api-keys).

    ```python
    resp = bulk_import(
        url=CLOUD_PLATFORM_ENDPOINT, # Cluster endpoint
        api_key=API_KEY, # Your Zilliz Cloud API Key
        object_url=OBJECT_URL, # Your object storage url
        access_key=MINIO_ACCESS_KEY, # Your object storage access key
        secret_key=MINIO_SECRET_KEY, # Your object storage secret key
        cluster_id=CLUSTER_ID, # Your cluster ID
        collection_name=COLLECTION_NAME # Your collection name
    )
    
    print(resp.json())
    
    # Output
    # {
    #     'code': 200, 
    #     'data': {
    #         'jobId': '84e3f533-0c13-4823-a3f0-db4e62dac2a6'
    #      }
    # }
    ```

1. Get the import progress.

    ```python
    job_id = resp.json()['data']['jobId']
    resp = get_import_progress(
        url=CLOUD_PLATFORM_ENDPOINT,
        api_key=API_KEY,
        job_id=JOB_ID,
        cluster_id=INSTANCE_ID
    )
    
    # Send request until the bulk-import progress ends.
    while resp.json()["data"]["readyPercentage"] < 1:
        time.sleep(5)
        print(resp.json())
    
        resp = get_import_progress(
            url=CLOUD_PLATFORM_ENDPOINT,
            api_key=API_KEY,
            job_id=JOB_ID,
            cluster_id=INSTANCE_ID
        )
    
    # Output
    # {
    #     'code': 200, 
    #     'data': {
    #         'collectionName': 'medium_articles', 
    #         'fileName': 'medium_articles/293dbffc-465e-4ce1-b25b-a692c9b77dd8/1/', 
    #         'fileSize': 28340716, 
    #         'readyPercentage': 0, # Watch this for the progress
    #         'completeTime': None, 
    #         'errorMessage': None, 
    #         'jobId': '84e3f533-0c13-4823-a3f0-db4e62dac2a6', 
    #         'details': [
    #              {
    #                  'fileName': 'medium_articles/293dbffc-465e-4ce1-b25b-a692c9b77dd8/1/', 
    #                  'fileSize': 28340716, 
    #                  'readyPercentage': 0, 
    #                  'completeTime': None, 
    #                  'errorMessage': None
    #              }
    #          ]
    #    }
    # }
    ```

    If you also want to know about all bulk-import tasks, you can call the list-import-jobs API as follows:

    ```python
    resp = list_import_jobs(
        url=CLOUD_PLATFORM_ENDPOINT,
        api_key=API_KEY,
        cluster_id=CLUSTER_ID,
        page_size=10,
        current_page=1,
    )
    
    # Output
    # {
    #     "code": 200,
    #     "data": {
    #         "tasks": [
    #             {
    #                 "collectionName": "medium_articles",
    #                 "jobId": "26f90492-f4df-4e20-81ab-a602be653baa",
    #                 "state": "ImportCompleted"
    #             },
    #             ...
    #             {
    #                 "collectionName": "medium_articles",
    #                 "jobId": "d84f5ebc-a485-4058-83fd-2cced63e3bd8",
    #                 "state": "ImportCompleted"
    #             },
    #             {
    #                 "collectionName": "medium_articles",
    #                 "jobId": "d8238794-0d1b-48a2-b435-c90d3f52278c",
    #                 "state": "ImportCompleted"
    #             }
    #         ],
    #         "count": 6,
    #         "currentPage": 1,
    #         "pageSize": 10
    #     }
    # }
    ```

## Related topics{#related-topics}

- [Import Data on Web UI](./import-data-on-web-ui)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Prepare Data Import](./use-bulkwriter-for-data-import)

