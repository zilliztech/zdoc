---
title: "DropAlias | Go | v2"
slug: /go/go/v2-Collection-DropAlias
sidebar_label: "DropAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、コレクションのエイリアスを削除します。 | Go | v2"
type: docx
token: Y0S5dzY9coF6EDxHhBkcBKXhnJh
sidebar_position: 12
keywords: 
  - ANNS
  - ベクトル検索
  - knn アルゴリズム
  - HNSW
  - zilliz
  - zilliz cloud
  - クラウド
  - DropAlias
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropAlias

この操作では、コレクションのエイリアスを削除します。

```go
func (c *Client) DropAlias(ctx context.Context, option DropAliasOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropAlias() のリクエストを作成します。

```go
option := milvusclient.NewDropAliasOption(alias)

err := client.DropAlias(ctx, option)
```

**パラメーター:**

- **alias** (*string*) -

    **[必須]**

    割り当てるエイリアス名です。

**ビルダーメソッド:**

- `NewDropAliasOption(alias string)`

    DropAlias() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は発生した問題を説明するエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropAlias() の使用例を示します。

```go
import (
	"context"

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

err = cli.DropAlias(ctx, milvusclient.NewDropAliasOption("alice"))
if err != nil {
	// handle error
}
```
