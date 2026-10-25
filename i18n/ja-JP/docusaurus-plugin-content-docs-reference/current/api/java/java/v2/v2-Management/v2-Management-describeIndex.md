---
title: "describeIndex() | Java | v2"
slug: /java/java/v2-Management-describeIndex
sidebar_label: "describeIndex()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のインデックスの詳細を取得します。 | Java | v2"
type: docx
token: HH9bdZvbuoblNfxXeLycoHsSn9g
sidebar_position: 4
keywords: 
  - ベクトルデータベースの比較
  - OpenAI ベクトルデータベース
  - 自然言語処理データベース
  - 低コストのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - describeIndex()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeIndex()

この操作は、特定のインデックスの詳細を取得します。

```java
public DescribeIndexResp describeIndex(DescribeIndexReq request)
```

## リクエスト構文\{#request-syntax}

```java
describeIndex(DescribeIndexReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .fieldName(String fieldName)
    .indexName(String indexName)
    .timestamp(Long timestamp)
    .build()
);
```

**ビルダーメソッド:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)` -

    対象のコレクションの名前です。

- `fieldName(String fieldName)` -

    対象のフィールドの名前です。

- `indexName(String indexName)` -

    対象のインデックスの名前です。

- `timestamp(Long timestamp)` -

    タイムトラベルクエリ用のタイムスタンプです。デフォルトは `0L` です。

**戻り値の型:**

*DescribeIndexResp*

**戻り値:**

指定したインデックスの詳細を含む **DescribeIndexResp** オブジェクトです。

**パラメーター:**

- **indexDescriptions** (*List&lt;IndexDesc&gt;*) -

    インデックス記述のリストです。各要素は、以下のフィールドを含む **IndexDesc** オブジェクトです。

    - **fieldName** (*String*) -

        インデックスを作成するフィールドの名前です。

    - **indexName** (*String*) -

        インデックスの名前です。

    - **id** (*long*) -

        インデックスの ID です。

    - **indexType** (*IndexParam.IndexType*) -

        インデックスの種類です。

    - **metricType** (*IndexParam.MetricType*) -

        このインデックスでベクトルの類似度を測定するために使用するメトリックタイプです。

    - **extraParams** (*Map&lt;String, String&gt;*) -

        インデックスの追加パラメーターです。

    - **indexedRows** (*long*) -

        インデックスが作成された行数です。

    - **totalRows** (*long*) -

        対象フィールドの総行数です。

    - **pendingIndexRows** (*long*) -

        インデックス作成待ちの行数です。

    - **indexState** (*IndexBuildState*) -

        インデックス作成タスクの状態です。有効な値は `IndexStateNone`、`Unissued`、`InProgress`、`Finished`、`Failed`、`Retry` です。

    - **indexFailedReason** (*String*) -

        インデックス作成タスクが失敗した理由です。

    - **properties** (*Map&lt;String, String&gt;*) -

        インデックスのプロパティです。非推奨: インデックスプロパティは現在、`extraParams` に転送されます。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe the index for the field "vector"
DescribeIndexReq describeIndexReq = DescribeIndexReq.builder()
        .collectionName("test")
        .fieldName("vector")
        .build();
DescribeIndexResp describeIndexResp = client.describeIndex(describeIndexReq);
```
