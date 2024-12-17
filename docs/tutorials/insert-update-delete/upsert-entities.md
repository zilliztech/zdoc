---
title: "Upsert Entities | Cloud"
slug: /upsert-entities
sidebar_label: "Upsert Entities"
beta: FALSE
notebook: FALSE
description: "The Upsert operation combines the actions of updating and inserting data. Milvus determines whether to perform an update or an insert operation by checking if the primary key exists. This section will introduce how to Upsert an Entity and the specific behaviors of the Upsert operation in different scenarios. | Cloud"
type: origin
token: YtJPwEVETiTaPMkWSfAccjXTnge
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - upsert
  - update
  - insert

---

import Admonition from '@theme/Admonition';


# Upsert Entities

The Upsert operation combines the actions of updating and inserting data. Milvus determines whether to perform an update or an insert operation by checking if the primary key exists. This section will introduce how to Upsert an Entity and the specific behaviors of the Upsert operation in different scenarios.

## Overview{#overview}

When you need to update an Entity in a Collection or are not sure whether to update or insert, you can try using the Upsert operation. When using this operation, it is essential to ensure that the Entity included in the Upsert request contains the primary key; otherwise, an error will occur. Upon receiving an Upsert request, Milvus will execute the following process:

1. Check whether the primary field of the Collection has AutoId enabled.

    1.  If it is, Milvus will replace the primary key in the Entity with an automatically generated primary key and insert the data.

    1. If not, Milvus will use the primary key carried by the Entity to insert the data.

1. Perform a delete operation based on the primary key value of the Entity included in the Upsert request.

![K2SXwCq8ThyBnGb9LxFceCk5nwe](/img/K2SXwCq8ThyBnGb9LxFceCk5nwe.png)

## Upsert Entity in a Collection{#upsert-entity-in-a-collection}

In this section, you will upsert Entities into a Collection created [in the quick-setup manner](./quick-setup-collections). A Collection created in this manner has only two fields, named **id** and **vector**. Additionally, this Collection has the dynamic field enabled, so the Entities in the example code include a field called **color** that is not defined in the Schema.

[Unsupported block type]

## Upsert Entities in a Partition{#upsert-entities-in-a-partition}

You can also insert entities into a specified partition. The following code snippets assume that you have a partition named **PartitionA** in your collection.

[Unsupported block type]

