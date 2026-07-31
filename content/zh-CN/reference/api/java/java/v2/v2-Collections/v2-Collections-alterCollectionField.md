---
title: "alterCollectionField() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionField
sidebar_label: "alterCollectionField()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作修改指定集合字段的属性。 | Java | v2"
type: docx
token: OtrZdy7OtoC9N9xb8TjcCtM7nfc
sidebar_position: 2
keywords: 
  - 什么是 milvus
  - milvus 数据库
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - alterCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterCollectionField()

此操作修改指定集合字段的属性。

```java
public Void alterCollectionField(AlterCollectionFieldReq request)
```

## 请求语法\{#request-syntax}

```java
alterCollectionField(AlterCollectionFieldReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS：**

- `databaseName(String databaseName)`

    持有目标集合的数据库名称。

- `collectionName(String collectionName)`

    **[REQUIRED]**

    目标集合的名称。

- `fieldName(String fieldName)`

    **[REQUIRED]**

    目标字段的名称。

- `properties(Map<String, String> properties)`

    **[REQUIRED]**

    要修改的属性及其期望值。请注意，属性值应为字符串。可用的数据库属性如下：

    - **max_length** -

        允许插入的字符串的最大字节长度。请注意，多字节字符（例如 Unicode 字符）每个可能占用多个字节，因此请确保插入字符串的字节长度不超过指定限制。取值范围：[1, 65,535]。

        这是 varchar 字段的必填项。

    - **max_capacity** -

        Array 字段值中的元素数量。

        这是 array 字段的必填项。

    - **mmap_enabled** -

        是否让 Milvus 将字段数据映射到内存中，而不是将其完全加载到内存。更多信息请参见 MMap-enabled Data Storage。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionFieldReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the `max_length` property of a VarChar field named `varchar`
Map<String, String> properties = new HashMap<>()
properties.put("max_length", "512")

AlterCollectionFieldReq alterCollectionFieldReq = AlterCollectionFieldReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .properties(properties)
        .build();
client.alterCollectionField(alterCollectionFieldReq)
```

