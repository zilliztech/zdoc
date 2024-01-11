---
slug: /prepare-source-data
beta: FALSE
notebook: FALSE
token: AYoywCl7yiAcrHkSVogcfyPLn7m
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prepare Source Data

This page helps prepare your source data to make sure it can be successfully imported to Zilliz Cloud collections.

## Map source data to collection{#map-source-data-to-collection}

The target collection requires mapping the source data to its schema. The diagram below shows how acceptable source data is mapped to the schema of a target collection.

![data_import-preparetion_en](/img/data_import-preparetion_en.png)

You should carefully examine your data and design the schema of the target collection accordingly.

Taking the JSON data in the above diagram as an example, there are two entities in the **rows** list, each row having six fields. The collection selectively includes four: **id**, **vector**, **scalar_1**, and **scalar_2**.

There are two more things to consider when designing the schema:

- **Whether to enable AutoID**

    The **id** field serves as the primary field of the collection. To make the primary field automatically increment, you can enable **AutoID** in the schema. In this case, you should exclude the **id** field from each row in the source data.

- **Whether to enable dynamic fields**

    The target collection can also store fields not included in its pre-defined schema if the schema enables dynamic fields. The **$meta** field is a reserved JSON field to hold dynamic fields and their values in key-value pairs. In the above diagram, the fields **dynamic_field_1** and **dynamic_field_2**  and the values will be saved as key-value pairs in **$meta**.

The following code shows how to set up the schema for the collection in the above diagram.

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

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

## Source data requirements{#source-data-requirements}

Zilliz Cloud supports data imports from files in **JSON**, **Parquet**, and **NumPy** formats. If your data is in these formats but fails to import to Zilliz Cloud collections, check whether your data meets the following requirements. If your data is in a different format, convert it using [the ](./use-bulkwriter)[**BulkWriter**](./use-bulkwriter)[ tool](./use-bulkwriter).

### JSON file{#json-file}

A valid JSON file has a root key named **rows**, the corresponding value of which is a list of dictionaries, each representing an entity that matches the schema of the target collection.

|  **Item**                           |  **Description**                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
|  **Number of files per import**     |  1                                                                                                                                     |
|  **Maximum file size per import**   |  Serverless cluster: 512 MB<br/> Dedicated cluster:<br/> - Total file size: 100 GB<br/> - Individual file size: 10 GB<br/> |
|  **Applicable data file locations** |  Local and remote files                                                                                                                |

![json_data_structure](/img/json_data_structure.png)

<Admonition type="info" icon="📘" title="Notes">

- Exclude the primary key in each entity dictionary if the target collection has **AutoId** enabled in its schema.

- You can include any undefined fields and their values in each entity dictionary as dynamic fields if the target collection has enabled dynamic fields.

- Dictionary keys and collection field names are case-sensitive. Ensure that the dictionary keys in your data exactly match the field names in the target collection. If there is a field named **id** in the target collection, each entity dictionary should have a key named **id.** Using **ID** or **Id** results in errors.

</Admonition>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the ](./use-bulkwriter)[**BulkWriter**](./use-bulkwriter)[ tool](./use-bulkwriter) to generate the source data file.

### Parquet file{#parquet-file}

|  **Item**                           |  **Description**                                                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
|  **Number of files per import**     |  All files in the specified folder if the total file size does not exceed the upper limit. Otherwise, an error occurs. |
|  **Maximum file size per import**   |  - Total file size: 100 GB<br/> - Individual file size: 10 GB<br/>                                               |
|  **Applicable data file locations** |  Remote files only                                                                                                     |

You are advised to use [the ](./use-bulkwriter)[**BulkWriter**](./use-bulkwriter)[ tool](./use-bulkwriter) to prepare your raw data into parquet files.

### NumPy files{#numpy-files}

A valid set of NumPy files should be named after the fields in the schema of the target collection, and the data in them should match the corresponding field definitions.

|  **Item**                                  |  **Description**                                                                                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  **Number of files per import**            |  The number of fields in the target collection of this import.<br/> If the target collection allows dynamic fields, consider adding an extra **$meta.npy** to store dynamic fields. |
|  **Maximum file size per import**<br/>  |  - Total file size: 100 GB<br/> - Total file size in each first-level subfolder: 15 GB<br/> - Maximum number of first-level subfolders: 100<br/>                              |
|  **Applicable data file locations**        |  Remote files only                                                                                                                                                                     |

![numpy_file_structure](/img/numpy_file_structure.png)

<Admonition type="info" icon="📘" title="Notes">

- Exclude the NumPy file for the primary field if the target collection has AutoID enabled in its schema.

- You can include any undefined fields and their values as key-value pairs in a separate NumPy file named **$meta.npy** if the target collection has enabled dynamic fields.

