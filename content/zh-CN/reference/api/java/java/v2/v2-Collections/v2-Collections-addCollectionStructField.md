---
title: "addCollectionStructField() | Java | v2"
slug: /java/java/v2-Collections-addCollectionStructField
sidebar_label: "addCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加一个 struct 字段。您可以在 Collection 创建完成后，使用它通过一个结构化数组字段来扩展 Collection Schema。 | Java | v2"
type: docx
token: RQT1dGVPloPOLAx8G2mcifFEnCc
sidebar_position: 37
keywords: 
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - 多模态向量 Database 检索
  - zilliz
  - zilliz cloud
  - 云
  - addCollectionStructField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionStructField()

此操作会向现有 Collection 添加一个 struct 字段。您可以在 Collection 创建完成后，使用它通过一个结构化数组字段来扩展 Collection Schema。

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

    目标 Collection 的名称。

- `databaseName(String databaseName)`

    包含该 Collection 的 Database。不填写此字段时，使用当前 Database。

- `fieldName(String fieldName)`

    要添加的 struct 数组字段的名称。

- `description(String description)`

    新字段的人类可读描述。

- `maxCapacity(Integer maxCapacity)`

    每一行允许的 struct 元素最大数量。

- `nullable(Boolean nullable)`

    该 struct 字段是否可以为 null。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)`

    每个 struct 元素中包含的标量或向量字段。

- `typeParams(Map<String, String> typeParams)`

    传递给服务器、用于该 struct 字段的附加类型参数。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当验证失败或服务器在此操作中返回错误时，将引发此异常。

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
