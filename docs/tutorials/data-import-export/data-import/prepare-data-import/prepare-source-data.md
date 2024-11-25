---
title: "Prepare Source Data | Cloud"
slug: /prepare-source-data
sidebar_label: "Prepare Source Data"
beta: FALSE
notebook: FALSE
description: "This page shows you the basic requirements for the source data you need to observe when performing an import on Zilliz Cloud. | Cloud"
type: origin
token: AYoywCl7yiAcrHkSVogcfyPLn7m
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - prepare
  - source

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prepare Source Data

This page shows you the basic requirements for the source data you need to observe when performing an import on Zilliz Cloud. 

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

The following code shows how to set up the schema for the collection with all possible data types.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# You need to work out a collection schema out of your dataset.
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True
)

DIM = 512

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True),
schema.add_field(field_name="bool", datatype=DataType.BOOL),
schema.add_field(field_name="int8", datatype=DataType.INT8),
schema.add_field(field_name="int16", datatype=DataType.INT16),
schema.add_field(field_name="int32", datatype=DataType.INT32),
schema.add_field(field_name="int64", datatype=DataType.INT64),
schema.add_field(field_name="float", datatype=DataType.FLOAT),
schema.add_field(field_name="double", datatype=DataType.DOUBLE),
schema.add_field(field_name="varchar", datatype=DataType.VARCHAR, max_length=512),
schema.add_field(field_name="json", datatype=DataType.JSON),
schema.add_field(field_name="array_str", datatype=DataType.ARRAY, max_capacity=100, element_type=DataType.VARCHAR, max_length=128)
schema.add_field(field_name="array_int", datatype=DataType.ARRAY, max_capacity=100, element_type=DataType.INT64)
schema.add_field(field_name="float_vector", datatype=DataType.FLOAT_VECTOR, dim=DIM),
schema.add_field(field_name="binary_vector", datatype=DataType.BINARY_VECTOR, dim=DIM),
schema.add_field(field_name="float16_vector", datatype=DataType.FLOAT16_VECTOR, dim=DIM),
# schema.add_field(field_name="bfloat16_vector", datatype=DataType.BFLOAT16_VECTOR, dim=DIM),
schema.add_field(field_name="sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)

schema.verify()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.collection.CollectionSchemaParam;
import io.milvus.param.collection.FieldType;
import io.milvus.grpc.DataType;

private static CreateCollectionReq.CollectionSchema createSchema() {
    CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(true)
        .build();
    schema.addField(AddFieldReq.builder()
            .fieldName("id")
            .dataType(io.milvus.v2.common.DataType.Int64)
            .isPrimaryKey(Boolean.TRUE)
            .autoID(false)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("bool")
            .dataType(DataType.Bool)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("int8")
            .dataType(DataType.Int8)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("int16")
            .dataType(DataType.Int16)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("int32")
            .dataType(DataType.Int32)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("int64")
            .dataType(DataType.Int64)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("float")
            .dataType(DataType.Float)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("double")
            .dataType(DataType.Double)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("varchar")
            .dataType(DataType.VarChar)
            .maxLength(512)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("json")
            .dataType(io.milvus.v2.common.DataType.JSON)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("array_int")
            .dataType(io.milvus.v2.common.DataType.Array)
            .maxCapacity(100)
            .elementType(io.milvus.v2.common.DataType.Int64)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("array_str")
            .dataType(io.milvus.v2.common.DataType.Array)
            .maxCapacity(100)
            .elementType(io.milvus.v2.common.DataType.VarChar)
            .maxLength(128)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("float_vector")
            .dataType(io.milvus.v2.common.DataType.FloatVector)
            .dimension(DIM)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("binary_vector")
            .dataType(io.milvus.v2.common.DataType.BinaryVector)
            .dimension(DIM)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("float16_vector")
            .dataType(io.milvus.v2.common.DataType.Float16Vector)
            .dimension(DIM)
            .build());
    schema.addField(AddFieldReq.builder()
            .fieldName("sparse_vector")
            .dataType(io.milvus.v2.common.DataType.SparseFloatVector)
            .build());
    
    return schema;
}
```

</TabItem>
</Tabs>

## Source data requirements{#source-data-requirements}

Zilliz Cloud supports data imports from files in **JSON**, **Parquet**, and **NumPy** formats. If your data is in these formats but fails to import to Zilliz Cloud collections, check whether your data meets the following requirements. If your data is in a different format, convert it using [the BulkWriter tool](./use-bulkwriter).

### JSON file{#json-file}

A valid JSON file has a root key named **rows**, the corresponding value of which is a list of dictionaries, each representing an entity that matches the schema of the target collection.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Multiple files per import</strong></p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Maximum file size per import</strong></p></td>
     <td><p>Free cluster: 512 MB in total</p><p>Serverless and Dedicated cluster:</p><ul><li><p>Individual file size: 10 GB</p></li><li><p>Total file size: 100 GB</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Applicable data file locations</strong></p></td>
     <td><p>Local and remote files</p></td>
   </tr>
</table>

![json_data_structure](/img/json_data_structure.png)

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Exclude the primary key in each entity dictionary if the target collection has <strong>AutoId</strong> enabled in its schema.</p></li>
<li><p>You can include any undefined fields and their values in each entity dictionary as dynamic fields if the target collection has enabled dynamic fields.</p></li>
<li><p>Dictionary keys and collection field names are case-sensitive. Ensure that the dictionary keys in your data exactly match the field names in the target collection. If there is a field named <strong>id</strong> in the target collection, each entity dictionary should have a key named <strong>id.</strong> Using <strong>ID</strong> or <strong>Id</strong> results in errors. </p></li>
</ul>

</Admonition>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the ](./use-bulkwriter)[BulkWriter](./use-bulkwriter)[ tool](./use-bulkwriter) to generate the source data file. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_json_data.json).

### Parquet file{#parquet-file}

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Multiple files per import</strong></p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Maximum file size per import</strong></p></td>
     <td><p>Free cluster: 512 MB in total</p><p>Serverless &amp; Dedicated cluster</p><ul><li><p>Individual file size: 10 GB</p></li><li><p>Total file size: 100 GB</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Applicable data file locations</strong></p></td>
     <td><p>Remote files only</p></td>
   </tr>
</table>

You are advised to use [the BulkWriter tool](./use-bulkwriter) to prepare your raw data into parquet files. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_parquet_data.parquet).

<Admonition type="info" icon="📘" title="Notes">

<p>This file type is available for clusters compatible with Milvus 2.3.x.</p>

</Admonition>

### NumPy files{#numpy-files}

A valid set of NumPy files should be named after the fields in the schema of the target collection, and the data in them should match the corresponding field definitions.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Multiple files per import</strong></p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Data import from first-level subfolders</strong></p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Maximum number of first-level subfolders</strong></p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p><strong>Maximum file size per import</strong></p></td>
     <td><p>Free cluster: 512 MB in total</p><p>Serverless &amp; Dedicated cluster:</p><ul><li><p>Total file size in each first-level subfolder: 10 GB</p></li><li><p>Total file size: 100 GB</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Applicable data file locations</strong></p></td>
     <td><p>Remote files only</p></td>
   </tr>
</table>

![numpy_file_structure](/img/numpy_file_structure.png)

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Exclude the NumPy file for the primary field if the target collection has AutoID enabled in its schema.</p></li>
<li><p>You can include any undefined fields and their values as key-value pairs in a separate NumPy file named <strong>$meta.npy</strong> if the target collection has enabled dynamic fields.</p></li>
<li><p>NumPy file names and collection field names are case-sensitive. Ensure that all NumPy files are named after the field names in the target collection. If there is a field named <strong>id</strong> in the target collection, you should prepare a NumPy file and name it <strong>id.npy</strong>. Naming the file <strong>ID.npy</strong> or <strong>Id.npy</strong> results in errors. </p></li>
</ul>

</Admonition>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the BulkWriter tool](./use-bulkwriter) to generate the source data file. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_numpy_data.zip).

## Tips on import paths{#tips-on-import-paths}

Zilliz Cloud supports data import through the Zilliz Cloud console as well as via RESTful APIs and SDKs. To import the prepared data, you should provide a valid import path to the data.

### From local folders{#from-local-folders}

Zilliz Cloud supports data import from a JSON file in a local folder on the Zilliz Cloud console. You can drag the local file and drop it into the **Import Data** dialog box or click **upload a file** and select the prepared file. Then click **Import** to import the file to the target collection.

![data-import-on-console](/img/data-import-on-console.png)

<Admonition type="info" icon="📘" title="Notes">

<p>For a free cluster, you can upload files of no greater than 512 MB at a time. And this figure is 1 GB for a serverless or dedicated cluster.</p>

</Admonition>

### From remote buckets{#from-remote-buckets}

Zilliz Cloud also supports data import from a bucket on **AWS S3**, **Google GCS**, and **Azure Blob** through the console, RESTful API, and SDKs.

![data-import-on-console-remote](/img/data-import-on-console-remote.png)

<Tabs defaultValue="aws" values={[{"label":"AWS","value":"aws"},{"label":"GCP","value":"gcs"},{"label":"Azure","value":"azure"}]}>

<TabItem value="aws">

- **Object access URIs**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AWS S3 URI</strong></p></td>
         <td><p><code>s3://bucket-name/object-name</code></p></td>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, virtual-hosted–style</strong></p></td>
         <td><p><code>https://bucket-name.s3.region-code.amazonaws.com/object-name</code></p></td>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, path-style</strong></p></td>
         <td><p><code>https://s3.region-code.amazonaws.com/bucket-name/object-name</code></p></td>
       </tr>
    </table>

    For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

- **Quick examples**

    <table>
       <tr>
         <th><p><strong>File Type</strong></p></th>
         <th><p><strong>Quick Examples</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>JSON</strong></p></td>
         <td><p><code>s3://bucket-name/json-folder/</code></p><p><code>s3://bucket-name/json-folder/data.json</code></p></td>
       </tr>
       <tr>
         <td><p><strong>NumPy</strong></p></td>
         <td><p><code>s3://bucket-name/numpy_folder/</code></p><p><code>s3://bucket-name/folder/*.npy</code></p></td>
       </tr>
       <tr>
         <td><p><strong>Parquet</strong></p></td>
         <td><p><code>s3://bucket-name/parquet-folder/</code></p><p><code>s3://bucket-name/parquet-folder/data.parquet</code></p></td>
       </tr>
    </table>

- **Required permissions**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

</TabItem>

<TabItem value="gcs">

- **Object access URIs**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>GSC public URL</strong></p></td>
         <td><p><code>https://storage.googleapis.com/bucket_name/object_name</code></p></td>
       </tr>
       <tr>
         <td><p><strong>GSC gsutil URI</strong></p></td>
         <td><p><code>gs://bucket_name/object_name</code></p></td>
       </tr>
    </table>

    For more details, see [Share the object](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object).

- **Quick examples**

    <table>
       <tr>
         <th><p><strong>File Type</strong></p></th>
         <th><p><strong>Quick Examples</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>JSON</strong></p></td>
         <td><p><code>gs://bucket-name/json-folder/</code></p><p><code>gs://bucket-name/json-folder/data.json</code></p></td>
       </tr>
       <tr>
         <td><p><strong>NumPy</strong></p></td>
         <td><p><code>gs://bucket-name/numpy-folder/</code></p><p><code>gs://bucket-name/numpy-folder/*.npy</code></p></td>
       </tr>
       <tr>
         <td><p><strong>Parquet</strong></p></td>
         <td><p><code>gs://bucket-name/parquet-folder/</code></p><p><code>gs://bucket-name/parquet-folder/data.parquet</code></p></td>
       </tr>
    </table>

- **Required permissions**

    - `storage.objects.get`

    - `storage.objects.list`

</TabItem>

<TabItem value="azure">

- **Object access URIs**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Azure storage blob URI</strong></p></td>
         <td><p><code>https://myaccount.blob.core.windows.net/bucket-name/object_name</code></p></td>
       </tr>
    </table>

    For more details, see [Resource URI Syntax](https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax).

- **Quick examples**

    <table>
       <tr>
         <th><p><strong>File Type</strong></p></th>
         <th><p><strong>Quick Examples</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>JSON</strong></p></td>
         <td><p><code>https://myaccount.blob.core.windows.net/bucket-name/json-folder/</code></p><p><code>https://myaccount.blob.core.windows.net/bucket-name/json-folder/data.json</code></p></td>
       </tr>
       <tr>
         <td><p><strong>NumPy</strong></p></td>
         <td><p><code>https://myaccount.blob.core.windows.net/bucket-name/numpy-folder/</code></p><p><code>https://myaccount.blob.core.windows.net/bucket-name/numpy-folder/*.npy</code></p></td>
       </tr>
       <tr>
         <td><p><strong>Parquet</strong></p></td>
         <td><p><code>https://myaccount.blob.core.windows.net/bucket-name/parquet-folder/</code></p><p><code>https://myaccount.blob.core.windows.net/bucket-name/parquet-folder/data.parquet</code></p></td>
       </tr>
    </table>

</TabItem>

</Tabs>

