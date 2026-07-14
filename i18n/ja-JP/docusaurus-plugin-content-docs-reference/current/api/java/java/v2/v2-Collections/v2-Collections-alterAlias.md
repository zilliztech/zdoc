---
title: "alterAlias() | Java | v2"
slug: /java/java/v2-Collections-alterAlias
sidebar_label: "alterAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "この操作は、ある collection の alias を別の collection に再割り当てします。 | Java | v2"
type: docx
token: Fv8EdYIt4oThstxgpzqcm7C0nug
sidebar_position: 1
keywords: 
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - オープンソース vector db
  - ベクトルデータベースの例
  - zilliz
  - zilliz cloud
  - クラウド
  - alterAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterAlias()

この操作は、ある collection の alias を別の collection に再割り当てします。

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

**BUILDER メソッド:**

- `alias(String alias)`

    collection の alias です。なお、この alias は事前に存在している必要があります。

    <Admonition type="info" icon="📘" title="注">

    collection alias とは何ですか？
    
        collection alias は、collection の追加名です。Collection alias は、コードを変更することなくアプリケーションを新しい collection に切り替えたい場合に便利です。 
    
        Zilliz Cloud では、collection alias はグローバルに一意な識別子です。1 つの alias は、厳密に 1 つの collection にのみ割り当てられます。逆に、1 つの collection は複数の alias を持つことができます。
    
        以下は、ある collection の alias を別の collection に再割り当てする例です。
    
        `collection_1` と `collection_2` の 2 つの collection があるとします。また、`bob` という名前の collection alias があり、これは元々 `collection_1` に割り当てられていました。
    
        - `collection_1` の alias = ["bob"]
    
        - `collection_2` の alias = []
    
        `collection_2` と `bob` をパラメータとして `alterAlias` 関数を呼び出した後:
    
        - `collection_1` の alias = []
    
        - `collection_2` の alias = ["bob"]

    </Admonition>

- `databaseName(String databaseName)`

    対象の collection が属するデータベースの名前です。

- `collectionName(String collectionName)`

    alias を再割り当てする対象 collection の名前です。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.AlterAliasReq;

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

