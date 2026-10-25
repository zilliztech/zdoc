---
title: "describeCollection() | Java | v2"
slug: /java/java/v2-Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションに関する詳細情報を一覧表示します。 | Java | v2"
type: docx
token: WEE6ddFntowCIixVMCmc3pESnug
sidebar_position: 11
keywords: 
  - knn アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - Zilliz Cloud
  - クラウド
  - describeCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeCollection()

この操作は、特定のコレクションに関する詳細情報を一覧表示します。

```java
public DescribeCollectionResp describeCollection(DescribeCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
describeCollection(DescribeCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .collectionId(Long collectionId)
    .build()
);
```

**ビルダーメソッド:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)` -

    対象のコレクションの名前です。

- `collectionId(Long collectionId)` -

    コレクションの数値 ID です。名前ではなく ID でコレクションを識別する必要がある場合に使用します。

**戻り値の型:**

*DescribeCollectionResp*

**戻り値:**

指定したコレクションに関する詳細情報を含む **DescribeCollectionResp** オブジェクトです。

**パラメーター:**

- **collectionName** (*String*) -

    コレクションの名前です。

- **collectionID** (*Long*) -

    コレクションの数値 ID です。

- **databaseName** (*String*) -

    コレクションが属するデータベースの名前です。

- **description** (*String*) -

    コレクションの説明です。

- **numOfPartitions** (*Long*) -

    コレクション内のパーティションの数です。

- **fieldNames** (*List&lt;String&gt;*) -

    コレクションスキーマ内のすべてのフィールドの名前です。

- **vectorFieldNames** (*List&lt;String&gt;*) -

    ベクトルフィールドの名前です。

- **primaryFieldName** (*String*) -

    主キーフィールドの名前です。

- **enableDynamicField** (*Boolean*) -

    動的フィールドが有効かどうかです。

- **autoID** (*Boolean*) -

    主キーが自動生成されるかどうかです。

- **collectionSchema** (*CreateCollectionReq.CollectionSchema*) -

    コレクションスキーマです。

- **createTime** (*Long*) -

    作成タイムスタンプです。

- **createUtcTime** (*Long*) -

    UTC 作成タイムスタンプです。

- **consistencyLevel** (*ConsistencyLevel*) -

    コレクションの整合性レベルです。

- **shardsNum** (*Integer*) -

    シャード数です。

- **properties** (*Map&lt;String,String&gt;*) -

    コレクションのプロパティです。

- **aliases** (*List&lt;String&gt;*) -

    コレクションに付加されたエイリアスです。

- **updateTimestamp** (*Long*) -

    最終更新タイムスタンプです。

- **enableNamespace** (*Boolean*) -

    名前空間が有効かどうかです。

- **schemaVersion** (*Integer*) -

    スキーマのバージョンです。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get the collection detail
DescribeCollectionReq describeCollectionReq = DescribeCollectionReq.builder()
        .collectionName("test")
        .build();
DescribeCollectionResp describeCollectionResp = client.describeCollection(describeCollectionReq);
```
