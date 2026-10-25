---
title: "addCollectionStructField() | Java | v2"
slug: /java/java/v2-Collections-addCollectionStructField
sidebar_label: "addCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加一个结构体字段。在 Collection 创建完成后，可使用此操作通过结构化数组字段扩展 Collection Schema。 | Java | v2"
type: docx
token: RQT1dGVPloPOLAx8G2mcifFEnCc
sidebar_position: 37
keywords: 
  - 余弦距离
  - 什么是向量 Database
  - 向量 Database
  - 多模态向量 Database 检索
  - Zilliz
  - Zilliz Cloud
  - 云
  - addCollectionStructField()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addCollectionStructField()

此操作会向现有 Collection 添加一个结构体字段。在 Collection 创建完成后，可使用此操作通过结构化数组字段扩展 Collection Schema。

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

- `collectionName(String collectionName)`<br/>
  目标 Collection 的名称。

- `databaseName(String databaseName)`<br/>
  包含该 Collection 的 Database。省略此字段将使用当前 Database。

- `fieldName(String fieldName)`<br/>
  要添加的结构体数组字段的名称。

- `description(String description)`<br/>
  新字段的可读描述。

- `maxCapacity(Integer maxCapacity)`<br/>
  每行允许的结构体元素最大数量。

- `nullable(Boolean nullable)`<br/>
  结构体字段是否可为 null。

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)`<br/>
  每个结构体元素包含的标量字段或向量字段。

- `addStructField(AddFieldReq addFieldReq)`<br/>
  将指定的字段请求转换为结构体子字段，并将其追加到结构体字段定义中。

- `typeParams(Map<String, String> typeParams)`<br/>
  为结构体字段传递给服务器的其他类型参数。

- `typeParam(String key, String value)`<br/>
  向结构体字段添加单个类型参数。

**异常：**

- **MilvusClientException**

    当验证失败或服务器针对此操作返回错误时，将引发此异常。

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
