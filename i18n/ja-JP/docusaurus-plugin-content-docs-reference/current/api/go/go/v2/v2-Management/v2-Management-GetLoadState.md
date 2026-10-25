---
title: "GetLoadState | Go | v2"
slug: /go/go/v2-Management-GetLoadState
sidebar_label: "GetLoadState"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションまたはパーティションの現在のロード状態と進行状況を返します。 | Go | v2"
type: docx
token: GnxodY26PoUgOIxa5ihc2e0MnK0
sidebar_position: 12
keywords: 
  - Pinecone ベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル
  - zilliz
  - zilliz cloud
  - クラウド
  - GetLoadState
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetLoadState

この操作は、コレクションまたはパーティションの現在のロード状態と進行状況を返します。

```go
func (c *Client) GetLoadState(ctx context.Context, option GetLoadStateOption, callOptions ...grpc.CallOption) (entity.LoadState, error)
```

## リクエスト構文\{#request-syntax}

GetLoadState() のリクエストを作成します。

```go
option := milvusclient.NewGetLoadStateOption(collectionName, partitionNames)

result, err := client.GetLoadState(ctx, option)
```

**パラメーター：**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **partitionNames** (*...string*) -

    **[必須]**

    対象パーティションの名前です。

**ビルダーメソッド：**

- `NewGetLoadStateOption(collectionName string, partitionNames ...string)`

    GetLoadState() のリクエストを作成します。

**戻り値の型：**

*entity.LoadState, error*

**戻り値：**

コレクションまたはパーティションの現在のロード状態です。操作が失敗した場合は、エラーを返します。

```go
type LoadState struct {
    State LoadStateCode
    Progress int64
}
```

**パラメーター：**

- **State** (*LoadStateCode*) -

    現在の状態です。LoadStateLoading、LoadStateLoaded、LoadStateUnloading、または LoadStateNotLoad のいずれかです。

- **Progress** (*int64*) -

    進捗率です。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細を確認するには、`err != nil` を確認してください。

## 例\{#example}

GetLoadState() の使用例を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

collectionName := `customized_setup_1`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

loadState, err := cli.GetLoadState(ctx, milvusclient.NewGetLoadStateOption(collectionName))
if err != nil {
	// handle err
}
fmt.Println(loadState)
```
