---
title: "Insert Entities | Cloud"
slug: /insert-entities
sidebar_label: "Insert Entities"
beta: FALSE
notebook: FALSE
description: "Entities in a collection are data records that share the same set of fields. Field values in every data record form an entity. This page introduces how to insert entities into a collection. | Cloud"
type: origin
token: L5jawEj7FiBXWZkGhLgcQCWQnDd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - insert
  - insert entities

---

import Admonition from '@theme/Admonition';


# Insert Entities

Entities in a collection are data records that share the same set of fields. Field values in every data record form an entity. This page introduces how to insert entities into a collection.

## Overview{#overview}

In Milvus, an **Entity** refers to data records in a **Collection** that share the same **Schema**, with the data in each field of a row constituting an Entity. Therefore, the Entities within the same Collection have the same attributes (such as field names, data types, and other constraints).

When inserting an Entity into a Collection, the Entity to be inserted can only be successfully added if it contains all the fields defined in the Schema. The inserted Entity will enter a Partition named **_default** in the order of insertion. Provided that a certain Partition exists, you can also insert Entities into that Partition by specifying the Partition name in the insertion request.

Milvus also supports dynamic fields to maintain the scalability of the Collection. When the dynamic field is enabled, you can insert fields that are not defined in the Schema into the Collection. These fields and values will be stored as key-value pairs in a reserved field named **$meta**. For more information about dynamic fields, please refer to Dynamic Field.

## Insert Entities into a Collection{#insert-entities-into-a-collection}

Before inserting data, you need to organize your data into a list of dictionaries according to the Schema, with each dictionary representing an Entity and containing all the fields defined in the Schema. If the Collection has the dynamic field enabled, each dictionary can also include fields that are not defined in the Schema.

In this section, you will insert Entities into a Collection created [in the quick-setup manner](./quick-setup-collections). A Collection created in this manner has only two fields, named **id** and **vector**. Additionally, this Collection has the dynamic field enabled, so the Entities in the example code include a field called **color** that is not defined in the Schema.

[Unsupported block type]

## Insert Entities into a Partition{#insert-entities-into-a-partition}

You can also insert entities into a specified partition. The following code snippets assume that you have a partition named **PartitionA** in your collection.

[Unsupported block type]

