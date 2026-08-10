---
title: "dropIndexProperties() | Java | v2"
slug: /java/java/v2-Management-dropIndexProperties
sidebar_label: "dropIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将指定的索引属性重置为其默认值。 | Java | v2"
type: docx
token: IdNAdlMhjoM40pxjpKecpc7inbd
sidebar_position: 6
keywords: 
  - rag 向量 Database
  - 什么是向量数据库
  - 什么是向量 Database
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - 云
  - dropIndexProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropIndexProperties()

此操作会将指定的索引属性重置为其默认值。

```java
public Void dropIndexProperties(DropIndexPropertiesReq request)
```

## 请求语法\{#request-syntax}

```java
dropIndexProperties(DropIndexPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .indexName(String indexName)
    .propertyKeys(List<String> propertyKeys)
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

- `propertyKeys(List<String> propertyKeys)`

    要删除的属性。请注意，属性值应为字符串。可用的 Database 属性如下：

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
import io.milvus.v2.service.index.request.DropIndexPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop the `mmap.enabled` property
List<String> propertyKeys = new ArrayList<>()
propertyKeys.add("mmap.enabled")

DropIndexPropertiesReq dropIndexPropertiesReq = DropIndexPropertiesReq.builder()
        .collectionName("test")
        .indexName("vector")
        .propertyKeys(propertyKeys)
        .build();
client.dropIndexProperties(dropIndexPropertiesReq)
```

