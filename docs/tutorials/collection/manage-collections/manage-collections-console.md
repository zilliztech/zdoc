---
slug: /manage-collections-console
beta: FALSE
notebook: FALSE
token: CmR5wFcybi3iMokOJBxcXDQcntg
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Manage Collections (Console)

This guide provides step-by-step instructions for creating and managing collections in Zilliz Cloud. It is intended for users who prefer a visual interface. If you are familiar with SDKs, you can also create and manage collections through them. For more information, refer to [Manage Collections (SDKs)](./manage-collections-sdks).

## Create collection{#create-collection}

Zilliz Cloud offers three methods to create a collection, each catering to different needs:

- __Use Your Own Data__[](./manage-collections-console#method-1-use-your-own-data)__: Ideal for users who desire full control. You'll have the autonomy to define the schema and the index parameters according to your dataset and specific needs.

- __Use Example Data__[](./manage-collections-console#method-2-use-example-data)__: Ideal for users who are new to Zilliz Cloud seeking a quick setup. Zilliz Cloud offers a sample collection with a schema matching the [example dataset](./example-dataset). This method is hassle-free, but it does not allow configuration modifications.

- __Copy Existing Collection__[](./manage-collections-console#method-3-copy-existing-collection)__: Suitable for duplicating existing collections, saving time and effort in setup.

### Method 1: Use your own data{#method-1-use-your-own-data}

For complete control over your collection, follow these steps.

1. On the __Create Collection__ page, define the schema of your collection.

    - __Auto ID__: Automatically generates unique IDs for the primary key, without the need to manually assign or manage them during data insertion.

    - __Primary key field__: Available types are __Int64__ or __VarChar__. Not required if __Auto ID__ is enabled.

    - __Vector field__: Dimension for vector embeddings. Defaults to __AUTOINDEX__ with metrics such as __Cosine__, __IP__, or __L2__. For details, refer to [Similarity Metrics Explained](./search-metrics-explained) and [AUTOINDEX Explained](./autoindex-explained).

    - __Additional fields__: Click __+ Field__ below __Schema Preview__ to add more scalar fields. For details, refer to [Schema Explained](./schema-explained).

1. (Optional) In __Advanced Settings__, consider dynamic fields and partition keys for advanced configurations.

    - __Dynamic Field__: Allow the insertion of new fields beyond the predefined schema. For more information, refer to [Schema Explained](./schema-explained).

    - __Partition Key__: Improve query efficiency by grouping data into partitions. For more information, refer to [Use Partition Key](./use-partition-key).

1. Click __Create Collection__. Then, you can [insert data](./insert-update-delete) into your collection.

![create_custom_collection](/img/create_custom_collection.png)

### Method 2: Use example data{#method-2-use-example-data}

Select __Create Sample Collection__ from the __Actions__ menu, review the preset collection, and confirm creation.

<Admonition type="info" icon="📘" title="Notes">

<p>When you create a sample collection, Zilliz Cloud takes care of all the details, but does not allow configuration adjustments.</p>

</Admonition>

![create_sample_collection](/img/create_sample_collection.png)

### Method 3: Copy existing collection{#method-3-copy-existing-collection}

Choose __Copy Collection__ from the __Actions__ menu, set the new collection's name and description, and create.

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

For a serverless cluster, you can create up to two collections. For a dedicated cluster, the number of collections you can create varies with the CU that your cluster uses.

|                                      |  Maximum number of collections |
| ------------------------------------ | ------------------------------ |
|  Serverless cluster                  |  __2__                         |
|  Dedicated cluster (8 CUs and less)  |  __32__                        |
|  Dedicated cluster (More than 8 CUs) |  __256__                       |

