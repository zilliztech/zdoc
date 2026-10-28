---
title: "GetExportSnapshotState | Go | v2"
slug: /go/go/v2-Snapshot-GetExportSnapshotState
sidebar_label: "GetExportSnapshotState"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、非同期スナップショットエクスポートジョブのステータスと進行状況を照会します。 | Go | v2"
type: docx
token: Coq7d7x5qoOApzxWQAZcQ2wSnee
sidebar_position: 4
keywords: 
  - Milvus オープンソース
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - GetExportSnapshotState
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetExportSnapshotState

この操作は、非同期スナップショットエクスポートジョブのステータスと進行状況を照会します。

```go
func (c *Client) GetExportSnapshotState(ctx context.Context, opt GetExportSnapshotStateOption, callOptions ...grpc.CallOption) (*milvuspb.ExportSnapshotInfo, error)
```

## リクエスト構文\{#request-syntax}

GetExportSnapshotState() のリクエストを作成します。

```go
option := milvusclient.NewGetExportSnapshotStateOption(jobID)

info, err := cli.GetExportSnapshotState(ctx, option)
```

**パラメーター：**

- **jobID** (*int64*) -

    **[必須]**

    `ExportSnapshot()` によって返されるジョブ ID です。

**ビルダーメソッド：**

- `NewGetExportSnapshotStateOption(jobID int64)`

    照会するエクスポートジョブの新しいオプションを作成します。

**戻り値の型：**

*milvuspb.ExportSnapshotInfo, error*

**戻り値：**

指定されたエクスポートスナップショットジョブの永続状態です。操作が失敗した場合はエラーを返します。

**パラメーター：**

- **result** (*milvuspb.ExportSnapshotInfo*) -

    指定されたエクスポートスナップショットジョブの永続状態です。

**エラー処理：**

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
