---
title: "addCollectionStructField() | Java | v2"
slug: /java/java/v2-Collections-addCollectionStructField
sidebar_label: "addCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向现有 collection 添加一个 struct 字段。可在 collection 已创建后，使用它通过一个结构化数组字段来扩展 collection schema。 | Java | v2"
type: docx
token: RQT1dGVPloPOLAx8G2mcifFEnCc
sidebar_position: 37
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionStructField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionStructField()

此操作会向现有 collection 添加一个 struct 字段。可在 collection 已创建后，使用它通过一个结构化数组字段来扩展 collection schema。

```java
public void addCollectionStructField(AddCollectionStructFieldReq request)
```

## 请求语法\{#request-syntax}

```java
addCollectionStructField(AddCollectionStructFieldReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .description(String description)
    .maxCapacity(Integer maxCapacity)
    .nullable(Boolean nullable)
    .structFields(List<CreateCollectionReq.FieldSchema> structFields)
    .typeParams(Map<String, String> typeParams)
    .build());
```

**构建器方法：**

- `collectionName(String collectionName)`

    目标 collection 的名称。

- `databaseName(String databaseName)`

    包含该 collection 的数据库。省略此字段将使用当前数据库。

- `fieldName(String fieldName)`

    要添加的 struct 数组字段名称。

- `description(String description)`

    新字段的人类可读描述。

- `maxCapacity(Integer maxCapacity)`

    每一行中允许的 struct 元素最大数量。

- `nullable(Boolean nullable)`

    该 struct 字段是否可以为 null。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)`

    每个 struct 元素中包含的标量字段或向量字段。

- `typeParams(Map<String, String> typeParams)`

    传递给服务器的、用于该 struct 字段的附加类型参数。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当验证失败或服务器为此操作返回错误时，将引发此异常。

## 示例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

client.addCollectionStructField(AddCollectionStructFieldReq.builder()
    .collectionName("book")
    .fieldName("metadata")
    .maxCapacity(8)
    .nullable(true)
    .structFields(Arrays.asList(
        CreateCollectionReq.FieldSchema.builder()
            .name("author")
            .dataType(DataType.VarChar)
            .maxLength(256)
            .build()))
    .build());
```

{/* category: Collections; action: CREATE; addedSince: v3.0.x */}
