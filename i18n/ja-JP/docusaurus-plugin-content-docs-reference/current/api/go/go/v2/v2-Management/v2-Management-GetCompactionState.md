---
title: "GetCompactionState | Go | v2"
slug: /go/go/v2-Management-GetCompactionState
sidebar_label: "GetCompactionState"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、Compaction 操作の現在の状態を返します。 | Go | v2"
type: docx
token: Uql8dQNxAoemIOxWgoLcORJenKe
sidebar_position: 11
keywords: 
  - Milvus の仕組み
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - zilliz
  - Zilliz Cloud
  - クラウド
  - GetCompactionState
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetCompactionState

この操作は、Compaction 操作の現在の状態を返します。

```go
func (c *Client) GetCompactionState(ctx context.Context, option GetCompactionStateOption, callOptions ...grpc.CallOption) (entity.CompactionState, error)
```

## リクエスト構文\{#request-syntax}

GetCompactionState() のリクエストを作成します。

```go
option := milvusclient.NewGetCompactionStateOption(compactionID)

result, err := client.GetCompactionState(ctx, option)
```

**パラメーター：**

- **compactionID** (*int64*) -

    **[必須]**

    Compaction ID の値。

**ビルダーメソッド：**

- `NewGetCompactionStateOption(compactionID int64)`

    GetCompactionState() のリクエストを作成します。

**戻り値の型：**

*entity.CompactionState, error*

**戻り値：**

Compaction 操作の現在の状態を返します。操作が失敗した場合はエラーを返します。

**パラメーター：**

- **CompactionStateRunning** (*entity.CompactionState*) -

    Compaction は現在実行中です（基盤となる CompactionState_Executing 状態にマッピングされます）。

- **CompactionStateCompleted** (*entity.CompactionState*) -

    Compaction は完了しています（基盤となる CompactionState_Completed 状態にマッピングされます）。

**エラーハンドリング：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

GetCompactionState() の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

compactID := int64(123)

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

state, err := cli.GetCompactionState(ctx, milvusclient.NewGetCompactionStateOption(compactID))
if err != nil {
	// handle err
}
fmt.Println(state)
```
