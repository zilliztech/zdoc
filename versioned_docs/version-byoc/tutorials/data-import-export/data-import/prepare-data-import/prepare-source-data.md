---
slug: /prepare-source-data
beta: FALSE
notebook: FALSE
type: origin
token: AYoywCl7yiAcrHkSVogcfyPLn7m
sidebar_position: 1

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prepare Source Data

This page shows you the basic requirements for the source data you need to observe when performing an import on Zilliz Cloud. 

## Map source data to collection{#map-source-data-to-collection}

The target collection requires mapping the source data to its schema. The diagram below shows how acceptable source data is mapped to the schema of a target collection.

![data_import-preparetion_en](/byoc/data_import-preparetion_en.png)

You should carefully examine your data and design the schema of the target collection accordingly.

Taking the JSON data in the above diagram as an example, there are two entities in the **rows** list, each row having six fields. The collection selectively includes four: **id**, **vector**, **scalar_1**, and **scalar_2**.

There are two more things to consider when designing the schema:

- **Whether to enable AutoID**

    The **id** field serves as the primary field of the collection. To make the primary field automatically increment, you can enable **AutoID** in the schema. In this case, you should exclude the **id** field from each row in the source data.

- **Whether to enable dynamic fields**

    The target collection can also store fields not included in its pre-defined schema if the schema enables dynamic fields. The **$meta** field is a reserved JSON field to hold dynamic fields and their values in key-value pairs. In the above diagram, the fields **dynamic_field_1** and **dynamic_field_2**  and the values will be saved as key-value pairs in **$meta**.

The following code shows how to set up the schema for the collection in the above diagram.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.collection.CollectionSchemaParam;
import io.milvus.param.collection.FieldType;
import io.milvus.grpc.DataType;

// Define schema for the target collection
FieldType id = FieldType.newBuilder()
        .withName("id")
        .withDataType(DataType.Int64)
        .withPrimaryKey(true)
        .withAutoID(false)
        .build();

FieldType vector = FieldType.newBuilder()
        .withName("vector")
        .withDataType(DataType.FloatVector)
        .withDimension(768)
        .build();

FieldType scalar1 = FieldType.newBuilder()
        .withName("scalar_1")
        .withDataType(DataType.VarChar)
        .withMaxLength(512)
        .build();

FieldType scalar2 = FieldType.newBuilder()
        .withName("scalar_2")
        .withDataType(DataType.Int64)
        .build();

CollectionSchemaParam schema = CollectionSchemaParam.newBuilder()
        .withEnableDynamicField(true)
        .addFieldType(id)
        .addFieldType(vector)
        .addFieldType(scalar1)
        .addFieldType(scalar2)
        .build();
```

</TabItem>
</Tabs>

## Source data requirements{#source-data-requirements}

Zilliz Cloud supports data imports from files in **JSON**, **Parquet**, and **NumPy** formats. If your data is in these formats but fails to import to Zilliz Cloud collections, check whether your data meets the following requirements. If your data is in a different format, convert it using [the BulkWriter tool](./use-bulkwriter).

### JSON file{#json-file}

A valid JSON file has a root key named **rows**, the corresponding value of which is a list of dictionaries, each representing an entity that matches the schema of the target collection.

<table>
   <tr>
     <th><strong>Item</strong></th>
     <th><strong>Description</strong></th>
   </tr>
   <tr>
     <td><strong>Multiple files per import</strong></td>
     <td>Yes</td>
   </tr>
   <tr>
     <td><strong>Maximum file size per import</strong></td>
     <td>Free cluster: 512 MB<br/> Serverless and Dedicated cluster:<br/> - Total file size: 100 GB<br/> - Individual file size: 10 GB<br/></td>
   </tr>
   <tr>
     <td><strong>Applicable data file locations</strong></td>
     <td>Local and remote files</td>
   </tr>
</table>

![json_data_structure](/byoc/json_data_structure.png)

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
     <th><strong>Item</strong></th>
     <th><strong>Description</strong></th>
   </tr>
   <tr>
     <td><strong>Multiple files per import</strong></td>
     <td>Yes</td>
   </tr>
   <tr>
     <td><strong>Maximum file size per import</strong></td>
     <td></td>
   </tr>
   <tr>
     <td><strong>Applicable data file locations</strong></td>
     <td>Remote files only</td>
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
     <th><strong>Item</strong></th>
     <th><strong>Description</strong></th>
   </tr>
   <tr>
     <td><strong>Multiple files per import</strong></td>
     <td>Yes</td>
   </tr>
   <tr>
     <td><strong>Data import from first-level subfolders</strong></td>
     <td>Yes</td>
   </tr>
   <tr>
     <td><strong>Maximum number of first-level subfolders</strong></td>
     <td>100</td>
   </tr>
   <tr>
     <td><strong>Maximum file size per import</strong><br/></td>
     <td></td>
   </tr>
   <tr>
     <td><strong>Applicable data file locations</strong></td>
     <td>Remote files only</td>
   </tr>
</table>

![numpy_file_structure](/byoc/numpy_file_structure.png)

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

![data-import-on-console](/byoc/data-import-on-console.png)

<Admonition type="info" icon="📘" title="Notes">

<p>For a free cluster, you can upload files of no greater than 512 MB at a time. And this figure is 1 GB for a serverless or dedicated cluster.</p>

</Admonition>

### From remote buckets{#from-remote-buckets}

Zilliz Cloud also supports data import from a bucket on **AWS S3**, **Google GCS**, and **Azure Blob** through the console, RESTful API, and SDKs.

![data-import-on-console-remote](/byoc/data-import-on-console-remote.png)

- **Object access URIs**

    <table>
       <tr>
         <th><strong>URI Style</strong></th>
         <th><strong>URI Format</strong></th>
       </tr>
       <tr>
         <td><strong>AWS S3 URI</strong></td>
         <td><code>s3://bucket-name/object-name</code></td>
       </tr>
       <tr>
         <td><strong>AWS Object URL, virtual-hosted–style</strong></td>
         <td><code>https://bucket-name.s3.region-code.amazonaws.com/object-name</code></td>
       </tr>
       <tr>
         <td><strong>AWS Object URL, path-style</strong></td>
         <td><code>https://s3.region-code.amazonaws.com/bucket-name/object-name</code></td>
       </tr>
    </table>

    For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

- **Quick examples**

    <table>
       <tr>
         <th><strong>File Type</strong></th>
         <th><strong>Quick Examples</strong></th>
       </tr>
       <tr>
         <td><strong>JSON</strong></td>
         <td><code>s3://bucket-name/json-folder/</code><br/> <code>s3://bucket-name/json-folder/data.json</code></td>
       </tr>
       <tr>
         <td><strong>NumPy</strong></td>
         <td><code>s3://bucket-name/numpy_folder/</code><br/> <code>s3://bucket-name/folder/*.npy</code></td>
       </tr>
       <tr>
         <td><strong>Parquet</strong></td>
         <td><code>s3://bucket-name/parquet-folder/</code><br/> <code>s3://bucket-name/parquet-folder/data.parquet</code></td>
       </tr>
    </table>

- **Required permissions**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

