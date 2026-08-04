---
title: "ListImportJobsOption | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobsOption
sidebar_label: "ListImportJobsOption"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この型は、RESTful API を介して collection の一括インポートジョブを一覧表示するリクエストを構成します。`NewListImportJobsOption()` で構築すると、デフォルトで `CurrentPage 1, PageSize: 10` になります。`With` ビルダーメソッドをチェーンして、ページネーションの変更、API key の追加、またはデフォルト値の上書きができます。 | Go | v2"
type: docx
token: KUFtdKbFpoTdtkxw4y3cYWhHnUe
sidebar_position: 8
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobsOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobsOption

この型は、RESTful API を介して collection の一括インポートジョブを一覧表示するリクエストを構成します。`NewListImportJobsOption()` で構築すると、デフォルトで `CurrentPage: 1, PageSize: 10` になります。`With*` ビルダーメソッドをチェーンして、ページネーションの変更、API key の追加、またはデフォルト値の上書きができます。

```go
type ListImportJobsOption struct {
    URL            string
    CollectionName string
    ClusterID      string
    APIKey         string
    PageSize       int
    CurrentPage    int
}
```

**FIELDS:**

- **URL** (*string*) -<br/>
  Milvus または Zilliz Cloud cluster のベース URL です。パスは含めないでください。関数が `/v2/vectordb/jobs/import/list` を自動的に追加します。

- **CollectionName** (*string*) -<br/>
  一覧表示するインポートジョブの対象となる collection の名前です。必須です。

- **ClusterID** (*string*) -<br/>
  Zilliz Cloud cluster ID です。省略可能で、cloud インポートでのみ使用されます。

- **APIKey** (*string*) -<br/>
  `Bearer` ヘッダーとして送信される認可トークンです。省略可能ですが、サーバーがトークンベース認証を強制する場合は必須です。

- **PageSize** (*int*) -<br/>
  1 ページあたりに返されるジョブ数です。デフォルトは `10` です。上書きするには `WithPageSize()` を使用します。

- **CurrentPage** (*int*) -<br/>
  `1` から始まるページインデックスです。デフォルトは `1` です。上書きするには `WithCurrentPage()` を使用します。

**BUILDER METHODS:**

- `WithAPIKey(key string)`<br/>
  これは、`Bearer` ヘッダーとして送信される認可トークンを設定します。

- `WithPageSize(pageSize int)`<br/>
  これは、1 ページあたりに返されるジョブ数を設定します。

- `WithCurrentPage(currentPage int)`<br/>
  これは、`1` から始まるページインデックスを設定します。

**CONSTRUCTORS:**

- `NewListImportJobsOption(uri string, collectionName string)`

    これは、妥当なデフォルト値（`CurrentPage: 1, PageSize: 10`）で ListImportJobsOption を作成します。
