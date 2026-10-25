---
title: "alterAlias() | Java | v2"
slug: /java/java/v2-Collections-alterAlias
sidebar_label: "alterAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、あるコレクションのエイリアスを別のコレクションに再割り当てします。 | Java | v2"
type: docx
token: SkdsdSZ9lo79GYx31YEcvaSon4c
sidebar_position: 1
keywords: 
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - オープンソースのベクトルデータベース
  - ベクトルデータベースの例
  - zilliz
  - zilliz cloud
  - クラウド
  - alterAlias()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# alterAlias()

この操作は、あるコレクションのエイリアスを別のコレクションに再割り当てします。

```java
public void alterAlias(AlterAliasReq request)
```

## リクエスト構文\{#request-syntax}

```java
alterAlias(AlterAliasReq.builder()
    .alias(String alias)
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**ビルダーメソッド：**

- `alias(String alias)`

    コレクションのエイリアスです。エイリアスは事前に存在している必要があります。

    コレクションエイリアスは、コレクションの追加名です。コレクションエイリアスは、コードを変更せずにアプリケーションを新しいコレクションに切り替えたい場合に便利です。

    Milvus では、コレクションエイリアスはグローバルに一意の識別子です。1 つのエイリアスは、正確に 1 つのコレクションに割り当てることができます。逆に、1 つのコレクションには複数のエイリアスを設定できます。

    以下は、あるコレクションのエイリアスを別のコレクションに再割り当てする例です。

    2 つのコレクション `collection_1` と `collection_2` があるとします。また、当初 `collection_1` に割り当てられていた `bob` というコレクションエイリアスがあります。

    - `collection_1` のエイリアス = ["bob"]

    - `collection_2` のエイリアス = []

    パラメーター `collection_2` と `bob` を指定して `alterAlias` 関数を呼び出した後：

    - `collection_1` のエイリアス = []

    - `collection_2` のエイリアス = ["bob"]

- `databaseName(String databaseName)`

    対象コレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    エイリアスを再割り当てする対象コレクションの名前です。

**例外：**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.AlterAliasReq;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter the alias for collection "test"
AlterAliasReq alterAliasReq = AlterAliasReq.builder()
        .collectionName("test")
        .alias("test_alias2")
        .build();
client.alterAlias(alterAliasReq);
```
