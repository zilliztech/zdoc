---
title: "refreshExternalCollection() | Java | v2"
slug: /java/java/v2-Management-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、外部ソースから Milvus collection にデータを取り込む更新ジョブをトリガーします。進行状況を追跡するために `getRefreshExternalCollectionProgress()` に渡せるジョブ ID を返します。 | Java | v2"
type: docx
token: G8JydoIzPoKb2MxASemcW2spnbe
sidebar_position: 31
keywords: 
  - 動画重複排除
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - refreshExternalCollection()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# refreshExternalCollection()

この操作は、外部ソースから Milvus collection にデータを取り込む更新ジョブをトリガーします。進行状況を追跡するために `getRefreshExternalCollectionProgress()` に渡せるジョブ ID を返します。

```java
public RefreshExternalCollectionResp refreshExternalCollection(RefreshExternalCollectionReq request)
```

## リクエスト構文\{#request-syntax}

```java
refreshExternalCollection(RefreshExternalCollectionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .externalSource(String externalSource)
    .externalSpec(JsonObject externalSpec)
    .build()
);
```

**BUILDER メソッド:**

- `databaseName(String databaseName)` -

    database の名前です。指定しない場合は現在の database がデフォルトで使用されます。

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    更新対象の collection 名です。

- `externalSource(String externalSource)` -

    外部データソース識別子です（例: `"s3"`、`"oss"`）。

- `externalSpec(JsonObject externalSpec)` -

    外部ストレージ設定を記述する JSON オブジェクトです。フィールドは `externalSource` に依存します（通常は `endpoint`、`bucket`、`path`、認証情報を含みます）。

**戻り値:**

*RefreshExternalCollectionResp*

レスポンスには 1 つのフィールドが含まれます。

- `jobId` (*long*) - 新しく開始された更新ジョブの数値 ID です。この値を保存しておくと、`getRefreshExternalCollectionProgress()` を使用して進行状況を照会できます。

**例外:**

- **MilvusClientException**

    この操作の実行中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

JsonObject spec = new JsonObject();
spec.addProperty("endpoint", "https://s3.amazonaws.com");
spec.addProperty("bucket", "my-bucket");
spec.addProperty("path", "data/snapshots/2026-05-01/");

RefreshExternalCollectionResp resp = client.refreshExternalCollection(
    RefreshExternalCollectionReq.builder()
        .collectionName("my_collection")
        .externalSource("s3")
        .externalSpec(spec)
        .build()
);
long jobId = resp.getJobId();
System.out.println("Started refresh job: " + jobId);
```
