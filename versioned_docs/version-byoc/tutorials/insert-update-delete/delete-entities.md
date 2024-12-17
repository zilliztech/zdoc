---
title: "Delete Entities | BYOC"
slug: /delete-entities
sidebar_label: "Delete Entities"
beta: FALSE
notebook: FALSE
description: "You can delete the entities that are no longer needed by filtering conditions or their primary keys. | BYOC"
type: origin
token: RhKcwNACpi3WihkTzo8cr4BCnee
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - delete
  - delete entities

---

import Admonition from '@theme/Admonition';


# Delete Entities

You can delete the entities that are no longer needed by filtering conditions or their primary keys.

## Delete Entities by Filtering Conditions{#delete-entities-by-filtering-conditions}

When deleting multiple entities that share some attributes in a batch, you can use filter expressions. The example code below uses the **in** operator to bulk delete all Entities with thier **color** field set to the values of **red** and **green**. You can also use other operators to construct filter expressions that meet your requirements. For more information about filter expressions, please refer to [Filtering](./filtering).

[Unsupported block type]

## Delete Entities by Primary Keys{#delete-entities-by-primary-keys}

In most cases, a primary key uniquely identifies an Entity. You can delete Entities by setting their primary keys in the delete request. The example code below demonstrates how to delete two entities with primary keys **18** and **19**.

[Unsupported block type]

## Delete Entities from Partitions{#delete-entities-from-partitions}

You can also delete entities stored in specific partitions. The following code snippets assume that you have a partition named **PartitionA** in your collection. 

[Unsupported block type]

