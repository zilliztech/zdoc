---
title: "alterCollectionProperties() | Java | v2"
slug: /java/java/v2-Collections-alterCollectionProperties
sidebar_label: "alterCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会修改指定 Collection 的属性。 | Java | v2"
type: docx
token: NzCuda5k8oJHOOxVLk0cg7HInMg
sidebar_position: 3
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量 Database
  - 向量 Database 示例
  - zilliz
  - zilliz cloud
  - 云
  - alterCollectionProperties()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterCollectionProperties()

此操作会修改指定 Collection 的属性。

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

**构建器方法：**

- `databaseName(String databaseName)`

    持有目标 Collection 的 Database 名称。

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `properties(Map<String, String> properties)`

    要修改的属性及其预期值。请注意，属性值必须为字符串。可用的 Database 属性如下：

    - **collection.ttl.seconds** -

        Collection 的生存时间（TTL），以秒为单位。

    - **mmap.enabled** -

        是否为 Collection 中所有字段的原始数据和索引启用 mmap。

- `property(String key, String value)`

    向 Collection 添加单个属性。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the \`collection.ttl.seconds\` property
Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "86400");

AlterCollectionPropertiesReq alterCollectionFieldReq = AlterCollectionPropertiesReq.builder()
        .collectionName("test")
        .properties(properties)
        .build();
client.alterCollectionProperties(alterCollectionFieldReq);
```
