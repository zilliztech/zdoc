---
title: "CreateSchema() | Java | v2"
slug: /java/java/v2-Collections-CreateSchema
sidebar_label: "CreateSchema()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はコレクションスキーマを作成します。 | Java | v2"
type: docx
token: DAIfdXKk5oCHeNxOUvCc1KcpnNh
sidebar_position: 24
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateSchema()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# CreateSchema()

この操作はコレクションスキーマを作成します。

```java
public static CreateCollectionReq.CollectionSchema CreateSchema()
```

## リクエスト構文\{#request-syntax}

```java
MilvusClientV2.createSchema()
```

**パラメータ:**

なし

**戻り値の型:**

*CreateCollectionReq.CollectionSchema*

**戻り値:**

**CreateCollectionReq.CollectionSchema** オブジェクト。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2 Quickly create a collectionSchema
CreateCollectionReq.CollectionSchema collectionSchema = client.CreateSchema();
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(dim).build());
```

