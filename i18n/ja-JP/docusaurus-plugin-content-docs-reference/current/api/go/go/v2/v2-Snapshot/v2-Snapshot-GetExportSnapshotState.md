---
title: "GetExportSnapshotState | Go | v2"
slug: /go/go/v2-Snapshot-GetExportSnapshotState
sidebar_label: "GetExportSnapshotState"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、非同期のスナップショットエクスポートジョブのステータスと進行状況を照会します。 | Go | v2"
type: docx
token: Coq7d7x5qoOApzxWQAZcQ2wSnee
sidebar_position: 4
keywords: 
  - milvus オープンソース
  - milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - GetExportSnapshotState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetExportSnapshotState

この操作は、非同期のスナップショットエクスポートジョブのステータスと進行状況を照会します。

```go
func (c *Client) GetExportSnapshotState(ctx context.Context, opt GetExportSnapshotStateOption, callOptions ...grpc.CallOption) (*milvuspb.ExportSnapshotInfo, error)
```

## リクエスト構文\{#request-syntax}

GetExportSnapshotState() のリクエストを作成します。

```go
option := milvusclient.NewGetExportSnapshotStateOption(jobID)

info, err := cli.GetExportSnapshotState(ctx, option)
```

**パラメータ:**

- **jobID** (*int64*) -

    **[REQUIRED]**

    `ExportSnapshot()` によって返されるジョブ ID。

**ビルダーメソッド:**

- `NewGetExportSnapshotStateOption(jobID int64)`

    照会対象のエクスポートジョブの新しいオプションを作成します。

**戻り値の型:**

*milvuspb.ExportSnapshotInfo, error*

**戻り値:**

指定されたエクスポートスナップショットジョブの永続的な状態です。操作が失敗した場合はエラーを返します。

**パラメータ:**

- **result** (*milvuspb.ExportSnapshotInfo*) -

    指定されたエクスポートスナップショットジョブの永続的な状態です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

GetExportSnapshotState() の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

info, err := cli.GetExportSnapshotState(ctx, milvusclient.NewGetExportSnapshotStateOption(jobID))
if err != nil {
	// handle error
}

fmt.Printf("Export state: %v\n", info.GetState())
```
