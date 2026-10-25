---
title: "session() | Java | v2"
slug: /java/java/v2-Client-session
sidebar_label: "session()"
beta: false
added_since: v3.0.2
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、グローバルクラスターのデプロイで、特定のクラスター ID にバインドされたセッションを作成します。DML または DQL 操作を、現在のプライマリークラスターではなく、選択したクラスターにルーティングする必要がある場合に使用します。 | Java | v2"
type: docx
token: Ay5BdddEboorRGxq3XacHXYHnwf
sidebar_position: 8
keywords: 
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画の類似性検索
  - zilliz
  - zilliz cloud
  - cloud
  - session()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# session()

この操作は、グローバルクラスターのデプロイで、特定のクラスター ID にバインドされたセッションを作成します。DML または DQL 操作を、現在のプライマリークラスターではなく、選択したクラスターにルーティングする必要がある場合に使用します。

```java
public MilvusClientV2Session session(String clusterId)
```

## リクエスト構文\{#request-syntax}

```java
MilvusClientV2Session session = client.session(String clusterId);
```

**パラメーター:**

- `clusterId` (*String*) -

    **[必須]**

セッションをバインドするクラスターの ID です。値は null または空にできません。返されたセッションを通じて呼び出された操作は、このクラスターにルーティングされます。

**戻り値の型:**

*MilvusClientV2Session*

**戻り値:**

返されたセッションは、`search()`、`hybridSearch()`、`query()`、`get()`、`queryIterator()`、`searchIterator()` などのベクトル操作のクラスタースコープのバリアントと、それらがサポートする非同期形式を公開します。セッションが不要になったら、`close()` を呼び出してください。

**MilvusClientV2Session** オブジェクトには、次のフィールドが含まれます:

**パラメーター:**

- **clusterId** (*String*) -

    セッションがバインドされているクラスターの ID です。`getClusterId()` で取得します。セッションを通じて呼び出された操作は、このクラスターにルーティングされます。

**例外:**

- **MilvusClientException**<br/>
  `clusterId` が null または空の場合、この例外がスローされます。

- **MilvusClientException**<br/>
  セッション操作が失敗した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.MilvusClientV2Session;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

MilvusClientV2Session session = client.session("cluster-a");
try {
    QueryResp resp = session.query(QueryReq.builder()
        .collectionName("book_catalog")
        .filter("category == \"database\"")
        .outputFields(Arrays.asList("id", "title"))
        .limit(10)
        .build());
    System.out.println(resp.getQueryResults().size());
} finally {
    session.close();
}
```
