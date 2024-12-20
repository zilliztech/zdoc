---
title: "Manage Collections (Console) | BYOC"
slug: /manage-collections-console
sidebar_label: "Manage Collections (Console)"
beta: FALSE
notebook: FALSE
description: "This guide provides step-by-step instructions for creating and managing collections in Zilliz Cloud. It is intended for users who prefer a visual interface. If you are familiar with SDKs, you can also create and manage collections through them. For more information, refer to Collection. | BYOC"
type: origin
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - manage
  - console

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

![create_custom_collection](/byoc/create_custom_collection.png)

1. On the **Create Collection** page, define the schema of your collection.

    - **Auto ID**: Automatically generates unique IDs for the primary key, without the need to manually assign or manage them during data insertion.

    - **Primary key field**: Available types are **Int64** or **VarChar**. When the field type is set to **VarChar**, specify **Max Length** for the field. If **Auto ID** is enabled, you do not need to configure the primary key field.

    - **Vector field**: Vector field in the collection. You can add one or more vector fields to a collection, with a maximum of 4 vector fields per collection. When using multiple vector fields, you can set the same or different data types for these fields. For example, combine `FLOAT_VECTOR` and `BFLOAT16_VECTOR`. For more information on vector field types, refer to [Schema Explained](./schema-explained).

        - **Dimension**: The dimension value of a vector field. The requirement for the **Dimension** value varies depending on the type of the vector field:

            - `FLOAT_VECTOR`, `FLOAT16_VECTOR`, and `BFLOAT16_VECTOR`: The dimension value must be an integer, ranging from 2 to 32,768.

            - `SPARSE_FLOAT_VECTOR`: The dimension is not required.

            - `BINARY_VECTOR`: The dimension must be a multiple of 8, ranging from 8 to 32,768 * 8.

        - **Index** & **Index Parameter**: The index type defaults to **AUTOINDEX** with metrics such as **Cosine**, **IP**, **L2**, **JACCARD**, and **HAMMING**. For details, refer to [Metric Types](./search-metrics-explained) and [AUTOINDEX Explained](./autoindex-explained).

    - **Additional fields**: Click **+ Field** below **Schema Preview** to add more fields. For details, refer to [Schema Explained](./schema-explained).

1. (Optional) In **Advanced Settings**, consider dynamic fields and partition keys for advanced configurations.

    - **Dynamic Field**: Allow the insertion of new fields beyond the predefined schema. For more information, refer to [Schema Explained](./schema-explained).

    - **Partition Key**: Improve query efficiency by grouping data into partitions. For more information, refer to [Use Partition Key](./use-partition-key).

1. Click **Create Collection**. Then, you can [insert data](./insert-entities) into your collection.

### Method 2: Use example data{#method-2-use-example-data}

Select **Load Sample Data**, review the preset collection, and confirm creation.

<Admonition type="info" icon="📘" title="Notes">

<p>When you create a sample collection, Zilliz Cloud takes care of all the details, but does not allow configuration adjustments.</p>

</Admonition>

![create_sample_collection](/byoc/create_sample_collection.png)

### Method 3: Clone existing collection{#method-3-clone-existing-collection}

Choose **Clone Collection** from the **Actions** menu.

1. Enter the new collection's name and description.

1. Select the scope of the clone action. You can either clone both the schema and existing data of a collection or just the collection schema without data in the current cluster.

1. Click **Clone**.

    ![copy_collection](/byoc/copy_collection.png)

1. You can check the clone progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, a new collection with the specified attributes is created in the current cluster.

    <Admonition type="info" icon="📘" title="Notes">

    <p>A job record will be generated only if you choose clone collection with both data and schema. Cloning a collection with schema only will not trigger a job record.</p>

    </Admonition>

## View collections{#view-collections}

You can view the list of all existing collections created in your cluster, or click the name of a collection to view its details.

![view_collection](/byoc/view_collection.png)

## Load & release collection{#load-and-release-collection}

In Zilliz Cloud, all search and query operations are performed in memory. Thus, loading a collection involves writing its data into memory, which is essential for these operations. Conversely, releasing a collection frees up memory space.

![load_release_collection](/byoc/load_release_collection.png)

## Move collection to another database{#move-collection-to-another-database}

You can move a collection from one database to another.

![move-collection-to-another-database](/byoc/move-collection-to-another-database.png)

## Drop collection{#drop-collection}

Dropping a collection is a permanent action used when a collection is no longer required. It helps in saving resources but needs to be done cautiously.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Dropping a collection irreversibly deletes all data within it.</p>

</Admonition>

![drop_collection](/byoc/drop_collection.png)

## Limits on collections{#limits-on-collections}

<table>
   <tr>
     <th><p><strong>Cluster Type</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
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

