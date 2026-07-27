---
title: "RefreshExternalCollection() | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルとのマッピング関係を記録するメタデータファイルを生成します。 | Go | v2"
type: docx
token: Mw42dp2VZoN4gFxdiSYcxDB8n0g
sidebar_position: 28
keywords: 
  - ベクトル類似性検索
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

この操作は、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルとのマッピング関係を記録するメタデータファイルを生成します。

```go
func (c *Client) RefreshExternalCollection(ctx context.Context, option RefreshExternalCollectionOption, callOptions ...grpc.CallOption) (*RefreshExternalCollectionResult, error)
```

## リクエスト構文\{#request-syntax}

```go
option := client.NewRefreshExternalCollectionOption(collectionName).
    WithExternalSource(externalSource string).
    WithExternalSpec(externalSpec string).
    WithDbName(dbName string)
    
result, err := client.RefreshExternalCollection(option)
```

**パラメータ:**

- **collectionName** (*string*) -

    既存の external collection の名前。

**ビルダーメソッド:**

- `WithExternalSource(externalSource string)`

    ソースデータ URI を設定します。これはアクセス可能な外部ボリュームの名前である必要があります。

- `WithExternalSpec(externalSpec string)`

    外部ソースの仕様であり、一連の二次パラメータです。

    - **format** (*string*) - 

        対象のソースデータファイルの形式。

        指定可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

- `WithDbName(dbName string)`

    対象の external collection が属するデータベースの名前。

**戻り値の型:**

*&ast;RefreshExternalCollectionResult*

**戻り値:**

以下の形式の型 struct です。

```go
type RefreshExternalCollectionResult struct {
    JobID int64
}
```

**パラメータ:**

- **JobID** (*int64*) -

    作成された非同期ジョブを示す整数です。

## 例\{#examples}

```python
refreshResult, err := client.RefreshExternalCollection(ctx,
    client.NewRefreshExternalCollectionOption("test_collection"))

jobID := refreshResult.JobID

for {
    progress, _ := client.GetRefreshExternalCollectionProgress(ctx,
        client.NewGetRefreshExternalCollectionProgressOption(jobID))

    fmt.Printf("State: %s\n", progress.State)

    if progress.State == entity.RefreshStateCompleted {
        fmt.Println("Refresh completed!")
        break
    }
    if progress.State == entity.RefreshStateFailed {
        fmt.Printf("Refresh failed: %s\n", progress.Reason)
        break
    }
    time.Sleep(2 * time.Second)
}
```
