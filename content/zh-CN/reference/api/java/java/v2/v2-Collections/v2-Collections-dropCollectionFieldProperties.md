---
title: "dropCollectionFieldProperties() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFieldProperties
sidebar_label: "dropCollectionFieldProperties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将删除字段的指定属性。 | Java | v2"
type: docx
token: O3E9duLvfoMC26x8AmDcomlWneh
sidebar_position: 26
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionFieldProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionFieldProperties()

此操作将删除字段的指定属性。

```java
public void dropCollectionFieldProperties(DropCollectionFieldPropertiesReq request)
```

## 请求语法\{#request-syntax}

```java
dropCollectionFieldProperties(DropCollectionFieldPropertiesReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .propertyKeys(List<String> propertyKeys)
    .build()
)
```

**构建器方法：**

- `collectionName(String collectionName)`

    现有 collection 的名称。

- `databaseName(String databaseName)`

    包含上述 collection 的数据库名称。

- `fieldName(String fieldName)`

    指定 collection 中目标字段的名称。

- `propertyKeys(List<String> propertyKeys)`

    要从指定字段中删除的属性名称。

**返回类型：**

*void*

**返回值：** 

无

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionFieldPropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop field's properties
client.dropCollectionFieldProperties(DropCollectionFieldPropertiesReq.builder()
        .collectionName(collectionName)
        .fieldName("fieldName")
        .propertyKeys(Collections.singletonList(Constant.MMAP_ENABLED))
        .build());
```
