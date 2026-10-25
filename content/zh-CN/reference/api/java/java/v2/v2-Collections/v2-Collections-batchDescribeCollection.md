---
title: "batchDescribeCollection() | Java | v2"
slug: /java/java/v2-Collections-batchDescribeCollection
sidebar_label: "batchDescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作批量检索多个 Collection 的描述。 | Java | v2"
type: docx
token: B4CpdqvN7oZy3zxB9fscTAG8n7E
sidebar_position: 30
keywords: 
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - batchDescribeCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# batchDescribeCollection()

此操作批量检索多个 Collection 的描述。

```java
public List<DescribeCollectionResp> batchDescribeCollection(BatchDescribeCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
batchDescribeCollection(BatchDescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .collectionIds(List<Long> collectionIds)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则默认为当前 Database。

- `collectionNames(List<String> collectionNames)` -

    要批量描述的 Collection 名称列表。

- `collectionIds(List<Long> collectionIds)` -

    要批量描述的 Collection ID 列表。

**返回类型：**

*List&lt;DescribeCollectionResp&gt;*

**返回：**

**DescribeCollectionResp** 对象列表。每个 **DescribeCollectionResp** 对象包含以下字段：

**参数：**

- **collectionName** (*String*) -

    Collection 的名称。

- **collectionID** (*Long*) -

    Collection 的 ID。

- **databaseName** (*String*) -

    包含该 Collection 的 Database 的名称。

- **description** (*String*) -

    Collection 的描述。

- **numOfPartitions** (*Long*) -

    Collection 中 Partition 的数量。

- **fieldNames** (*List&lt;String&gt;*) -

    Collection 中所有字段的名称列表。

- **vectorFieldNames** (*List&lt;String&gt;*) -

    Collection 中向量字段的名称列表。

- **primaryFieldName** (*String*) -

    Collection 主键字段的名称。

- **enableDynamicField** (*Boolean*) -

    是否为 Collection 启用动态字段。

- **autoID** (*Boolean*) -

    Milvus 是否为 Collection 自动生成主键值。

- **collectionSchema** (*CreateCollectionReq.CollectionSchema*) -

    Collection 的 Schema。

- **createTime** (*Long*) -

    Collection 创建时的时间戳。

- **createUtcTime** (*Long*) -

    Collection 创建时的 UTC 时间戳。

- **consistencyLevel** (*ConsistencyLevel*) -

    Collection 的一致性级别。

- **shardsNum** (*Integer*) -

    Collection 中分片的数量。

- **properties** (*Map&lt;String, String&gt;*) -

    Collection 的属性。

- **aliases** (*List&lt;String&gt;*) -

    Collection 的别名列表。

- **updateTimestamp** (*Long*) -

    Collection 上次更新时间的时间戳。

- **enableNamespace** (*Boolean*) -

    是否为 Collection 启用命名空间功能。

- **schemaVersion** (*Integer*) -

    Collection 的 Schema 版本。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.BatchDescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;
import java.util.Collections;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
BatchDescribeCollectionReq describeCollectionReq = BatchDescribeCollectionReq.builder()
        .collectionNames(Collections.singletonList("test"))
        .build();
List<DescribeCollectionResp> batchResp = client.batchDescribeCollection(describeCollectionReq);
```
