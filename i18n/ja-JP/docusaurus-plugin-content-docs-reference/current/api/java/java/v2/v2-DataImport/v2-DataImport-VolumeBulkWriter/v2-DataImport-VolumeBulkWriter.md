---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter を構成します。collection schema、出力パス、volume 接続を含みます。 | Java | v2"
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

collection schema、出力パス、volume 接続を含む VolumeBulkWriter を構成します。

```java
public class VolumeBulkWriter
```

<Admonition type="info" icon="📘" title="注意">

**VolumeBulkWriter** オブジェクトは、Milvus が理解できる形式で生データを Zilliz Cloud Volume に書き換えることを目的としています。

</Admonition>

**ビルダーメソッド:**

- `withCollectionSchema(CollectionSchemaParam collectionSchema)`

    `CollectionSchemaParam` で定義された、ターゲット collection の schema です。ビルダーはこれを内部で v2 collection schema に変換します。

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    [`CreateCollectionReq.CollectionSchema`](./v2-Collections-CollectionSchema) で定義された、ターゲット collection の schema です。

- `withRemotePath(String remotePath)`

    書き換えられたデータファイルが保存される、ターゲット volume 内のパスです。

- `withChunkSize(long chunkSize)`

    生成される各ファイルセグメントの最大サイズです。単位はバイトです。デフォルト値は **134,217,728** バイト（**128 MB**）です。

- `withFileType(BulkFileType fileType)`

    出力ファイル形式です。使用可能な値については、[`BulkFileType`](./v2-DataImport-BulkFileType) を参照してください。

- `withConfig(String key, Object value)`

    出力ファイル処理のためのオプションのキーと値の設定です。`CSV` 出力の場合、区切り文字を設定するには `sep` を使用し、null 値を表す文字列を設定するには `nullkey` を使用します。

- `withCloudEndpoint(String cloudEndpoint)`

    Zilliz Cloud のパブリック API エンドポイントです。この値を `https://api.cloud.zilliz.com` に設定します。

- `withApiKey(String apiKey)`

    リクエストの認証に使用される Zilliz Cloud API key です。

- `withVolumeName(String volumeName)`

    ターゲット Zilliz Cloud volume の名前です。

- `withConnectType(ConnectType connectType)`

    volume へのアクセスに使用される接続戦略です。デフォルト値は `ConnectType.AUTO` です。

## Example\{#example}

collection schema、出力パス、volume 接続を含む VolumeBulkWriter を構成します。

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
