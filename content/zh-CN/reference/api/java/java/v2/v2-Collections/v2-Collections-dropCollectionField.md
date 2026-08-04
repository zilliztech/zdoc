---
title: "dropCollectionField() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "按字段名称或字段 ID 删除现有集合字段。 | Java | v2"
type: docx
token: PcFWdgr7VoPK74xt1mmcmH8gndf
sidebar_position: 39
keywords: 
  - 视频去重
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionField()

按字段名称或字段 ID 删除现有集合字段。

```java
public void dropCollectionField(DropCollectionFieldReq request)
```

## 请求语法\{#request-syntax}

```java
DropCollectionFieldReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .fieldName(fieldName)
    .fieldId(fieldId)
    .build();
```

**构建器方法：**

- `collectionName(String collectionName)`

    目标集合的名称。

- `databaseName(String databaseName)`

    数据库名称。省略时默认使用当前数据库。

- `fieldName(String fieldName)`

    要删除的字段名称。

- `fieldId(Long fieldId)`

    通过 ID 标识字段时，要删除字段的数字 ID。

**返回：**

*void*

此操作不返回任何值。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时抛出。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
client.dropCollectionField(DropCollectionFieldReq.builder()
    .collectionName("books")
    .fieldName("obsolete_field")
    .build());
```