- NumPy file names and collection field names are case-sensitive. Ensure that all NumPy files are named after the field names in the target collection. If there is a field named **id** in the target collection, you should prepare a NumPy file and name it **id.npy**. Naming the file **ID.npy** or **Id.npy** results in errors.

</Admonition>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the ](./use-bulkwriter)[**BulkWriter**](./use-bulkwriter)[ tool](./use-bulkwriter) to generate the source data file.

## Tips on import paths{#tips-on-import-paths}

Zilliz Cloud supports data import through the Zilliz Cloud console as well as via RESTful APIs and SDKs. To import the prepared data, you should provide a valid import path to the data.

### From local folders{#from-local-folders}

Zilliz Cloud supports data import from a JSON file in a local folder on the Zilliz Cloud console. You can drag the local file and drop it into the **Import Data** dialog box or click **upload a file **and select the prepared file. Then click **Import** to import the file to the target collection.

![data-import-on-console](/img/data-import-on-console.png)

### From remote buckets{#from-remote-buckets}

Zilliz Cloud also supports data import from a bucket on **AWS S3**, **Google GCS**, and **Azure Blob**.

<Admonition type="info" icon="📘" title="Notes">

The bucket and the target cluster of this import should reside on the same public cloud. For example, if the target cluster is hosted on AWS, you should use an AWS S3 bucket to hold the source data files.

</Admonition>

<Tabs defaultValue="aws" values={[{"label":"AWS","value":"aws"},{"label":"GCP","value":"gcs"},{"label":"Azure","value":"azure"}]}>

<TabItem value="aws">

- **Object access URIs**

    |  **URI Style**                            |  **URI Format**                                                 |
    | ----------------------------------------- | --------------------------------------------------------------- |
    |  **AWS S3 URI**                           |  `s3://bucket-name/object-name`                                 |
    |  **AWS Object URL, virtual-hosted–style** |  `https://bucket-name.s3.region-code.amazonaws.com/object-name` |
    |  **AWS Object URL, path-style**           |  `https://s3.region-code.amazonaws.com/bucket-name/object-name` |

    For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

- **Quick examples**

    |  **File Type** |  **Quick Examples**                                                                        |
    | -------------- | ------------------------------------------------------------------------------------------ |
    |  **JSON**      |  `s3://bucket-name/json-folder/`<br/> `s3://bucket-name/json-folder/data.json`          |
    |  **NumPy**     |  `s3://bucket-name/numpy_folder/`<br/> `s3://bucket-name/folder/*.npy`                  |
    |  **Parquet**   |  `s3://bucket-name/parquet-folder/`<br/> `s3://bucket-name/parquet-folder/data.parquet` |

- **Required permissions**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

</TabItem>

<TabItem value="gcs">

- **Object access URIs**

    |  **URI Style**      |  **URI Format**                                           |
    | ------------------- | --------------------------------------------------------- |
    |  **GSC public URL** |  `https://storage.googleapis.com/bucket_name/object_name` |
    |  **GSC gsutil URI** |  `gs://bucket_name/object_name`                           |

    For more details, see [Share the object](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object).

- **Quick examples**

    |  **File Type** |  **Quick Examples**                                                                        |
    | -------------- | ------------------------------------------------------------------------------------------ |
    |  **JSON**      |  `gs://bucket-name/json-folder/`<br/> `gs://bucket-name/json-folder/data.json`          |
    |  **NumPy**     |  `gs://bucket-name/numpy-folder/`<br/> `gs://bucket-name/numpy-folder/*.npy`            |
    |  **Parquet**   |  `gs://bucket-name/parquet-folder/`<br/> `gs://bucket-name/parquet-folder/data.parquet` |

- **Required permissions**

    - `storage.objects.get`

    - `storage.objects.list`

</TabItem>

<TabItem value="azure">

- **Object access URIs**

    |  **URI Style**              |  **URI Format**                                           |
    | --------------------------- | --------------------------------------------------------- |
    |  **Azure storage blob URI** |  `https://storage.googleapis.com/bucket_name/object_name` |

    For more details, see [Resource URI Syntax](https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax).

- **Quick examples**

    |  **File Type** |  **Quick Examples**                                                                                                                                              |
    | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **JSON**      |  `https://myaccount.blob.core.windows.net/bucket-name/json-folder/`<br/> `https://myaccount.blob.core.windows.net/bucket-name/json-folder/data.json`          |
    |  **NumPy**     |  `https://myaccount.blob.core.windows.net/bucket-name/numpy-folder/`<br/> `https://myaccount.blob.core.windows.net/bucket-name/numpy-folder/*.npy`            |
    |  **Parquet**   |  `https://myaccount.blob.core.windows.net/bucket-name/parquet-folder/`<br/> `https://myaccount.blob.core.windows.net/bucket-name/parquet-folder/data.parquet` |

</TabItem>

</Tabs>

