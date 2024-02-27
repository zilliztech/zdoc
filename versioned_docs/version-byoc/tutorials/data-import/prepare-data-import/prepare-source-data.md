---
slug: /prepare-source-data
beta: FALSE
notebook: FALSE
type: origin
token: AYoywCl7yiAcrHkSVogcfyPLn7m
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Prepare Source Data

This page shows you the basic requirements for the source data you need to observe when performing an import on Zilliz Cloud. 

## Map source data to collection{#map-source-data-to-collection}

The target collection requires mapping the source data to its schema. The diagram below shows how acceptable source data is mapped to the schema of a target collection.

![data_import-preparetion_en](/byoc/data_import-preparetion_en.png)

You should carefully examine your data and design the schema of the target collection accordingly.

Taking the JSON data in the above diagram as an example, there are two entities in the __rows__ list, each row having six fields. The collection selectively includes four: __id__, __vector__, __scalar_1__, and __scalar_2__.

There are two more things to consider when designing the schema:

- __Whether to enable AutoID__

    The __id__ field serves as the primary field of the collection. To make the primary field automatically increment, you can enable __AutoID__ in the schema. In this case, you should exclude the __id__ field from each row in the source data.

- __Whether to enable dynamic fields__

    The target collection can also store fields not included in its pre-defined schema if the schema enables dynamic fields. The __$meta__ field is a reserved JSON field to hold dynamic fields and their values in key-value pairs. In the above diagram, the fields __dynamic_field_1__ and __dynamic_field_2__  and the values will be saved as key-value pairs in __$meta__.

The following code shows how to set up the schema for the collection in the above diagram.

```python
from pymilvus import MilvusClient, DataType

# You need to work out a collection schema out of your dataset.
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="scalar_1", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="scalar_2", datatype=DataType.INT64)
```

## Source data requirements{#source-data-requirements}

Zilliz Cloud supports data imports from files in __JSON__, __Parquet__, and __NumPy__ formats. If your data is in these formats but fails to import to Zilliz Cloud collections, check whether your data meets the following requirements. If your data is in a different format, convert it using [the ](./use-bulkwriter)__[BulkWriter](./use-bulkwriter)__[ tool](./use-bulkwriter).

### JSON file{#json-file}

A valid JSON file has a root key named __rows__, the corresponding value of which is a list of dictionaries, each representing an entity that matches the schema of the target collection.

|  __Item__                           |  __Description__                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
|  __Multiple files per import__      |  Yes                                                                                                                                   |
|  __Maximum file size per import__   |  Serverless cluster: 512 MB<br/> Dedicated cluster:<br/> - Total file size: 100 GB<br/> - Individual file size: 10 GB<br/> |
|  __Applicable data file locations__ |  Local and remote files                                                                                                                |

![json_data_structure](/byoc/json_data_structure.png)

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Exclude the primary key in each entity dictionary if the target collection has <strong>AutoId</strong> enabled in its schema.</p></li>
<li><p>You can include any undefined fields and their values in each entity dictionary as dynamic fields if the target collection has enabled dynamic fields.</p></li>
<li><p>Dictionary keys and collection field names are case-sensitive. Ensure that the dictionary keys in your data exactly match the field names in the target collection. If there is a field named <strong>id</strong> in the target collection, each entity dictionary should have a key named <strong>id.</strong> Using <strong>ID</strong> or <strong>Id</strong> results in errors. </p></li>
</ul>

</Admonition>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the ](./use-bulkwriter)__[BulkWriter](./use-bulkwriter)__[ tool](./use-bulkwriter) to generate the source data file. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_json_data.json).

### Parquet file{#parquet-file}

|  __Item__                           |  __Description__                                                         |
| ----------------------------------- | ------------------------------------------------------------------------ |
|  __Multiple files per import__      |  Yes                                                                     |
|  __Maximum file size per import__   |  - Total file size: 100 GB<br/> - Individual file size: 10 GB<br/> |
|  __Applicable data file locations__ |  Remote files only                                                       |

