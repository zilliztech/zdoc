---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter を設定します。これには、collection スキーマ、出力パス、volume 接続が含まれます。 | Java | v2"
type: docx
token: NtxedWgOpof2Qtx8BU2ckktunWc
sidebar_position: 7
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

VolumeBulkWriter を設定します。これには、collection スキーマ、出力パス、volume 接続が含まれます。

```java
public class VolumeBulkWriter
```

<Admonition type="info" icon="📘" title="注記">

**VolumeBulkWriter** オブジェクトは、Milvus が理解できる形式で生データを Zilliz Cloud Volume に書き換えることを目的としています。

</Admonition>

**ビルダーメソッド:**

- `withCollectionSchema(CollectionSchemaParam collectionSchema)`

    `CollectionSchemaParam` で定義された、対象 collection のスキーマです。ビルダーはこれを内部で v2 collection スキーマに変換します。

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    [`CreateCollectionReq.CollectionSchema`](./v2-Collections-CollectionSchema) で定義された、対象 collection のスキーマです。

- `withRemotePath(String remotePath)`

    書き換えられたデータファイルが保存される、対象 volume 内のパスです。

- `withChunkSize(long chunkSize)`

    生成される各ファイルセグメントの最大サイズ（バイト単位）です。デフォルト値は **134,217,728** バイト（**128 MB**）です。

- `withFileType(BulkFileType fileType)`

    出力ファイル形式です。使用可能な値については、[`BulkFileType`](./v2-DataImport-BulkFileType) を参照してください。

- `withConfig(String key, Object value)`

    出力ファイル処理用のオプションのキーと値の設定です。`CSV` 出力の場合は、区切り文字を設定するために `sep` を使用し、null 値を表す文字列を設定するために `nullkey` を使用します。

- `withCloudEndpoint(String cloudEndpoint)`

    Zilliz Cloud のパブリック API エンドポイントです。この値を `https://api.cloud.zilliz.com` に設定します。

- `withApiKey(String apiKey)`

    リクエストの認証に使用する Zilliz Cloud API key です。

- `withVolumeName(String volumeName)`

    対象の Zilliz Cloud volume の名前です。

- `withConnectType(ConnectType connectType)`

    volume へのアクセスに使用する接続戦略です。デフォルト値は `ConnectType.AUTO` です。

## Example\{#example}

collection スキーマ、出力パス、volume 接続を含む VolumeBulkWriter を設定します。

```java
VolumeBulkWriterParam params = VolumeBulkWriterParam.newBuilder()
    .withCollectionSchema(collectionSchema)
    .withRemotePath("imports/books")
    .withCloudEndpoint(CLOUD_ENDPOINT)
    .withApiKey(API_KEY)
    .withVolumeName("bulk-data")
    .build();
VolumeBulkWriter writer = new VolumeBulkWriter(params);
```
