---
title: "listIndexes() | Java | v2"
slug: /java/java/v2-Management-listIndexes
sidebar_label: "listIndexes()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクション内のフィールドにあるインデックスを一覧表示します。 | Java | v2"
type: docx
token: Lq2vdHAmAo7m6axzZOpcWdkcnzd
sidebar_position: 12
keywords: 
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
  - 異常検知
  - zilliz
  - zilliz cloud
  - クラウド
  - listIndexes()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listIndexes()

この操作は、特定のコレクション内のフィールドに対するインデックスを一覧表示します。

```java
public List<String> listIndexes(ListIndexesReq request)
```

## リクエスト構文\{#request-syntax}

```java
listIndexes(ListIndexesReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

- `fieldName(String fieldName)`

    対象のフィールドの名前です。

**戻り値の型:**

*List&lt;String&gt;*

**戻り値:**

対象のフィールドに構築されたインデックス名のリストです。コレクションにそのフィールドのインデックスがない場合は、空のリストを返します。

**パラメーター:**

- **indexNames** (*List&lt;String&gt;*) -

    対象のフィールドに構築されたインデックス名のリストです。

**例外:**

- **MilvusClientException**

    この操作中にエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.ListIndexesReq;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List the indexes on the \`varchar\` field in the \`test\` collection
ListIndexesReq listIndexesReq = ListIndexesReq.builder()
        .collectionName("test")
        .fieldName("varchar")
        .build();
        
List<String> indexes = client.listIndexes(listIndexesReq);
```