You are advised to use [the ](./use-bulkwriter)__[BulkWriter](./use-bulkwriter)__[ tool](./use-bulkwriter) to prepare your raw data into parquet files. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_parquet_data.parquet).

<Admonition type="info" icon="📘" title="Notes">

<p>This file type is available for clusters compatible with Milvus 2.3.x.</p>

</Admonition>

### NumPy files{#numpy-files}

A valid set of NumPy files should be named after the fields in the schema of the target collection, and the data in them should match the corresponding field definitions.

|  __Item__                                     |  __Description__                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
|  __Multiple files per import__                |  Yes                                                                                              |
|  __Data import from first-level subfolders__  |  Yes                                                                                              |
|  __Maximum number of first-level subfolders__ |  100                                                                                              |
|  __Maximum file size per import__<br/>     |  - Total file size: 100 GB<br/> - Total file size in each first-level subfolder: 10 GB<br/> |
|  __Applicable data file locations__           |  Remote files only                                                                                |

![numpy_file_structure](/byoc/numpy_file_structure.png)

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Exclude the NumPy file for the primary field if the target collection has AutoID enabled in its schema.</p></li>
<li><p>You can include any undefined fields and their values as key-value pairs in a separate NumPy file named <strong>$meta.npy</strong> if the target collection has enabled dynamic fields.</p></li>
<li><p>NumPy file names and collection field names are case-sensitive. Ensure that all NumPy files are named after the field names in the target collection. If there is a field named <strong>id</strong> in the target collection, you should prepare a NumPy file and name it <strong>id.npy</strong>. Naming the file <strong>ID.npy</strong> or <strong>Id.npy</strong> results in errors. </p></li>
</ul>

</Admonition>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the ](./use-bulkwriter)__[BulkWriter](./use-bulkwriter)__[ tool](./use-bulkwriter) to generate the source data file. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_numpy_data.zip).

## Tips on import paths{#tips-on-import-paths}

Zilliz Cloud supports data import through the Zilliz Cloud console as well as via RESTful APIs and SDKs. To import the prepared data, you should provide a valid import path to the data.

### From local folders{#from-local-folders}

Zilliz Cloud supports data import from a JSON file in a local folder on the Zilliz Cloud console. You can drag the local file and drop it into the __Import Data__ dialog box or click __upload a file __and select the prepared file. Then click __Import__ to import the file to the target collection.

![data-import-on-console](/byoc/data-import-on-console.png)

### From remote buckets{#from-remote-buckets}

Zilliz Cloud also supports data import from a bucket on __AWS S3__, __Google GCS__, and __Azure Blob__ through the console, RESTful API, and SDKs.

<Admonition type="info" icon="📘" title="Notes">

<p>The bucket and the target cluster of this import should reside on the same public cloud. For example, if the target cluster is hosted on AWS, you should use an AWS S3 bucket to hold the source data files.</p>

</Admonition>

![data-import-on-console-remote](/byoc/data-import-on-console-remote.png)

- __Object access URIs__

    |  __URI Style__                            |  __URI Format__                                                 |
    | ----------------------------------------- | --------------------------------------------------------------- |
    |  __AWS S3 URI__                           |  `s3://bucket-name/object-name`                                 |
    |  __AWS Object URL, virtual-hosted–style__ |  `https://bucket-name.s3.region-code.amazonaws.com/object-name` |
    |  __AWS Object URL, path-style__           |  `https://s3.region-code.amazonaws.com/bucket-name/object-name` |

    For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

- __Quick examples__

    |  __File Type__ |  __Quick Examples__                                                                        |
    | -------------- | ------------------------------------------------------------------------------------------ |
    |  __JSON__      |  `s3://bucket-name/json-folder/`<br/> `s3://bucket-name/json-folder/data.json`          |
    |  __NumPy__     |  `s3://bucket-name/numpy_folder/`<br/> `s3://bucket-name/folder/*.npy`                  |
    |  __Parquet__   |  `s3://bucket-name/parquet-folder/`<br/> `s3://bucket-name/parquet-folder/data.parquet` |

- __Required permissions__

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

