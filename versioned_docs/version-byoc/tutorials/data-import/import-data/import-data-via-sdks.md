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

- You have installed the dependencies, including PyMilvus and MinIO Python Client. For details, refer to [Install SDKs](./install-sdks).

- You have prepared the example dataset. For details, refer to [Prepare Data Import](./use-bulkwriter-for-data-import).

- You have created an output folder for the storage of the BulkWriter output.

## Procedure{#procedure}

In order to import your data into Zilliz Cloud, utilizing the bulk-writer API to transform your dataset into a suitable format is necessary. Once this step is complete, you can then easily bulk-import the converted dataset by making use of the bulk-import API.

### Import dependencies{#import-dependencies}

Before anything else, import the required dependencies.

```python
from urllib.parse import urlparse
import time, json

from minio import Minio

from pymilvus import (
    connections,
    FieldSchema, CollectionSchema, DataType,
    Collection,
    utility,
    bulk_import,
    get_import_progress,
    list_import_jobs,
)

# Check the prepared data files you have

ACCESS_KEY = "YOUR_OBJECT_STORAGE_ACCESS_KEY"
SECRET_KEY = "YOUR_OBJECT_STORAGE_SECRET_KEY"
BUCKET_NAME = "YOUR_OBJECT_STORAGE_BUCKET_NAME"
REMOTE_PATH = "DATA_FILES_PATH_IN_BLOCK_STORAGE"
```

### Check prepare data{#check-prepare-data}

Once you have prepared your data using a LocalBulkWriter and upload the generated file to your object storage, or prepared your data using a RemoteBulkWriter and got the path to the remote folder. You are ready to import them to a Zilliz Cloud collection.

To check whether they are ready, do as follows:

```python
client = Minio(
    endpoint="storage.googleapis.com", # use 's3.amazonaws.com' for GCS
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    secure=True)

objects = client.list_objects(
    bucket_name=BUCKET_NAME,
    prefix=REMOTE_PATH,
    recursive=True
)

print([obj.object_name for obj in objects])

# Output
#
# [
#     "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/claps.npy",
#     "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/id.npy",
#     "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/link.npy",
#     "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/publication.npy",
#     "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/reading_time.npy",
#     "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/responses.npy",
#     "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/title.npy",
#     "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/vector.npy"
# ]

```

### Create collection and import data{#create-collection-and-import-data}

Once your data files are ready, connect to a Zilliz Cloud cluster, create a collection out of the schema, and import the data from the files in the storage bucket.

Since Zilliz Cloud does not allow cross-cloud data transmission, you need to create your cluster on the same public cloud that houses your prepared dataset.

```python
# set up your collection

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
CLUSTER_TOKEN = "YOUR_CLUSTER_TOKEN"
COLLECTION_NAME = "medium_articles"
API_KEY = "YOUR_CLUSTER_TOKEN"
CLUSTER_ID = urlparse(CLUSTER_ENDPOINT).netloc.split(".")[0] if urlparse(CLUSTER_ENDPOINT).netloc.startswith("in") else None
CLOUD_REGION = [ x for x in urlparse(CLUSTER_ENDPOINT).netloc.split(".") if x.startswith("gcp") or x.startswith("aws") or x.startswith("ali")][0] if urlparse(CLUSTER_ENDPOINT).netloc.startswith("in") else None

if CLOUD_REGION is None:
    raise Exception("Invalid cluster endpoint")
elif CLOUD_REGION.startswith("gcp"):
    OBJECT_URL = f"gs://{BUCKET_NAME}/{REMOTE_PATH}/"
elif CLOUD_REGION.startswith("aws"):
    OBJECT_URL = f"s3://{BUCKET_NAME}/{REMOTE_PATH}/"
elif CLOUD_REGION.startswith("ali"):
    OBJECT_URL = f"oss://{BUCKET_NAME}/{REMOTE_PATH}/"

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="reading_time", dtype=DataType.INT64),
    FieldSchema(name="publication", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="claps", dtype=DataType.INT64),
    FieldSchema(name="responses", dtype=DataType.INT64)
]

schema = CollectionSchema(fields)

connections.connect(
    uri=CLUSTER_ENDPOINT,
    token=CLUSTER_TOKEN,
    secure=True
)

collection = Collection(COLLECTION_NAME, schema)

collection.create_index(
    field_name="vector",
    index_params={
        "index_type": "AUTOINDEX",
        "metric_type": "L2"
    }
)

collection.load()

# bulk-import your data from the prepared data files

res = bulk_import(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    object_url=OBJECT_URL,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    cluster_id=CLUSTER_ID,
    collection_name=COLLECTION_NAME
)

print(res.json())

# Output
#
# {
#     "code": 200,
#     "data": {
#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a"
#     }
# }
```

