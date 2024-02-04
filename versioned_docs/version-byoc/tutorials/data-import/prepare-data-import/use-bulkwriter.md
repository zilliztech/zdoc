---
slug: /use-bulkwriter
beta: FALSE
notebook: 06_use_remote-bulk-writer.ipynb
token: QyjpwAaKuihAeJkNBUJcdFesn9e
sidebar_position: 4
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use BulkWriter

If your data format does not meet the requirements on [Prepare Source Data](./prepare-source-data), you can use **BulkWriter**, a data processing tool in pymilvus, to prepare your data.

## Overview{#overview}

**BulkWriter** in PyMilvus is a script designed to convert raw datasets into a format suitable for importing via various methods such as the Zilliz Cloud console, the **BulkInsert** APIs of Milvus SDKs, or the **Import** API in RESTful flavor. It offers two types of writers:

- **LocalBulkWriter**: Reads the designated dataset and transforms it into an easy-to-use format.

- **RemoteBulkWriter**: Performs the same task as the **LocalBulkWriter** but additionally transfers the converted data files to a specified remote object storage bucket.

## Procedure{#procedure}

### Set up pymilvus{#set-up-pymilvus}

Run the following command in the shell to install pymilvus or upgrade your pymilvus to the latest version.

```bash
pip install --upgrade pymilvus
```

### Set up a collection schema{#set-up-a-collection-schema}

Decide on the schema for the collection you wish to import your dataset into. This involves selecting which fields to include from the dataset.

The following code creates a collection schema with four fields: **id**, **vector**, **scalar_1**, **and scalar_2**. The first one is the primary field, the second one is the vector field to store 768-dimensional vector embeddings, and the rest two are scalar fields.

In addition, the schema disables the primary field from automatically incrementing and enables dynamic fields.

```python
from pymilvus import (
    FieldSchema,
    CollectionSchema,
    DataType
)

# You need to work out a collection schema out of your dataset.
schema = CollectionSchema(
    fields=[
        FieldSchema(name="id", dtype=DataType.INT64, is_priamry=True),
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=768),
        FieldSchema(name="scalar_1", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="scalar_2", dtype=DataType.INT64)
    ],
    auto_id=False,
    enable_dynamic_field=True,
)
```

### Create a BulkWriter{#create-a-bulkwriter}

There are two types of **BulkWriter**s available.

- **LocalBulkWriter**

    A **LocalBulkWriter** appends rows from the source dataset and commits them to a local file of the specified format.

    ```python
    from pymilvus import LocalBulkWriter, BulkFileType
    
    writer = LocalBulkWriter(
        schema=schema,
        local_path='./tmp',
        segment_size=1 * 1024 * 1024,
        file_type=BulkFileType.NPY
    )
    ```

    When creating a **LocalBulkWriter**, you should:

    - Reference the created schema in **schema**.

    - Set **local_path **to the output directory.

    - Set **file_type **to the output file type.

    - If your dataset contains a large number of records, you are advised to segment your data by setting **segment_size** to a proper value.

    For details on parameter settings, refer to **LocalBulkWriter** in the SDK reference.

    <Admonition type="info" icon="📘" title="Notes">

    Only JSON files generated using **LocalBulkWriter** can be directly imported into Zilliz Cloud.     
    
    For files of other types, upload them to one of your buckets in the same cloud region as that of your target cluster before the import.

    </Admonition>

- **RemoteBulkWriter**

    Instead of committing appended data to a local file, a **RemoteBulkWriter** commits them to a remote bucket. Therefore, you should set up a **ConnectParam** object before creating a **RemoteBulkWriter**.

    <Tabs groupId="python" defaultValue='python' values={[{"label":"AWS S3/GCS","value":"python"},{"label":"Azure Blog Storage","value":"python_1"}]}>
    <TabItem value='python'>

    ```python
    
    from pymilvus import RemoteBulkWriter
    
    # Connections parameters to access the remote bucket
    conn = RemoteBulkWriter.ConnectParam(
        endpoint="storage.googleapis.com", # Use "s3.amazonaws.com" for AWS S3
        access_key=ACCESS_KEY,
        secret_key=SECRET_KEY,
        bucket_name=BUCKET_NAME, # Use a bucket hosted in the same cloud as the target cluster
        secure=True
    )
    
    ```

    </TabItem>
    <TabItem value='python_1'>

    ```python
    AZURE_CONNECT_STRING = ""
    
    conn = RemoteBulkWriter.AzureConnectParam(
        conn_str=AZURE_CONNECT_STRING,
        container_name=BUCKET_NAME
    )
    
    # or
    
    AZURE_ACCOUNT_URL = ""
    AZURE_CREDENTIAL = ""
    
    conn = RemoteBulkWriter.AzureConnectParam(
        account_url=AZURE_ACCOUNT_URL,
        credential=AZURE_CREDENTIAL,
        container_name=BUCKET_NAME
    )
    ```

    </TabItem>
    </Tabs>

    Once the connection parameters are ready, you can reference it in the **RemoteBulkWriter** as follows:

    ```python
    from pymilvus import BulkFileType
    
    writer = RemoteBulkWriter(
        schema=schema,
        remote_path="/",
        connect_param=conn,
        file_type=BulkFileType.NPY
    )
    ```

    The parameters for creating a **RemoteBulkWriter** are barely the same as those for a **LocalBulkWriter**, except **connect_param**.  For details on parameter settings, refer to **RemoteBulkWriter** and **ConnectParam** in the SDK reference.

