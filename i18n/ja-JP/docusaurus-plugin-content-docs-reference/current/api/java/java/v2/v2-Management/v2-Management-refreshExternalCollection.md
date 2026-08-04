---
title: "refreshExternalCollection() | Java | v2"
slug: /java/java/v2-Management-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、外部ソースから Milvus collection にデータを取り込むリフレッシュジョブをトリガーします。進行状況を追跡するために `getRefreshExternalCollectionProgress()` に渡せるジョブ ID を返します。 | Java | v2"
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

この操作は、外部ソースから Milvus collection にデータを取り込むリフレッシュジョブをトリガーします。進行状況を追跡するために `getRefreshExternalCollectionProgress()` に渡せるジョブ ID を返します。

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

**ビルダーメソッド:**

- `databaseName(String databaseName)` -

    database の名前です。指定しない場合は現在の database がデフォルトで使用されます。

- `collectionName(String collectionName)` -

    **[REQUIRED]**

    リフレッシュする collection の名前です。

- `externalSource(String externalSource)` -

    外部データソースの識別子です（例: `"s3"`、`"oss"`）。

- `externalSpec(JsonObject externalSpec)` -

    外部ストレージ設定を記述する JSON オブジェクトです。フィールドは `externalSource` に依存します（通常は `endpoint`、`bucket`、`path`、認証情報を含みます）。

**戻り値:**

*RefreshExternalCollectionResp*

レスポンスには単一のフィールドが含まれます。

- `jobId` (*long*) - 新たに開始されたリフレッシュジョブの数値 ID です。`getRefreshExternalCollectionProgress()` で進行状況を照会するために、この値を保存してください。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

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
