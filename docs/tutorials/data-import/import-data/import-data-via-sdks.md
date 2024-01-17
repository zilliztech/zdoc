---
slug: /import-data-via-sdks
beta: FALSE
notebook: 05_use_local-bulk-writer.ipynb,06_use_remote-bulk-writer.ipynb,07_use_bulk_import.ipynb
token: MvgAwL4HIiuRRJkH0FwcJhxSnld
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Import Data (SDK)

This guide helps you learn how to use our SDKs to import data into a collection with the bulk-writer and bulk-insert APIs.

Alternatively, you can also refer to [our fast-track end-to-end course](./data-import-zero-to-hero) which covers both data preparations and data import to Zilliz Cloud collections.

## Install dependencies{#install-dependencies}

Run the following command in your terminal to install **pymilvus** and **minio** or upgrade them to the latest version.

```shell
python3 -m pip install --upgrade pymilvus minio
```

## Check prepared data{#check-prepared-data}

Once you have prepared your data using [the BulkWriter tool](./use-bulkwriter) and got the path to the prepared files. You are ready to import them to a Zilliz Cloud collection.

To check whether they are ready, do as follows:

```python
from minio import Minio

ACCESS_KEY = "YOUR_ACCESS_KEY"
SECRET_KEY = "YOUR_SECRET_KEY"
BUCKET_NAME = "YOUR_BUCKET_NAME"
REMOTE_PATH = "YOUR_REMOTE_PATH"

client = Minio(
    endpoint="storage.googleapis.com", # use 's3.amazonaws.com' for AWS S3
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    secure=True
)

objects = client.list_objects(
    bucket_name=BUCKET_NAME,
    prefix=REMOTE_PATH,
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

Zilliz Cloud does not allow cross-cloud data transmission. You must create your cluster on the same public cloud that houses your prepared dataset. 

</Admonition>

```python
# set up your collection
CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
CLUSTER_TOKEN = "YOUR_CLUSTER_TOKEN"
COLLECTION_NAME = "medium_articles"
API_KEY = "YOUR_CLUSTER_TOKEN"
CLUSTER_ID = "YOUR_CLUSTER_ID"
CLOUD_REGION = "YOUR_CLOUD_REGION"

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
```

## Import data{#import-data}

Once your data and collection are ready, you can start the import process as follows:

```python
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

