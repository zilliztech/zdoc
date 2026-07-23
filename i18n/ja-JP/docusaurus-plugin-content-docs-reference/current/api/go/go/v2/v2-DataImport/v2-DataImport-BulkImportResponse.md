---
title: "BulkImportResponse | Go | v2"
slug: /go/go/v2-DataImport-BulkImportResponse
sidebar_label: "BulkImportResponse"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`BulkImport()` パッケージ関数によって返されるレスポンスを表すクラスです。共通の `Status` フィールドと `Message` フィールドのために `ResponseBase` を埋め込み、割り当てられたインポートジョブ ID を `Data.JobID` で公開します。`Data` を読み取る前に、埋め込まれた `CheckStatus()` メソッドを使用して呼び出しが成功したことを確認してください。 | Go | v2"
type: docx
token: A3WWdqm52oLqtuxaR9EcjmybnwT
sidebar_position: 3
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImportResponse
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImportResponse

このクラスは、`BulkImport()` パッケージ関数によって返されるレスポンスを表します。共通の `Status` フィールドと `Message` フィールドのために `ResponseBase` を埋め込み、割り当てられたインポートジョブ ID を `Data.JobID` で公開します。`Data` を読み取る前に、埋め込まれた `CheckStatus()` メソッドを使用して呼び出しが成功したことを確認してください。

```go
type BulkImportResponse struct {
    ResponseBase
    Data struct {
        JobID string `json:"jobId"`
    } `json:"data"`
}
```

**FIELDS:**

- **Status** (*int*) -<br/>
  `ResponseBase` から継承されます。値が `0` の場合は成功を示し、それ以外の値はエラーを示します。

- **Message** (*string*) -<br/>
  `ResponseBase` から継承されます。`Status` がゼロ以外の場合の、人が読める形式のエラー説明です。

- **Data.JobID** (*string*) -<br/>
  送信された bulk import ジョブに割り当てられる一意の識別子です。完了状況を追跡するには、これを `GetImportProgress()` に渡します。

**METHODS:**

- `CheckStatus()`

    これはレスポンスのステータスを検証します。`Status == 0` の場合は nil を返し、それ以外の場合は `Status` と `Message` を含む整形済みエラーを返します。
