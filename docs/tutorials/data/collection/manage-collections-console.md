---
title: "Manage Collections (Console) | Cloud"
slug: /manage-collections-console
sidebar_label: "Manage Collections (Console)"
beta: FALSE
notebook: FALSE
description: "This guide provides step-by-step instructions for creating and managing collections in Zilliz Cloud. It is intended for users who prefer a visual interface. If you are familiar with SDKs, you can also create and manage collections through them. For more information, refer to Collection. | Cloud"
type: origin
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 11
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - manage
  - console
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search

---

import Admonition from '@theme/Admonition';


# Manage Collections (Console)

This guide provides step-by-step instructions for creating and managing collections in Zilliz Cloud. It is intended for users who prefer a visual interface. If you are familiar with SDKs, you can also create and manage collections through them. For more information, refer to [Collection](./collection).

## Create collection{#create-collection}

Zilliz Cloud offers three methods to create a collection, each catering to different needs:

- **[Use Your Own Data](./manage-collections-console#method-1-use-your-own-data)**: Ideal for users who desire full control. You'll have the autonomy to define the schema and the index parameters according to your dataset and specific needs.

- **[Use Example Data](./manage-collections-console#method-2-use-example-data)**: Ideal for users who are new to Zilliz Cloud seeking a quick setup. Zilliz Cloud offers a sample collection with a schema matching the example dataset. This method is hassle-free, but it does not allow configuration modifications.

- **[Clone Existing Collection](./manage-collections-console#method-3-clone-existing-collection)**: Suitable for duplicating existing collections within the cluster, saving time and effort in setup.

### Method 1: Use your own data{#method-1-use-your-own-data}

For complete control over your collection, follow these steps.

![create_custom_collection](/img/create_custom_collection.png)

1. On the **Create Collection** page, define the schema of your collection.

    <table>
       <tr>
         <th><p>Config</p></th>
         <th><p>Description</p></th>
       </tr>
       <tr>
         <td><p>Field Name</p></td>
         <td><p>The name of the field. Each collection has the unique primary key and at least one vector field (up to 4).</p><p>In default schema design, Zilliz Cloud reserves the primary field (<code>primary_key</code>) and a float vector (<code>vector</code>). You can customize their settings as needed.</p></td>
       </tr>
       <tr>
         <td><p>Field Type</p></td>
         <td><p>The data type of the field. Fields supported by Zilliz Cloud fall into these main categories: primary key, vector field, and scalar field. The data types supported for different fields vary based on the field types.</p><ul><li><p>Primary field: <code>INT64</code>, <code>VARCHAR</code></p></li><li><p>Vector field: <code>FLOAT_VECTOR</code>, <code>BINARY_VECTOR</code>, <code>FLOAT16_VECTOR</code>, <code>BFLOAT16_VECTOR</code>, <code>SPARSE_FLOAT_VECTOR</code>.</p></li><li><p>Scalar field: <code>INT64</code>, <code>VARCHAR</code>, <code>INT8</code>, <code>INT16</code>, <code>INT32</code>, <code>FLOAT</code>, <code>DOUBLE</code>, <code>BOOL</code>, <code>JSON</code>, <code>ARRAY</code>.</p><p>For details, refer to <a href="./schema-explained">Schema Explained</a>.</p></li></ul></td>
       </tr>
       <tr>
         <td><p>Index</p></td>
         <td><p>Whether to index the field for better search performance. Once enabled, Zilliz Cloud creates an AUTOINDEX for your field. For details, refer to <a href="./autoindex-explained">AUTOINDEX Explained</a>.</p></td>
       </tr>
       <tr>
         <td><p>Metric Type</p></td>
         <td><p>The type of metric used to measure the similarity between vectors. This parameter is configurable only for a vector field. For details, refer to <a href="./search-metrics-explained">Metric Types</a>.</p></td>
       </tr>
       <tr>
         <td><p>Default Value</p></td>
         <td><p>Whether to set a default value for the field. This parameter is configurable only for a scalar field (excluding the primary field). For details, refer to <a href="./nullable-and-default">Nullable & Default</a>.</p></td>
       </tr>
       <tr>
         <td><p>Nullable</p></td>
         <td><p>Whether to allow null values for the field. This parameter is configurable only for a scalar field (excluding the primary field). For details, refer to <a href="./nullable-and-default">Nullable & Default</a>.</p></td>
       </tr>
       <tr>
         <td><p>Mmap</p></td>
         <td><p>Whether to enable MMAP. This parameter is configurable only for a scalar field (excluding the primary field). For details, refer to <a href="./use-mmap">Use mmap</a>.</p></td>
       </tr>
       <tr>
         <td><p>Description</p></td>
         <td><p>Optional. The description of the field.</p></td>
       </tr>
       <tr>
         <td><p>Auto ID</p></td>
         <td><p>Whether to enable Auto ID for the primary field. Once enabled, Zilliz Cloud automatically generates unique IDs for the primary key, without the need to manually assign or manage them during data insertion.</p></td>
       </tr>
    </table>

1. (Optional) In **Advanced Settings**, consider dynamic fields and partition keys for advanced configurations.

    - **Dynamic Field**: Allow the insertion of new fields beyond the predefined schema. For more information, refer to [Schema Explained](./schema-explained).

    - **Partition Key**: Improve query efficiency by grouping data into partitions. For more information, refer to [Use Partition Key](./use-partition-key).

1. Click **Create Collection**. Then, you can [insert data](./insert-entities) into your collection.

### Method 2: Use example data{#method-2-use-example-data}

Select **Load Sample Data**, review the preset collection, and confirm creation.

<Admonition type="info" icon="📘" title="Notes">

<p>When you create a sample collection, Zilliz Cloud takes care of all the details, but does not allow configuration adjustments.</p>

</Admonition>

![create_sample_collection](/img/create_sample_collection.png)

### Method 3: Clone existing collection{#method-3-clone-existing-collection}

Choose **Clone Collection** from the **Actions** menu.

1. Enter the new collection's name and description.

1. Select the scope of the clone action. You can either clone both the schema and existing data of a collection or just the collection schema without data in the current cluster.

1. Click **Clone**.

    ![copy_collection](/img/copy_collection.png)

1. You can check the clone progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, a new collection with the specified attributes is created in the current cluster.

    <Admonition type="info" icon="📘" title="Notes">

    <p>A job record will be generated only if you choose clone collection with both data and schema. Cloning a collection with schema only will not trigger a job record.</p>

    </Admonition>

## View collections{#view-collections}

You can view the list of all existing collections created in your cluster, or click the name of a collection to view its details.

![view_collection](/img/view_collection.png)

## Load & release collection{#load-and-release-collection}

In Zilliz Cloud, all search and query operations are performed in memory. Thus, loading a collection involves writing its data into memory, which is essential for these operations. Conversely, releasing a collection frees up memory space.

![load_release_collection](/img/load_release_collection.png)

## Move collection to another database{#move-collection-to-another-database}

You can move a collection from one database to another.

![move-collection-to-another-database](/img/move-collection-to-another-database.png)

## Drop collection{#drop-collection}

Dropping a collection is a permanent action used when a collection is no longer required. It helps in saving resources but needs to be done cautiously.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Dropping a collection irreversibly deletes all data within it.</p>

</Admonition>

![drop_collection](/img/drop_collection.png)

## Limits on collections{#limits-on-collections}

<table>
   <tr>
     <th><p><strong>Cluster Type</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p>5</p></td>
     <td><p>You can create up to 5 collections.</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>100</p></td>
     <td><p>You can create up to 100 collections.</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster</p></td>
     <td><p>64 per CU, and &lt;= 4096</p></td>
     <td><p>You can create up to 64 collections per CU used in a dedicated cluster and no more than 4,096 collections in the cluster.</p></td>
   </tr>
</table>

In addition to the limits on the number of collections per cluster, Zilliz Cloud also applies limits on consumed capacity, which indicates the physical resources consumed by your cluster. The following table lists the limits on the general capacity of a cluster.

<table>
   <tr>
     <th><p><strong>Number of CUs</strong></p></th>
     <th><p><strong>General Capacity</strong></p></th>
   </tr>
   <tr>
     <td><p>1-8 CUs</p></td>
     <td><p>&lt;= 4,096</p></td>
   </tr>
   <tr>
     <td><p>12+ CUs</p></td>
     <td><p>Min(512 x Number of CUs, 65536)</p></td>
   </tr>
</table>

For details on the calculation of general and consumed capacity, refer to [Zilliz Cloud Limits](./limits#collections).

