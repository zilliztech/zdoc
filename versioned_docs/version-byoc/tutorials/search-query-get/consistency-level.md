---
title: "Consistency Level | BYOC"
slug: /consistency-level
sidebar_label: "Consistency Level"
beta: FALSE
notebook: FALSE
description: "As a distributed vector database, Milvus offers multiple levels of consistency to ensure that each node or replica can access the same data during read and write operations. Currently, the supported levels of consistency include Strong, Bounded, Eventually, and Session, with Bounded being the default level of consistency used. | BYOC"
type: origin
token: Xx9EwWtekinLZfkWKqic37dDnFb
sidebar_position: 15
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - consistency level

---

import Admonition from '@theme/Admonition';


# Consistency Level

As a distributed vector database, Milvus offers multiple levels of consistency to ensure that each node or replica can access the same data during read and write operations. Currently, the supported levels of consistency include **Strong**, **Bounded**, **Eventually**, and **Session**, with **Bounded** being the default level of consistency used.

## Overview{#overview}

Milvus is a system that separates storage and computation. In this system, **DataNodes** are responsible for the persistence of data and ultimately store it in distributed object storage such as MinIO/S3. **QueryNodes** handle computational tasks like Search. These tasks involve processing both **batch data** and **streaming data**. Simply put, batch data can be understood as data that has already been stored in object storage while streaming data refers to data that has not yet been stored in object storage. Due to network latency, QueryNodes often do not hold the most recent streaming data. Without additional safeguards, performing Search directly on streaming data may result in the loss of many uncommitted data points, affecting the accuracy of search results.

Milvus Commercial Edition is a system that separates storage and computation. In this system, DataNodes are responsible for the persistence of data and ultimately store it in distributed object storage such as MinIO/S3. QueryNodes handle computational tasks like Search. These tasks involve processing both batch data and streaming data. Simply put, batch data can be understood as data that has already been stored in object storage, while streaming data refers to data that has not yet been stored in object storage. Due to network latency, QueryNodes often do not hold the most recent streaming data. Without additional safeguards, performing Search directly on streaming data may result in the loss of many uncommitted data points, affecting the accuracy of search results.

![UlOJwpWuKhj5LAbGSp9cwMFznEb](/byoc/UlOJwpWuKhj5LAbGSp9cwMFznEb.png)

As shown in the figure above, QueryNodes can receive both streaming data and batch data simultaneously after receiving a Search request. However, due to network latency, the streaming data obtained by QueryNodes may be incomplete.

To address this issue, Milvus timestamps each record in the data queue and continuously inserts synchronization timestamps into the data queue. Whenever a synchronization timestamp (syncTs) is received, QueryNodes sets it as the ServiceTime, meaning that QueryNodes can see all data prior to that Service Time. Based on the ServiceTime, Milvus can provide guarantee timestamps (GuaranteeTs) to meet different user requirements for consistency and availability. Users can inform QueryNodes of the need to include data prior to a specified point in time in the search scope by specifying GuaranteeTs in their Search requests.

![Owddb7D3Fo8zyFxJgWWcZCxanIf](/byoc/Owddb7D3Fo8zyFxJgWWcZCxanIf.png)

As shown in the figure above, if GuaranteeTs is less than ServiceTime, it means that all data before the specified time point has been fully written to disk, allowing QueryNodes to immediately perform the Search operation. When GuaranteeTs is greater than ServiceTime, QueryNodes must wait until ServiceTime exceeds GuaranteeTs before they can execute the Search operation.

Users need to make a trade-off between query accuracy and query latency. If users have high consistency requirements and are not sensitive to query latency, they can set GuaranteeTs to a value as large as possible; if users wish to receive search results quickly and are more tolerant of query accuracy, then GuaranteeTs can be set to a smaller value.

![Y9YabwvmjoWMXhxt9kRc8Atmnid](/byoc/Y9YabwvmjoWMXhxt9kRc8Atmnid.png)

Milvus provides four types of consistency levels with different GuaranteeTs.

- **Strong**

    The latest timestamp is used as the GuaranteeTs, and QueryNodes have to wait until the ServiceTime meets the GuaranteeTs before executing Search requests.

- **Eventual**

    The GuaranteeTs is set to an extremely small value, such as 1, to avoid consistency checks so that QueryNodes can immediately execute Search requests upon all batch data.

- **Bounded Staleness**

    The GuranteeTs is set to a time point earlier than the latest timestamp to make QueryNodes to perform searches with a tolerance of certain data loss.

- **Session**

    The latest time point at which the client inserts data is used as the GuaranteeTs so that QueryNodes can perform searches upon all the data inserted by the client.

Milvus uses Bounded Staleness as the default consistency level. If the GuaranteeTs is left unspecified, the latest ServiceTime is used as the GuaranteeTs.

## Set Consistency Level{#set-consistency-level}

You can set different consistency levels when you create a collection as well as perform searches and queries.

### Set Consistency Level upon Creating Collection{#set-consistency-level-upon-creating-collection}

When creating a collection, you can set the consistency level for the searches and queries within the collection. The following code example sets the consistency level to **Strong**.

[Unsupported block type]

Possible values for the `consistency_level` parameter are `Strong`, `Bounded`, `Eventually`, and `Session`.

### Set Consistency Level in Search{#set-consistency-level-in-search}

You can always change the consistency level for a specific search. The following code example sets the consistency level back to the **Bounded**. The change applies only to the current search request.

[Unsupported block type]

This parameter is also available in hybrid searches and the search iterator. Possible values for the `consistency_level` parameter are `Strong`, `Bounded`, `Eventually`, and `Session`.

### Set Consistency Level in Query{#set-consistency-level-in-query}

You can always change the consistency level for a specific search. The following code example sets the consistency level to the **Eventually**. The setting applies only to the current query request.

[Unsupported block type]

This parameter is also available in the query iterator. Possible values for the `consistency_level` parameter are `Strong`, `Bounded`, `Eventually`, and `Session`.