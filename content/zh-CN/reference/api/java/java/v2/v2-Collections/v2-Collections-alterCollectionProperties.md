---
title: "alterCollectionProperties() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionProperties
sidebar_label: "alterCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改指定 collection 的属性。 | Java | v2"
type: docx
token: JQ4QdTaadoIDSPxDJRZcSDu3n5g
sidebar_position: 3
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionProperties()

此操作会修改指定 collection 的属性。

```java
public Void alterCollectionProperties(AlterCollectionPropertiesReq request)
```

## 请求语法\{#request-syntax}

```java
alterCollectionProperties(AlterCollectionPropertiesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS：**

- `databaseName(String databaseName)`

    持有目标 collection 的数据库名称。

- `collectionName(String collectionName)`

    目标 collection 的名称。

- `properties(Map<String, String> properties)`

    要修改的属性及其预期值。请注意，属性值应为字符串。可用的数据库属性如下：

    - **collection.ttl.seconds** -

        collection 的生存时间（TTL），单位为秒。

    - **mmap.enabled** -

        是否为 collection 中所有字段的原始数据和索引启用 mmap。

**RETURNS：**

*void*

**EXCEPTIONS：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the `collection.ttl.seconds` property
Map<String, String> properties = new HashMap<>()
properties.put("collection.ttl.seconds", "86400")

AlterCollectionPropertiesReq alterCollectionFieldReq = AlterCollectionPropertiesReq.builder()
        .collectionName("test")
        .properties(properties)
        .build();
client.alterCollectionProperties(alterCollectionFieldReq)
```

