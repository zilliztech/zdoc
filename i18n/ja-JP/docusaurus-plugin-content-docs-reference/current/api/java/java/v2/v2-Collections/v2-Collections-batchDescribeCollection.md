---
title: "batchDescribeCollection() | Java | v2"
slug: /java/java/v2-Collections-batchDescribeCollection
sidebar_label: "batchDescribeCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、複数のコレクションの説明を一括で取得します。 | Java | v2"
type: docx
token: B4CpdqvN7oZy3zxB9fscTAG8n7E
sidebar_position: 30
keywords: 
  - 自然言語処理データベース
  - 低コストのベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - batchDescribeCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# batchDescribeCollection()

この操作は、複数のコレクションの説明を一括で取得します。

```java
public List<DescribeCollectionResp> batchDescribeCollection(BatchDescribeCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
batchDescribeCollection(BatchDescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionNames(List<String> collectionNames)
    .collectionIds(List<Long> collectionIds)
    .build()
);
```

**ビルダーメソッド:**

- `databaseName(String databaseName)` -

    データベースの名前。指定しない場合、現在のデータベースがデフォルトになります。

- `collectionNames(List<String> collectionNames)` -

    一括で説明を取得するコレクション名のリスト。

- `collectionIds(List<Long> collectionIds)` -

    一括で説明を取得するコレクション ID のリスト。

**戻り値の型:**

*List&lt;DescribeCollectionResp&gt;*

**戻り値:**

**DescribeCollectionResp** オブジェクトのリスト。各 **DescribeCollectionResp** オブジェクトには、以下のフィールドが含まれます。

**パラメーター:**

- **collectionName** (*String*) -

    コレクションの名前。

- **collectionID** (*Long*) -

    コレクションの ID。

- **databaseName** (*String*) -

    コレクションを保持するデータベースの名前。

- **description** (*String*) -

    コレクションの説明。

- **numOfPartitions** (*Long*) -

    コレクション内のパーティションの数。

- **fieldNames** (*List&lt;String&gt;*) -

    コレクション内のすべてのフィールドの名前のリスト。

- **vectorFieldNames** (*List&lt;String&gt;*) -

    コレクション内のベクトルフィールドの名前のリスト。

- **primaryFieldName** (*String*) -

    コレクションの主キーフィールドの名前。

- **enableDynamicField** (*Boolean*) -

    コレクションで動的フィールドが有効になっているかどうか。

- **autoID** (*Boolean*) -

    Milvus がコレクションの主キー値を自動生成するかどうか。

- **collectionSchema** (*CreateCollectionReq.CollectionSchema*) -

    コレクションのスキーマ。

- **createTime** (*Long*) -

    コレクションが作成されたタイムスタンプ。

- **createUtcTime** (*Long*) -

    コレクションが作成された UTC タイムスタンプ。

- **consistencyLevel** (*ConsistencyLevel*) -

    コレクションの整合性レベル。

- **shardsNum** (*Integer*) -

    コレクション内のシャードの数。

- **properties** (*Map&lt;String, String&gt;*) -

    コレクションのプロパティ。

- **aliases** (*List&lt;String&gt;*) -

    コレクションのエイリアスのリスト。

- **updateTimestamp** (*Long*) -

    コレクションが最後に更新されたタイムスタンプ。

- **enableNamespace** (*Boolean*) -

    コレクションで名前空間機能が有効になっているかどうか。

- **schemaVersion** (*Integer*) -

    コレクションのスキーマバージョン。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.BatchDescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;
import java.util.Collections;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
BatchDescribeCollectionReq describeCollectionReq = BatchDescribeCollectionReq.builder()
        .collectionNames(Collections.singletonList("test"))
        .build();
List<DescribeCollectionResp> batchResp = client.batchDescribeCollection(describeCollectionReq);
```
