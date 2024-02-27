---
slug: /import-data-via-sdks
beta: FALSE
notebook: 05_use_local-bulk-writer.ipynb,06_use_remote-bulk-writer.ipynb,07_use_bulk_import.ipynb
type: origin
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Import Data (SDK)

This guide helps you learn how to use our SDKs to import data into a collection with the bulk-writer and bulk-import APIs.

Alternatively, you can also refer to [our fast-track end-to-end course](./data-import-zero-to-hero) which covers both data preparations and data import to Zilliz Cloud collections.

## Install dependencies{#install-dependencies}

Run the following command in your terminal to install __pymilvus__ and __minio__ or upgrade them to the latest version.

```shell
python3 -m pip install --upgrade pymilvus minio
```

## Check prepared data{#check-prepared-data}

Once you have prepared your data using [the BulkWriter tool](./use-bulkwriter) and got the path to the prepared files. You are ready to import them to a Zilliz Cloud collection.

To check whether they are ready, do as follows:

```python
from minio import Minio

# Third-party constants
YOUR_ACCESS_KEY = "YOUR_ACCESS_KEY"
YOUR_SECRET_KEY = "YOUR_SECRET_KEY"
YOUR_BUCKET_NAME = "YOUR_BUCKET_NAME"
YOUR_REMOTE_PATH = "YOUR_REMOTE_PATH"

client = Minio(
    endpoint="storage.googleapis.com", # use 's3.amazonaws.com' for AWS S3
    access_key=YOUR_ACCESS_KEY,
    secret_key=YOUR_SECRET_KEY,
    secure=True
)

objects = client.list_objects(
    bucket_name=YOUR_BUCKET_NAME,
    prefix=YOUR_REMOTE_PATH,
    recursive=True
)

print([obj.object_name for obj in objects])

# Output
#
# [
#     "folder/1/claps.npy",
#     "folder/1/id.npy",
#     "folder/1/link.npy",
#     "folder/1/publication.npy",
#     "folder/1/reading_time.npy",
#     "folder/1/responses.npy",
#     "folder/1/title.npy",
#     "folder/1/vector.npy"
# ]

```

## Create collection{#create-collection}

Once your data files are ready, connect to a Zilliz Cloud cluster, create a collection out of the schema, and import the data from the files in the storage bucket.

For details on required information, refer to [On Zilliz Cloud Console](./on-zilliz-cloud-console).

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud does not allow cross-cloud data transmission. You must create your cluster on the same public cloud that houses your prepared dataset. </p>

</Admonition>

```python
from pymilvus import MilvusClient, DataType

# set up your collection

## Zilliz Cloud constants
CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
CLUSTER_TOKEN = "YOUR_CLUSTER_TOKEN"
COLLECTION_NAME = "medium_articles"
API_KEY = "YOUR_CLUSTER_TOKEN"
CLUSTER_ID = "YOUR_CLUSTER_ID"

## Third-party constants
YOUR_OBJECT_URL = "YOUR_OBJECT_URL"

# create a milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=CLUSTER_TOKEN
)

# prepare schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_schema=False
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="link", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="reading_time", datatype=DataType.INT64)
schema.add_field(field_name="publication", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="claps", datatype=DataType.INT64)
schema.add_field(field_name="responses", datatype=DataType.INT64)

# prepare index parameters
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    metric_type="L2"
)

client.create_collection(
    collection_name="customized_setup",
    schema=schema,
    index_params=index_params
)
```

## Import data{#import-data}

Once your data and collection are ready, you can start the import process as follows:

```python
from pymilvus import bulk_import

# Bulk-import your data from the prepared data files

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

### Check import progress{#check-import-progress}

You can check the progress of a specified bulk-import job.

```python
from pymilvus import get_import_progress

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
#         "fileName": "folder/1/",
#         "fileSize": 26571700,
#         "readyPercentage": 1,
#         "completeTime": "2023-10-28T06:51:49Z",
#         "errorMessage": null,
#         "jobId": "9d0bc230-6b99-4739-a872-0b91cfe2515a",
#         "details": [
#             {
#                 "fileName": "folder/1/",
#                 "fileSize": 26571700,
#                 "readyPercentage": 1,
#                 "completeTime": "2023-10-28T06:51:49Z",
#                 "errorMessage": null
#             }
#         ]
#     }
# }
```

### List all import jobs{#list-all-import-jobs}

If you also want to know about all bulk-import tasks, you can call the list-import-jobs API as follows:

```python
from pymilvus import list_import_jobs

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
#         ],
#         "count": 2,
#         "currentPage": 1,
#         "pageSize": 10
#     }
# }
```

## Related topics{#related-topics}

- [Import Data on Web UI](./import-data-on-web-ui)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Prepare Source Data](./prepare-source-data)

- [Data Import from Zero to Hero](./data-import-zero-to-hero) 

