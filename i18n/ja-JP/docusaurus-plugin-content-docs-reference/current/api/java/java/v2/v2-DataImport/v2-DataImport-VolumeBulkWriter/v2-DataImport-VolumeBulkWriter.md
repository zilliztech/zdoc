---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter インスタンスは、Zilliz Cloud のボリュームにデータを書き込むために使用するコレクションスキーマ、出力パス、およびボリューム接続を保持します。 | Java | v2"
type: docx
token: NtxedWgOpof2Qtx8BU2ckktunWc
sidebar_position: 7
keywords: 
  - ベクトル検索
  - kNN アルゴリズム
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - クラウド
  - VolumeBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

VolumeBulkWriter インスタンスは、Zilliz Cloud のボリュームにデータを書き込むために使用するコレクションスキーマ、出力パス、およびボリューム接続を保持します。

```java
public class VolumeBulkWriter
```

**VolumeBulkWriter** オブジェクトは、Milvus が解釈できる形式で、生データを Zilliz Cloud のボリュームに書き換えることを目的としています。

**ビルダーメソッド：**

- `withCollectionSchema(CollectionSchemaParam collectionSchema)`

    対象コレクションのスキーマです。`CollectionSchemaParam` で定義され、ビルダーによって内部で v2 コレクションスキーマに変換されます。

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    対象コレクションのスキーマです。`CreateCollectionReq.CollectionSchema` で定義されます。

- `withRemotePath(String remotePath)`

    書き換えられたデータファイルを保存する、対象ボリューム内のパスです。

- `withChunkSize(long chunkSize)`

    生成される各ファイルセグメントの最大サイズ（バイト単位）です。既定値は **134,217,728** バイト（**128 MB**）です。

- `withFileType(BulkFileType fileType)`

    出力ファイル形式です。使用可能な値については、`BulkFileType` を参照してください。

- `withConfig(String key, Object value)`

    出力ファイル処理のための省略可能なキーと値の構成です。`CSV` 出力では、区切り文字を設定するには `sep` を使用し、null 値を表す文字列を設定するには `nullkey` を使用します。

- `withCloudEndpoint(String cloudEndpoint)`

    Zilliz Cloud のパブリック API エンドポイントです。この値には `https://api.cloud.zilliz.com` を設定します。

- `withApiKey(String apiKey)`

    リクエストの認証に使用する Zilliz Cloud API キーです。

- `withVolumeName(String volumeName)`

    対象の Zilliz Cloud ボリュームの名前です。

- `withConnectType(ConnectType connectType)`

    ボリュームへのアクセスに使用する接続戦略です。既定値は `ConnectType.AUTO` です。

## 例\{#example}

コレクションスキーマ、出力パス、ボリューム接続を含めて VolumeBulkWriter を構成します。

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
