---
slug: /data-import-zero-to-hero
beta: FALSE
notebook: 99_data_import_zero_to_hero.ipynb
token: BjHZwBkk0iFScik49QMc1Wwjndb
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Data Import from Zero to Hero

This is a fast-track course to help you quickly start importing data on Zilliz Cloud, from data preparation and collection setup to the actual data import process.

## Install dependencies{#install-dependencies}

Run the following command in your terminal to install **pymilvus** and **minio** or upgrade them to the latest version.

```shell
python3 -m pip install --upgrade pymilvus minio
```

## Download example dataset{#download-example-dataset}

Run the following command in your terminal to download the example CSV file.

```shell
curl https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.csv \
        --output medium_articles_2020_dpr.csv
```

The output is similar to the following. If you prefer to download from the browser, [click here](https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.csv).

```python
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
 70 59.8M   70 42.0M    0     0   478k      0  0:02:08  0:01:30  0:00:38  544k
```

 The following table lists the data structure of the data and the values in the first row.

|  **Field Name** |  **Type**     |  **Attributes**  |  **Sample Value**                                  |
| --------------- | ------------- | ---------------- | -------------------------------------------------- |
|  id             |  INT64        |  N/A             |  0                                                 |
|  title_vector   |  FLOAT_VECTOR |  Dimension: 768  |  The Reported Mortality Rate of Coronavirus Is ... |
|  title          |  VARCHAR      |  Max length: 512 |  [0.041732933, 0.013779674, -0.027564144, -0.01... |
|  link           |  VARCHAR      |  Max length: 512 |  https://medium.com/swlh/the-reported-mortality... |
|  reading_time   |  INT64        |  N/A             |  13                                                |
|  publication    |  VARCHAR      |  Max length: 512 |  The Startup                                       |
|  claps          |  INT64        |  N/A             |  1100                                              |
|  responses      |  INT64        |  N/A             |  18                                                |

The example dataset comprises details of over 5,000 articles from medium.com.   Learn about this dataset from its [introduction page on Kaggle](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset). 

## Set up target collection{#set-up-target-collection}

From the output above, we can sum up a schema for our target collection.

For demonstration purposes, we will include the first four fields in the pre-defined schema and use the other four as dynamic fields.

```python
from pymilvus import FieldSchema, CollectionSchema, DataType

schema = CollectionSchema(
    fields=[
        FieldSchema(name='id', dtype=DataType.INT64, is_primary=True),
        FieldSchema(name='title_vector', dtype=DataType.FLOAT_VECTOR, dim=768),
        FieldSchema(name='title', dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name='link', dtype=DataType.VARCHAR, max_length=512),
    ],
    description="A series of articles from medium.com",
    auto_id=False,
    enable_dynamic_field=True
)
```

The parameters in the above code are described as follows: 

- `fields`:

    - `id` is the primary field.

    - `title_vector` is a vector field that holds 768-dimensional vector embeddings.

    - `title` and `link` are two scalar fields.

- `auto_id=False`

    This is the default value. Setting this to **True** prevents **BulkWriter** from including the primary field in generated files. 

- `enable_dynamic_field=True`

    The value defaults to **False**. Setting this to **True** allows **BulkWriter** to include undefined fields and their values from the generated files as key-value pairs and place them in a reserved JSON field named **$meta**. 

Once the schema is set, you can create the target collection as follows:

```python
from pymilvus import connections, Collection

# 1. Set up a connection
connections.connect(
        uri="Your-Cluster-Endpoint",
        token="Your-Token"
)

# 2. Create collection
collection = Collection(name="medium_aritlces", schema=schema)

# 3. Set index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {}
}

# 4. Create index
collection.create_index(
        field_name="title_vector",
        index_params=index_params,
)

# 5. Load the collection
collection.load()
```

For details on collection settings, refer to Manage Collections (SDK).

## Prepare source data{#prepare-source-data}

**BulkWriter** can rewrite your dataset into JSON, Parquet, or NumPy files. We will create a **RemoteBulkWriter** and use it to rewrite your data into these formats.

### Create RemoteBulkWriter{#create-remotebulkwriter}

Once the schema is ready, you can use it to create a **RemoteBulkWriter**. A **RemoteBulkWriter** asks for permission to access a remote bucket. You should set up connection parameters for the access to the remote bucket in a **ConnectParam** object and reference it in the **RemoteBulkWriter**.

```python
from pymilvus import RemoteBulkWriter, BulkFileType

# Connections parameters to access the remote bucket
conn = RemoteBulkWriter.ConnectParam(
    endpoint="storage.googleapis.com", # s3.amazonaws.com for AWS S3
    access_key="Your-Access-Key",
    secret_key="Your-Secret-key",
    bucket_name="Your-Bucket-Name", # Use a bucket hosted in the same cloud as the target cluster
    secure=True
)

writer = RemoteBulkWriter(
    schema=schema, # Target collection schema
    remote_path="/", # Output directory relative to the remote bucket root
    segment_size=512*1024*1024, # Maximum size of a segment in the raw data
    connect_param=conn, # Connection parameters defined above
    file_type=BulkFileType.PARQUET # Type of the generated file
)
```

<Admonition type="info" icon="📘" title="Notes">

The **endpoint** parameter determines the location of the generated files. Ensure that you are using the same cloud providers for both the source data and target collection.

For applicable endpoints, refer to [Prepare Data Import](./prepare-source-data).

</Admonition>

The above writer generates files in Parquet format and uploads them to the root folder of the specified bucket.

- `remote_path="/"`

    This determines the output path of the generated files in the remote bucket. 

    Setting it to `"/"` makes the **RemoteBulkWriter** place the generated files in the root folder of the remote bucket. To use other paths, set it to a path relative to the remote bucket root.

- `file_type=BulkFileType.PARQUET`

    This determines the type of generated files. Possible values are as follows:

    - **BulkFileType.JSON_RB**

    - **BulkFileType.PARQUET**

    - **BulkFileType.NPY**

- `segment_size=512*1024*1024`

    This determines whether **BulkWriter** segments the generated files. The value defaults to 512 MB (512 * 1024 * 1024). If your dataset contains a large number of records, you are advised to segment your data by setting **segment_size** to a proper value.

### Use the writer{#use-the-writer}

A writer has two methods: one is for appending rows from the source dataset, and the other is for committing data to remote files.

You can append rows from the source dataset as follows:

```python
import pandas as pd

df = pd.read_csv("path/to/medium_articles_2020_dpr.csv")

for i in range(len(df)):
    row = df.iloc[i].to_dict()
    row["title_vector"] = [float(x) for x in row["title_vector"][1:-1].split(",")]
    writer.append_row(row)
```

The **append_row()** method of the writer accepts a row dictionary. 

A row dictionary should contain all schema-defined fields as keys. If dynamic fields are allowed, it can also include undefined fields. For details, refer to [Use BulkWriter](./use-bulkwriter#dynamic-schema-support).

**BulkWriter** generates files only after you call its **commit()** method.

```python
writer.commit()
```

Till now, **BulkWriter** has prepared the source data for you in the specified remote bucket.

To check the generated files, you can get the actual output path by printing the **data_path** property of the writer.

```python
print(writer.data_path)

# RemoteBulkWriter
# PosixPath('/5868ba87-743e-4d9e-8fa6-e07b39229425')
```

<Admonition type="info" icon="📘" title="Notes">

**BulkWriter** generates a UUID, creates a sub-folder using the UUID in the provided output directory, and places all generated files in the sub-folder.

</Admonition>

For details, refer to [Use BulkWriter](./use-bulkwriter#verify-the-result).

## Import prepared data{#import-prepared-data}

Before this step, ensure that the source data and target collection are hosted by the same cloud provider.

### Check prepared data{#check-prepared-data}

In this course, we are using MinIO's Python Client to connect to our remote bucket. This client applies to AWS-S3-compatible object storage services, such as AWS S3, Google GCS, and Azure Blob Storage.

```python
from minio import Minio

# Create a MinIO client
client = Minio(
    endpoint="storage.googleapis.com",
    access_key="Your-Access-Key",
    secret_key="Your-Secret-key",
    secure=True)

# Set up the object prefix for object filtering    
prefix = str(writer.data_path)[1:]

# List objects
objects = client.list_objects(
    bucket_name="Your-Bucket-Name",
    prefix=prefix,
    recursive=True
)

[obj.object_name for obj in objects]

# [
#     5868ba87-743e-4d9e-8fa6-e07b39229425/1.parquet
# ]
```

### Start importing{#start-importing}

To import the prepared source data, you need to call the **bulk_import()** function as follows:

```python
from pymilvus import bulk_import

object_url = f"gs://docs-demo/{str(writer.data_path)[1:]}/"

cloud_region = "gcp-us-west1" # Change this to your cloud region.

res = bulk_import(
    url=f"controller.api.{cloud_region}.zillizcloud.com",
    api_key="Zilliz-Cloud-API-Key",
    object_url="Object-Url",
    access_key="Your-Access-Key",
    secret_key="Your-Secret-key",
    cluster_id="Cluster-Id",
    collection_name="Collection-Name",
)

print(res.json())

# {'code': 200, 'data': {'jobId': '0f7fe853-d93e-4681-99f2-4719c63585cc'}}
```

<Admonition type="info" icon="📘" title="Notes">

- The **object_url** should be a valid URL to an object in the remote bucket. 

    If the data and target collection are hosted by Google Cloud, the object URL should be in the format `gs://remote-bucket/${writer.data_path}`.  For applicable URI to prefix the data path returned by the writer, please refer to [Prepare Source Data](./prepare-source-data).

- To determine the values of parameters **url,**  **api_key**, **cluster_id**, and **collection_name**, refer to [On Zilliz Cloud Console](./on-zilliz-cloud-console).

</Admonition>

### Check task progress{#check-task-progress}

The following code checks the bulk-import progress every 5 seconds and outputs the progress in percentage. 

```python
import time
from pymilvus import get_import_progress

job_id = res.json()['data']['jobId']

res = get_import_progress(
    url=f"controller.api.{cloud_region}.zillizcloud.com",
    api_key="Your-Access-Key",
    job_id=job_id,
    cluster_id="Cluster-Id"
)

# check the bulk-import progress
while res.json()["data"]["readyPercentage"] < 1:
    time.sleep(5)

    res = get_import_progress(
        url=f"controller.api.{cloud_region}.zillizcloud.com",
        api_key="Your-Access-Key",
        job_id=job_id,
        cluster_id="Cluster-Id"
    )
    
    print(res.json()["data"]["readyPercentage"])
```

You can list all bulk-import jobs as follows:

```python
from pymilvus import list_import_jobs

res = list_import_jobs(
    url=f"controller.api.{cloud_region}.zillizcloud.com",
    api_key=API_KEY,
    cluster_id=CLUSTER_ID,
    page_size=10,
    current_page=1,
)

print(res.json())
```

## Recaps{#recaps}

In this course, we have covered the entire process of importing data, and here are some ideas to recap:

- Examine your data carefully to work out the schema of the target collection.

- When creating the target cluster, select the cloud provider that hosts the source data to be imported.

- When using **BulkWriter**, note the following:

    - Include all schema-defined fields as keys in each row to append. If dynamic fields are allowed, include also applicable undefined fields.

    - Do not forget to call **commit()** after appending all rows.

- When using **bulk_import()**, build the object URL by prefixing the data path returned by the writer with the endpoint of the cloud provider hosting the prepared data.