### Start writing {#start-writing}

A **BulkWriter** has two methods: **append_row()** adds a row from a source dataset, and **commit()** commits added rows to a local file or a remote bucket.

For demonstration purposes, the following code appends randomly generated data.

```python
import random
import string

def generate_random_str(length=5):
    letters = string.ascii_uppercase
    digits = string.digits
    
    return ''.join(random.choices(letters + digits, k=length))

for i in range(10000):
    writer.append_row({
        "id": i, 
        "vector":[random.uniform(-1, 1) for _ in range(768)]
        "scalar_1": generate_random_str(random.randint(1, 20)),
        "scalar_2": random.randint(100),
    })
    
writer.commit()
```

## Dynamic schema support{#dynamic-schema-support}

In [the previous section](./use-bulkwriter#set-up-a-collection-schema), we referenced a schema that permits dynamic fields in the writer, allowing undefined fields to be included when appending rows.

For demonstration purposes, the following code appends randomly generated data.

```python
import random
import string

def generate_random_string(length=5):
    letters = string.ascii_uppercase
    digits = string.digits
    
    return ''.join(random.choices(letters + digits, k=length))

for i in range(10000):
    writer.append_row({
        "id": i, 
        "vector":[random.uniform(-1, 1) for _ in range(768)],
        "scalar_1": generate_random_string(),
        "scalar_2": random.randint(100),
        "dynamic_field_1": random.choice([True, False]),
        "dynamic_field_2": random.randint(100)
    })
    
writer.commit()
```

## Verify the result{#verify-the-result}

To check the results, you can get the actual output path by printing the **data_path** property of the writer.

```python
print(writer.data_path)

# LocalBulkWriter
# PosixPath('folder/45ae1139-1d87-4aff-85f5-0039111f9e6b')

# RemoteBulkWriter
# PosixPath('/folder/5868ba87-743e-4d9e-8fa6-e07b39229425')
```

BulkWriter generates a UUID, creates a sub-folder using the UUID in the provided output directory, and places all generated files in the sub-folder. [Click here to download the prepared sample data](https://assets.zilliz.com/bulk_writer.zip).

Possible folder structures are as follows:

- If the generated file does not exceed the specified segment size

    ```python
    # JSON
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       └── 1.json 
    
    # Parquet
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       └── 1.parquet 
    
    # Numpy
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       ├── id.npy
    │       ├── vector.npy
    │       ├── scalar_1.npy
    │       ├── scalar_2.npy
    │       └── $meta.npy 
    ```

    |  **File Type** |  **Valid Import Paths**                                                                                                                                           |
    | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **JSON**      |  - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/> - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/1.json*<br/>    |
    |  **Parquet**   |  - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/> - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/1.parquet*<br/> |
    |  **NumPy**     |  - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/> - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/\*.npy*<br/>    |

- If the generated file exceeds the specified segment size

    ```python
    # The following assumes that two segments are generated.
    
    # JSON
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       ├── 1.json
    │       └── 2.json 
    
    # Parquet
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       ├── 1.parquet
    │       └── 2.parquet 
    
    # Numpy
    ├── folder
    │   └── 45ae1139-1d87-4aff-85f5-0039111f9e6b
    │       ├── 1
    │       │   ├── id.npy
    │       │   ├── vector.npy
    │       │   ├── scalar_1.npy
    │       │   ├── scalar_2.npy
    │       │   └── $meta.npy 
    │       └── 2
    │           ├── id.npy
    │           ├── vector.npy
    │           ├── scalar_1.npy
    │           ├── scalar_2.npy
    │           └── $meta.npy  
    ```

    |  **File Type** |  **Valid Import Paths**                                                                                                                                        |
    | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **JSON**      |  - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/>                                                                                   |
    |  **Parquet**   |  - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/>                                                                                   |
    |  **NumPy**     |  - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/*<br/> - *s3://remote_bucket/folder/45ae1139-1d87-4aff-85f5-0039111f9e6b/\*.npy*<br/> |

## Related topics{#related-topics}

- [Import Data on Web UI](./import-data-on-web-ui)

- [Import Data via RESTful API](./import-data-via-restful-api)

- [Import Data via SDKs](./import-data-via-sdks)

