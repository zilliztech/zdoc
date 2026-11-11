---
title: "refreshExternalCollection() | Java | v2"
slug: /java/java/v2-Management-refreshExternalCollection
sidebar_label: "refreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、外部ソースから Milvus のコレクションにデータを取り込むリフレッシュジョブをトリガーします。進捗を追跡するために `getRefreshExternalCollectionProgress()` に渡すことができるジョブ ID を返します。 | Java | v2"
type: docx
token: G8JydoIzPoKb2MxASemcW2spnbe
sidebar_position: 32
keywords: 
  - 動画の重複排除
  - 動画の類似検索
  - ベクトル検索
  - 音声の類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - refreshExternalCollection()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# refreshExternalCollection()

この操作では、外部ソースから Milvus のコレクションにデータを取り込むリフレッシュジョブをトリガーします。進捗を追跡するために `getRefreshExternalCollectionProgress()` に渡すことができるジョブ ID を返します。

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

    データベースの名前です。指定しない場合、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)` -

    **[必須]**

    リフレッシュするコレクションの名前です。

- `externalSource(String externalSource)` -

    外部ソースの URI です。

    `externalSource` と `externalSpec` は一緒に指定するか、両方とも省略してください。両方を省略した場合、リフレッシュでは永続化されたソースとスペックが再利用されます。

    Zilliz Cloud では、`externalSource` は `volume://<volume_name>/<path>` と `milvus://<instance_id>/<db_name>/<collection_name>` の 2 つのスキームを受け入れます。`volume://` URI の場合は、上記のルールが適用されます。`milvus://` ソースの場合も同じルールが適用されます。省略すると永続化されたソースが再利用され、リフレッシュでは引き続き最新データが同期されます。

- `externalSpec(JsonObject externalSpec)` -

    `format` などの外部ソースの仕様を含む JSON オブジェクトです。`format` に指定できる値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    Zilliz Cloud では、`milvus-table` ソースは `milvus://` スキームと組み合わせて使用します。`format` は省略でき、`milvus://` ソースではデフォルトで `milvus-table` になります。

**戻り値の型:**

*RefreshExternalCollectionResp*

**戻り値:**

**RefreshExternalCollectionResp** オブジェクトには、新しく開始されたリフレッシュジョブの ID が含まれます。

**パラメーター:**

- **jobId** (*long*) -

    新しく開始されたリフレッシュジョブの数値 ID です。進捗を照会するために、この値を保持して `getRefreshExternalCollectionProgress()` を使用してください。

**例外:**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

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
