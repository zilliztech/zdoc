---
slug: /manage-collections-console
sidebar_label: Console
beta: FALSE
notebook: FALSE
type: origin
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 1

---

import Admonition from '@theme/Admonition';


# Manage Collections (Console)

This guide provides step-by-step instructions for creating and managing collections in Zilliz Cloud. It is intended for users who prefer a visual interface. If you are familiar with SDKs, you can also create and manage collections through them. For more information, refer to [Manage Collections (SDKs)](./manage-collections-sdks).

## Create collection{#create-collection}

Zilliz Cloud offers three methods to create a collection, each catering to different needs:

- **[Use Your Own Data](./manage-collections-console#method-1-use-your-own-data)**: Ideal for users who desire full control. You'll have the autonomy to define the schema and the index parameters according to your dataset and specific needs.

- **[Use Example Data](./manage-collections-console#method-2-use-example-data)**: Ideal for users who are new to Zilliz Cloud seeking a quick setup. Zilliz Cloud offers a sample collection with a schema matching the [example dataset](./example-dataset). This method is hassle-free, but it does not allow configuration modifications.

- **[Copy Existing Collection](./manage-collections-console#method-3-copy-existing-collection)**: Suitable for duplicating existing collections, saving time and effort in setup.

### Method 1: Use your own data{#method-1-use-your-own-data}

For complete control over your collection, follow these steps.

1. On the **Create Collection** page, define the schema of your collection.

    - **Auto ID**: Automatically generates unique IDs for the primary key, without the need to manually assign or manage them during data insertion.

    - **Primary key field**: Available types are **Int64** or **VarChar**. Not required if **Auto ID** is enabled.

    - **Vector field**: Dimension for vector embeddings. Defaults to **AUTOINDEX** with metrics such as **Cosine**, **IP**, or **L2**. For details, refer to [Similarity Metrics Explained](./search-metrics-explained) and [AUTOINDEX Explained](./autoindex-explained).

    - **Additional fields**: Click **+ Field** below **Schema Preview** to add more scalar fields. For details, refer to [Schema Explained](./schema-explained).

1. (Optional) In **Advanced Settings**, consider dynamic fields and partition keys for advanced configurations.

    - **Dynamic Field**: Allow the insertion of new fields beyond the predefined schema. For more information, refer to [Schema Explained](./schema-explained).

    - **Partition Key**: Improve query efficiency by grouping data into partitions. For more information, refer to [Use Partition Key](./use-partition-key).

1. Click **Create Collection**. Then, you can [insert data](./insert-update-delete) into your collection.

![create_custom_collection](/img/create_custom_collection.png)

### Method 2: Use example data{#method-2-use-example-data}

Select **Create Sample Collection** from the **Actions** menu, review the preset collection, and confirm creation.

<Admonition type="info" icon="📘" title="Notes">

<p>When you create a sample collection, Zilliz Cloud takes care of all the details, but does not allow configuration adjustments.</p>

</Admonition>

![create_sample_collection](/img/create_sample_collection.png)

### Method 3: Copy existing collection{#method-3-copy-existing-collection}

Choose **Copy Collection** from the **Actions** menu, set the new collection's name and description, and create.

![copy_collection](/img/copy_collection.png)

## View collections{#view-collections}

You can view the list of all existing collections created in your cluster, or click the name of a collection to view its details.

![view_collection](/img/view_collection.png)

## Load & release collection{#load-and-release-collection}

In Zilliz Cloud, all search and query operations are performed in memory. Thus, loading a collection involves writing its data into memory, which is essential for these operations. Conversely, releasing a collection frees up memory space.

![load_release_collection](/img/load_release_collection.png)

## Drop collection{#drop-collection}

Dropping a collection is a permanent action used when a collection is no longer required. It helps in saving resources but needs to be done cautiously.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Dropping a collection irreversibly deletes all data within it.</p>

</Admonition>

![drop_collection](/img/drop_collection.png)

## Collection limits{#collection-limits}

For a free cluster, you can create up to two collections. 

For a serverless cluster, you can create up to ten collections.

For a dedicated cluster, the number of collections you can create varies with the CU that your cluster uses.

<table>
   <tr>
     <th></th>
     <th><p>Maximum number of collections</p></th>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p><strong>2</strong></p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p><strong>10</strong></p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster (8 CUs and less)</p></td>
     <td><p><strong>32</strong></p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster (More than 8 CUs)</p></td>
     <td><p><strong>256</strong></p></td>
   </tr>
</table>

