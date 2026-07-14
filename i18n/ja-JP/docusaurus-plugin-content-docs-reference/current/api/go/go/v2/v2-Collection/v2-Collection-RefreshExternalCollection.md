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
sidebar_position: 27
keywords: 
  - ベクトル類似検索
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

## Request Syntax\{#request-syntax}

```go
option := client.NewRefreshExternalCollectionOption(collectionName).
    WithExternalSource(externalSource string).
    WithExternalSpec(externalSpec string).
    WithDbName(dbName string)
    
result, err := client.RefreshExternalCollection(option)
```

**PARAMETERS:**

- **collectionName** (*string*) -

    既存の external collection の名前。

**BUILDER METHODS:**

- `WithExternalSource(externalSource string)`

    これはソースデータ URI を設定します。アクセス可能な外部 volume の名前である必要があります。

- `WithExternalSpec(externalSpec string)`

    外部ソースの仕様であり、一連の副次パラメータです。

    - **format** (*string*) - 

        対象のソースデータファイルの形式。

        指定可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

- `WithDbName(dbName string)`

    対象の external collection が属するデータベース名。

**RETURN TYPE:**

*&ast;RefreshExternalCollectionResult*

**RETURNS:**

以下の形式の struct 型です。

```go
type RefreshExternalCollectionResult struct {
    JobID int64
}
```

**PARAMETERS:**

- **JobID** (*int64*) -

    作成された非同期ジョブを示す整数。

## Examples\{#examples}

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
