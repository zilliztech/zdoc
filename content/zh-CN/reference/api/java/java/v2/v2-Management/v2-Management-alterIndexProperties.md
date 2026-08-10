---
title: "alterIndexProperties() | Java | v2"
slug: /java/java/v2-Management-alterIndexProperties
sidebar_label: "alterIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改指定索引的属性。 | Java | v2"
type: docx
token: ITkydrfmroQyLLxusZtc6t1nnjf
sidebar_position: 1
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - alterIndexProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterIndexProperties()

此操作会修改指定索引的属性。

```java
public Void alterIndexProperties(AlterIndexPropertiesReq request)
```

## 请求语法\{#request-syntax}

```java
alterIndexProperties(AlterIndexPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexName(String indexName)
    .properties(Map<String, String> properties)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    持有目标 Collection 的 Database 名称。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `indexName(String indexName)`

    目标索引的名称。

- `properties(Map<String, String> properties)`

    要修改的属性及其预期值。请注意，属性值应为字符串。可用的 Database 属性如下：

    - **mmap.enabled** -

        是否为当前索引启用 mmap。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.AlterIndexPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the `mmap.enabled` property
Map<String, String> properties = new HashMap<>()
properties.put("mmap.enabled", "true")

AlterIndexPropertiesReq alterIndexPropertiesReq = AlterIndexPropertiesReq.builder()
        .collectionName("test")
        .indexName("vector")
        .properties(properties)
        .build();
client.alterIndexProperties(alterCollectionFieldReq)
```