### Check bulk import progress{#check-bulk-import-progress}

You can check the progress of a specified bulk-import job.

```python
job_id = res.json()['data']['jobId']
res = get_import_progress(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    job_id=job_id,
    cluster_id=CLUSTER_ID
)

# check the bulk-import progress

while res.json()["data"]["readyPercentage"] < 1:
    time.sleep(5)

    res = get_import_progress(
        url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
        api_key=API_KEY,
        job_id=job_id,
        cluster_id=CLUSTER_ID
    )

print(res.json())

# Output
#
# {
#     "code": 200,
#     "data": {
#         "collectionName": "medium_articles",
#         "fileName": "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/",
#         "fileSize": 26571700,
#         "readyPercentage": 1,
#         "completeTime": "2023-10-28T06:51:49Z",
#         "errorMessage": null,
#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a",
#         "details": [
#             {
#                 "fileName": "DATA_FILES_PATH_IN_BLOCK_STORAGE/1/",
#                 "fileSize": 26571700,
#                 "readyPercentage": 1,
#                 "completeTime": "2023-10-28T06:51:49Z",
#                 "errorMessage": null
#             }
#         ]
#     }
# }
```

### List all bulk-import jobs{#list-all-bulk-import-jobs}

If you also want to know about all bulk-import tasks, you can call the list-import-jobs API as follows:

```python
# list bulk-import jobs

res = list_import_jobs(
    url=f"controller.api.{CLOUD_REGION}.zillizcloud.com",
    api_key=API_KEY,
    cluster_id=CLUSTER_ID,
    page_size=10,
    current_page=1,
)

print(res.json())

# Output
#
# {
#     "code": 200,
#     "data": {
#         "tasks": [
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "53632e6c-c078-4476-b840-10c4793d9c08",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "95e7d4c4-cf60-4ce1-ac49-145459ee0f99",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "ddca617e-8f2f-4612-9d6a-12b6edb69833",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "medium_articles",
#                 "jobId": "79fb0137-9e28-48e0-b7b1-e96706bb921f",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "YOUR_COLLECTION_NAME",
#                 "jobId": "dd391fed-822f-4e17-b5a7-8a43d49f1eb7",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "YOUR_COLLECTION_NAME",
#                 "jobId": "cf11ac48-2e1e-47d3-ab88-0e38736d9629",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "YOUR_COLLECTION_NAME",
#                 "jobId": "3fe83873-6154-4d99-aa40-4328bd724a65",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "YOUR_COLLECTION_NAME",
#                 "jobId": "9d6cd64d-cfe3-46fd-9864-b417226324e8",
#                 "state": "ImportCompleted"
#             },
#             {
#                 "collectionName": "YOUR_COLLECTION_NAME",
#                 "jobId": "aa6c0712-83a1-4729-96a3-f87b0c8b4a00",
#                 "state": "ImportCompleted"
#             }
#         ],
#         "count": 15,
#         "currentPage": 1,
#         "pageSize": 10
#     }
# }
```

## Related topics{#related-topics}

- [Import Data on Web UI](./import-data-on-web-ui)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Prepare Data Import](./use-bulkwriter-for-data-import)

