---
title: "ListImportJobsOption | Go | v2"
slug: /go/go/v2-DataImport-ListImportJobsOption
sidebar_label: "ListImportJobsOption"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This type configures a request to list bulk import jobs for a コレクション via the RESTful API. Construct it with `NewListImportJobsOption()`, which defaults to `CurrentPage 1, PageSize: 10`. Chain `With` builder methods to change pagination, add API keys, or override defaults. | Go | v2"
type: docx
token: KUFtdKbFpoTdtkxw4y3cYWhHnUe
sidebar_position: 8
keywords: 
  - Zilliz
  - milvus ベクトル データベース
  - milvus db
  - milvus ベクトル db
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobsOption
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListImportJobsOption

This type configures a request to list bulk import jobs for a コレクション via the RESTful API. Construct it with `NewListImportJobsOption()`, which defaults to `CurrentPage: 1, PageSize: 10`. Chain `With*` builder methods to change pagination, add API keys, or override defaults.

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
  The base URL of the Milvus or Zilliz Cloud クラスター. Do not include the path; the function appends `/v2/vectordb/jobs/import/list` automatically.

- **CollectionName** (*string*) -<br/>
  The name of the コレクション whose import jobs should be listed. Required.

- **ClusterID** (*string*) -<br/>
  The Zilliz Cloud クラスター ID. Optional; used only for cloud imports.

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
