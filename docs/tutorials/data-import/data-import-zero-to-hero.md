---
slug: /data-import-zero-to-hero
beta: FALSE
notebook: 99_data_import_zero_to_hero.ipynb
token: BjHZwBkk0iFScik49QMc1Wwjndb
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# User Guide: Data Import from Zero to Hero

This is a fast-track course to help you quickly start importing data on Zilliz Cloud, from data preparation and collection setup to the actual data import process. Throughout this tutorial, you will learn:

- How to define a schema and set up a target collection

- How to prepare source data using **BulkWriter** and write it to a remote storage bucket

- How to import data by calling bulk-import APIs

## Before you start{#before-you-start}

To ensure a smooth experience, make sure you have completed the following setups:

- **Set Up Your Zilliz Cloud Cluster**:

    - If you have not already, [create a cluster](./create-cluster).

    - Gather these details: **Cluster Endpoint**, **API Key**, **Cluster ID**, and **Cloud Region**. You can find these cluster values on the [Zilliz Cloud console](./on-zilliz-cloud-console).

- **Configure Your Remote Storage Bucket**:

    - Set up a remote bucket using AWS S3, Google GCS, or Azure Blob. Ensure the bucket is hosted on the same cloud as your Zilliz Cloud cluster.

    - Note down the **Access Key**, **Secret Key**, and **Bucket Name**. These details are available in the console of the cloud provider where your bucket is hosted.

To enhance the usage of the example code, we recommend you use variables to store the configuration details:

```python
# Configs for Zilliz Cloud cluster
CLUSTER_ENDPOINT=""
API_KEY=""
CLUSTER_ID=""
CLOUD_REGION=""

# Configs for remote bucket
ACCESS_KEY=""
SECRET_KEY=""
BUCKET_NAME=""
```

## Install dependencies{#install-dependencies}

Run the following command in your terminal to install **pymilvus** and **minio** or upgrade them to the latest version.

```shell
python3 -m pip install --upgrade pymilvus minio
```

## Download example dataset{#download-example-dataset}

Run the following command in your terminal to download the example CSV file.

```shell
curl https://assets.zilliz.com/medium_articles_partial.csv \
        --output medium_articles_partial.csv
```

