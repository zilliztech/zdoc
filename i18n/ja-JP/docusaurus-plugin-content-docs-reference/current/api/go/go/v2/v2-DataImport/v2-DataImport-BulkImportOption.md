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

この型は、RESTful import API の bulk import リクエストを設定します。self-hosted Milvus では `NewBulkImportOption()` を使用し、Zilliz Cloud では `NewCloudBulkImportOption()` を使用して構築します。構築後、`With*` ビルダーメソッドをチェーンして、partition 名、API key、追加オプションなどの任意フィールドを指定します。

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

- **URL** (*string*) -
Milvus または Zilliz Cloud cluster のベース URL です。パスは含めないでください。関数が `/v2/vectordb/jobs/import/create` を自動的に追加します。

- **CollectionName** (*string*) -
対象 collection の名前です。必須です。

- **Files** (*[][]string*) -
import するファイルパスの一覧です。各内部スライスは、一緒に import されるファイルのバッチを表します。`NewBulkImportOption()` とともに使用します。cloud import では任意です。

- **PartitionName** (*string*) -
collection 内の対象 partition です。任意です。省略した場合、データはデフォルト partition に格納されます。

- **APIKey** (*string*) -
`Bearer` ヘッダーとして送信される認可トークンです。任意です。サーバーがトークンベース認証を強制する場合は必須です。

- **ObjectURL** (*string*) -
cloud import 用の S3 または互換オブジェクト URL です。`NewCloudBulkImportOption()` とともに使用します。任意です。

- **ClusterID** (*string*) -
Zilliz Cloud cluster ID です。`NewCloudBulkImportOption()` とともに使用します。任意です。

- **AccessKey** (*string*) -
オブジェクトストア用の access key です。任意です。

- **SecretKey** (*string*) -
オブジェクトストア用の secret key です。任意です。

- **Options** (*map[string]string*) -
import API に転送される追加のキーと値のパラメーターです。エントリを追加するには `WithOption()` を使用します。

**BUILDER METHODS:**

- `WithPartition(partitionName string)`
これは import されたデータの対象 partition を設定します。

- `WithAPIKey(key string)`
これは `Bearer` ヘッダーとして送信される認可トークンを設定します。

- `WithOption(key, value string)`
これはリクエストペイロードに追加のキーと値のパラメーターを追加します。さらにエントリを追加するには複数回呼び出します。

**CONSTRUCTORS:**

- `NewBulkImportOption(uri string, collectionName string, files [][]string)`
これは self-hosted Milvus clusters 用の BulkImportOption を作成します。`files` 引数はバッチの一覧で、各バッチはファイルパスのスライスです。

- `NewCloudBulkImportOption(uri string, collectionName string, apiKey string, objectURL string, clusterID string, accessKey string, secretKey string)`
これは Zilliz Cloud clusters 用の BulkImportOption を作成します。cloud object storage では `Files` の代わりに `ObjectURL` を使用します。

