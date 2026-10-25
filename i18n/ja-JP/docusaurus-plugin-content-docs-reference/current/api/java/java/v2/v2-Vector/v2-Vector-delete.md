---
title: "delete() | Java | v2"
slug: /java/java/v2-Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ID またはブール式を使用してエンティティを削除します。 | Java | v2"
type: docx
token: FrMNdXnZYo0oZ9xfs0xcjbVmn2c
sidebar_position: 1
keywords: 
  - オーディオ検索
  - セマンティック検索とは
  - 埋め込みモデル
  - 画像類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - delete()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# delete()

この操作は、ID またはブール式を使用してエンティティを削除します。

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

**ビルダーメソッド：**

- `databaseName(String databaseName)` -

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトとなります。

- `collectionName(String collectionName)` -

    対象のコレクションの名前です。

- `partitionName(String partitionName)` -

    対象のパーティションの名前です。

- `filter(String filter)` -

    結果をフィルタリングするためのブール式です。

- `ids(List<Object> ids)` -

    特定のエンティティを識別するための主キー値のリストです。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)` -

    パラメーター化されたフィルターのテンプレート変数値のマップです。

**戻り値の型：**

*DeleteResp*

**戻り値：**

**DeleteResp** オブジェクトには、削除されたエンティティの数と操作コスト（`getCost()`）が含まれます。

**パラメーター：**

- **deleteCnt** (*long*) -

    削除されたエンティティの数です。

- **primaryKeys** (*List&lt;Object&gt;*) -

    削除されたエンティティの主キーです。Milvus サーバー 2.3.2 以降では、削除レスポンスで削除された主キーが返されなくなりました。そのため、最新のサーバーではこのリストは空です。このリストは、接続先のサーバーがキーを返す古いリリースである場合にのみ設定されます。

- **cost** (*Long*) -

    操作の時間コストです。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生した場合、この例外がスローされます。

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