The output is similar to the following. If you prefer to download from the browser, [click here](https://assets.zilliz.com/medium_articles_partial.csv).

```python
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
 70 2.1M    70 1.4M     0     0   478k      0  0:00:08  0:00:02  0:00:06  544
```

 The following table lists the data structure of the data and the values in the first row.

|  **Field Name** |  **Type**     |  **Attributes**  |  **Sample Value**                                  |
| --------------- | ------------- | ---------------- | -------------------------------------------------- |
|  id             |  INT64        |  N/A             |  0                                                 |
|  title_vector   |  FLOAT_VECTOR |  Dimension: 768  |  [0.041732933, 0.013779674, -0.027564144, -0.01... |
|  title          |  VARCHAR      |  Max length: 512 |  The Reported Mortality Rate of Coronavirus Is ... |
|  link           |  VARCHAR      |  Max length: 512 |  https://medium.com/swlh/the-reported-mortality... |
|  reading_time   |  INT64        |  N/A             |  13                                                |
|  publication    |  VARCHAR      |  Max length: 512 |  The Startup                                       |
|  claps          |  INT64        |  N/A             |  1100                                              |
|  responses      |  INT64        |  N/A             |  18                                                |

The example dataset comprises details of over 5,000 articles from medium.com. Learn about this dataset from its [introduction page on Kaggle](https://www.kaggle.com/datasets/shiyu22chen/cleaned-medium-articles-dataset). 

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
        uri=CLUSTER_ENDPOINT,
        token=API_KEY
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
    endpoint="storage.googleapis.com", # Set to "s3.amazonaws.com" for AWS S3
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    bucket_name=BUCKET_NAME, # Use a bucket hosted in the same cloud as the target cluster
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

df = pd.read_csv("path/to/medium_articles_2020_dpr.csv") # Replace with actual file path to the dataset

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

### Start importing{#start-importing}

To import the prepared source data, you need to call the **bulk_import()** function as follows:

<Admonition type="info" icon="📘" title="Notes">

You should replace `url` in the `bulk_import()` with the one corresponding to the cloud region of the target collection.

</Admonition>

```python
from pymilvus import bulk_import

# Publicly accessible URL for an object in the remote bucket
# Change `gs` to `s3` for AWS S3
object_url = f"gs://{BUCKET_NAME}/{str(writer.data_path)[1:]}/"

res = bulk_import(
    #highlight-next
    url="controller.api.aws-us-west-2.zillizcloud.com",
    api_key=API_KEY,
    object_url=object_url,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY,
    cluster_id=CLUSTER_ID,
    collection_name=COLLECTION_NAME,
)

print(res.json())

# {'code': 200, 'data': {'jobId': '0f7fe853-d93e-4681-99f2-4719c63585cc'}}
```

<Admonition type="info" icon="📘" title="Notes">

The **object_url** should be a valid URL to an object in the remote bucket. 

If the data and target collection are hosted by Google Cloud, the object URL should be in the format `gs://remote-bucket/${writer.data_path}`.  For applicable URI to prefix the data path returned by the writer, please refer to [Prepare Source Data](./prepare-source-data).

</Admonition>

### Check task progress{#check-task-progress}

The following code checks the bulk-import progress every 5 seconds and outputs the progress in percentage. 

<Admonition type="info" icon="📘" title="Notes">

You should replace `url` in the `get_import_progress()` with the one corresponding to the cloud region of the target collection.

</Admonition>

```python
import time
from pymilvus import get_import_progress

job_id = res.json()['data']['jobId']

res = get_import_progress(
    # highlight-next
    url="controller.api.aws-us-west-2.zillizcloud.com",
    api_key=API_KEY,
    job_id=job_id,
    cluster_id=CLUSTER_ID
)

# check the bulk-import progress
while res.json()["data"]["readyPercentage"] < 1:
    time.sleep(5)

    res = get_import_progress(
        # highlight-next
        url="controller.api.aws-us-west-2.zillizcloud.com",
        api_key=API_KEY,
        job_id=job_id,
        cluster_id=CLUSTER_ID
    )
    
    print(res.json()["data"]["readyPercentage"])

# 0.01   -- import progress 1%
# 0.5    -- import progress 50%
# 0.5
# 1      -- finished
```

You can list all bulk-import jobs as follows:

```python
from pymilvus import list_import_jobs

res = list_import_jobs(
    # highlight-next
    url="controller.api.aws-us-west-2.zillizcloud.com",
    api_key=API_KEY,
    cluster_id=CLUSTER_ID,
    page_size=10,
    current_page=1,
)

print(res.json())

# {
#    "code":200,
#    "data":{
#       "tasks":[
#          {
#             "collectionName":"medium_aritlces",
#             "jobId":"0f7fe853-d93e-4681-99f2-4719c63585cc",
#             "state":"ImportCompleted"
#          }
#       ],
#       "count":1,
#       "currentPage":1,
#       "pageSize":10
#    }
# }
```

## Recaps{#recaps}

In this course, we have covered the entire process of importing data, and here are some ideas to recap:

- Examine your data carefully to work out the schema of the target collection.

- When creating the target cluster, select the cloud provider that hosts the source data to be imported.

- When using **BulkWriter**, note the following:

    - Include all schema-defined fields as keys in each row to append. If dynamic fields are allowed, include also applicable undefined fields.

    - Do not forget to call **commit()** after appending all rows.

- When using **bulk_import()**, build the object URL by prefixing the data path returned by the writer with the endpoint of the cloud provider hosting the prepared data.

