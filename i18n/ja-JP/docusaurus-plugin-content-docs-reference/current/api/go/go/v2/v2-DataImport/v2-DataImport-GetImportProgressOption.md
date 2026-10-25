---
title: "GetImportProgressOption | Go | v2"
slug: /go/go/v2-DataImport-GetImportProgressOption
sidebar_label: "GetImportProgressOption"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この型は、RESTful API を介して単一の bulk import ジョブの進行状況を取得するリクエストを設定します。self-hosted Milvus では `NewGetImportProgressOption()`、Zilliz Cloud では `NewCloudGetImportProgressOption()` を使って構築します。認可トークンを追加するには `WithAPIKey()` をチェーンします。 | Go | v2"
type: docx
token: Whyodunisox4GwxOciucHVT7nNh
sidebar_position: 5
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - コサイン距離
  - zilliz
  - zilliz cloud
  - クラウド
  - GetImportProgressOption
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetImportProgressOption

この型は、RESTful API を介して単一の bulk import ジョブの進行状況を取得するリクエストを設定します。self-hosted Milvus では `NewGetImportProgressOption()`、Zilliz Cloud では `NewCloudGetImportProgressOption()` を使って構築します。認可トークンを追加するには `WithAPIKey()` をチェーンします。

```go
type GetImportProgressOption struct {
    URL       string
    JobID     string
    ClusterID string
    APIKey    string
}
```

**FIELDS:**

- **URL** (*string*) -<br/>
  The base URL of the Milvus or Zilliz Cloud クラスター. Do not include the path; the function appends `/v2/vectordb/jobs/import/describe` automatically.

- **JobID** (*string*) -<br/>
  確認対象の import ジョブの一意な識別子です。`BulkImport()` が返す値を渡します。必須です。

- **ClusterID** (*string*) -<br/>
  The Zilliz Cloud クラスター ID. Optional; used only for cloud imports.

- **APIKey** (*string*) -<br/>
  `Bearer` ヘッダーとして送信される認可トークンです。任意です。サーバーでトークンベース認証が強制されている場合は必須です。

**BUILDER METHODS:**

- `WithAPIKey(key string)`

    これは、`Bearer` ヘッダーとして送信される認可トークンを設定します。

**CONSTRUCTORS:**

- `NewGetImportProgressOption(uri string, jobID string)`<br/>
  This creates a GetImportProgressOption for self-hosted Milvus クラスター.

- `NewCloudGetImportProgressOption(uri string, jobID string, apiKey string, clusterID string)`<br/>
  This creates a GetImportProgressOption for Zilliz Cloud クラスター, pre-filling `APIKey` and `ClusterID`.

