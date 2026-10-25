---
title: "describeCollection() | Java | v2"
slug: /java/java/v2-Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作列出特定 Collection 的详细信息。 | Java | v2"
type: docx
token: WEE6ddFntowCIixVMCmc3pESnug
sidebar_position: 11
keywords: 
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - describeCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeCollection()

此操作列出特定 Collection 的详细信息。

```java
public DescribeCollectionResp describeCollection(DescribeCollectionReq request)
```

## 请求语法\{#request-syntax}

```java
describeCollection(DescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .collectionId(Long collectionId)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则默认使用当前 Database。

- `collectionName(String collectionName)` -

    目标 Collection 的名称。

- `collectionId(Long collectionId)` -

    Collection 的数字 ID。当您需要通过 ID 而不是名称来标识 Collection 时，请使用此项。

**返回类型：**

*DescribeCollectionResp*

**返回：**

一个包含指定 Collection 详细信息的 **DescribeCollectionResp** 对象。

**参数：**

- **collectionName** （*String*） -

    Collection 的名称。

- **collectionID** （*Long*） -

    Collection 的数字 ID。

- **databaseName** （*String*） -

    Collection 所属 Database 的名称。

- **description** （*String*） -

    Collection 的描述。

- **numOfPartitions** （*Long*） -

    Collection 中 Partition 的数量。

- **fieldNames** （*List&lt;String&gt;*） -

    Collection Schema 中所有字段的名称。

- **vectorFieldNames** （*List&lt;String&gt;*） -

    向量字段的名称。

- **primaryFieldName** （*String*） -

    主键字段的名称。

- **enableDynamicField** （*Boolean*） -

    是否启用了动态字段。

- **autoID** （*Boolean*） -

    主键是否自动生成。

- **collectionSchema** （*CreateCollectionReq.CollectionSchema*） -

    Collection 的 Schema。

- **createTime** （*Long*） -

    创建时间戳。

- **createUtcTime** （*Long*） -

    UTC 创建时间戳。

- **consistencyLevel** （*ConsistencyLevel*） -

    Collection 的一致性级别。

- **shardsNum** （*Integer*） -

    分片数量。

- **properties** （*Map&lt;String,String&gt;*） -

    Collection 的属性。

- **aliases** （*List&lt;String&gt;*） -

    附加到 Collection 的别名。

- **updateTimestamp** （*Long*） -

    最后更新时间戳。

- **enableNamespace** （*Boolean*） -

    是否启用了命名空间。

- **schemaVersion** （*Integer*） -

    Schema 版本。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
DescribeCollectionReq describeCollectionReq = DescribeCollectionReq.builder()
        .collectionName("test")
        .build();
DescribeCollectionResp describeCollectionResp = client.describeCollection(describeCollectionReq);
```
