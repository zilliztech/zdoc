---
title: "BulkImportOption | Go | v2"
slug: /go/go/v2-DataImport-BulkImportOption
sidebar_label: "BulkImportOption"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "BulkImportOption | Go | v2"
type: docx
token: ZG2ndWgIwogyOAxAzH5ciWY3nlb
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImportOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImportOption

BulkImportOption

この型は、RESTful import API の一括インポートリクエストを設定します。セルフホスト型 Milvus では `NewBulkImportOption()` を使用して、Zilliz Cloud では `NewCloudBulkImportOption()` を使用して構築します。構築後、`With*` ビルダーメソッドをチェーンして、パーティション名、API キー、追加オプションなどの任意フィールドを指定します。

```go
type BulkImportOption struct {
    URL            string
    CollectionName string
    Files          [][]string
    PartitionName  string
    APIKey         string
    ObjectURL      string
    ClusterID      string
    AccessKey      string
    SecretKey      string
    Options        map[string]string
}
```

**FIELDS:**

- **URL** (*string*) -<br/>
  Milvus または Zilliz Cloud クラスターのベース URL。パスは含めないでください。関数が自動的に `/v2/vectordb/jobs/import/create` を追加します。

- **CollectionName** (*string*) -<br/>
  対象コレクションの名前。必須です。

- **Files** (*[][]string*) -<br/>
  インポートするファイルパスの一覧。各内部スライスは、まとめてインポートされるファイルのバッチを表します。`NewBulkImportOption()` と一緒に使用します。クラウドインポートでは任意です。

- **PartitionName** (*string*) -<br/>
  コレクション内の対象パーティション。任意です。省略した場合、データはデフォルトパーティションに格納されます。

- **APIKey** (*string*) -<br/>
  `Bearer` ヘッダーとして送信される認可トークン。任意ですが、サーバーがトークンベース認証を強制する場合は必須です。

- **ObjectURL** (*string*) -<br/>
  クラウドインポート用の S3 または互換オブジェクト URL。`NewCloudBulkImportOption()` と一緒に使用します。任意です。

- **ClusterID** (*string*) -<br/>
  Zilliz Cloud クラスター ID。`NewCloudBulkImportOption()` と一緒に使用します。任意です。

- **AccessKey** (*string*) -<br/>
  オブジェクトストア用のアクセスキー。任意です。

- **SecretKey** (*string*) -<br/>
  オブジェクトストア用のシークレットキー。任意です。

- **Options** (*map[string]string*) -<br/>
  import API に転送される追加のキーと値のパラメータ。エントリを追加するには `WithOption()` を使用します。

**BUILDER METHODS:**

- `WithPartition(partitionName string)`<br/>
  これは、インポートされるデータの対象パーティションを設定します。

- `WithAPIKey(key string)`<br/>
  これは、`Bearer` ヘッダーとして送信される認可トークンを設定します。

- `WithOption(key, value string)`<br/>
  これは、リクエストペイロードに追加のキーと値のパラメータを追加します。さらにエントリを追加するには複数回呼び出します。

**CONSTRUCTORS:**

- `NewBulkImportOption(uri string, collectionName string, files [][]string)`<br/>
  これは、セルフホスト型 Milvus クラスター用の BulkImportOption を作成します。`files` 引数はバッチの一覧で、各バッチはファイルパスのスライスです。

- `NewCloudBulkImportOption(uri string, collectionName string, apiKey string, objectURL string, clusterID string, accessKey string, secretKey string)`<br/>
  これは、Zilliz Cloud クラスター用の BulkImportOption を作成します。クラウドオブジェクトストレージでは `Files` の代わりに `ObjectURL` を使用します。

