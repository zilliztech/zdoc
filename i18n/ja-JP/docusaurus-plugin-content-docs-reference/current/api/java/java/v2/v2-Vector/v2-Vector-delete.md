---
title: "delete() | Java | v2"
slug: /java/java/v2-Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、ID またはブール式を使って entity を削除します。 | Java | v2"
type: docx
token: NTCHdGKwNo9kl2xFzgKcjo8wndg
sidebar_position: 1
keywords: 
  - オーディオ検索
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - delete()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# delete()

この操作は、ID またはブール式を使って entity を削除します。

```java
public DeleteResp delete(DeleteReq request)
```

## リクエスト構文\{#request-syntax}

```java
delete(DeleteReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .filter(String filter)
    .ids(List<Object> ids)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**BUILDER メソッド:**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)` -

    対象の collection の名前です。

- `partitionName(String partitionName)` -

    対象の partition の名前です。

- `filter(String filter)` -

    結果をフィルタリングするためのブール式です。

- `ids(List<Object> ids)` -

    特定の entity を識別するための主キー値のリストです。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)` -

    パラメータ化された filter 用のテンプレート変数値のマップです。

**戻り値:**

*DeleteResp*

**DeleteResp** オブジェクトには、削除された entity の数が含まれます。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.DeleteReq;
import io.milvus.v2.service.vector.response.DeleteResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Delete entities with filter "id > 10"
DeleteReq deleteReq = DeleteReq.builder()
        .collectionName("test")
        .filter("id > 10")
        .build();
DeleteResp deleteResp = client.delete(deleteReq);
```
