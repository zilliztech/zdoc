---
title: "CreateAlias | Go | v2"
slug: /go/go/v2-Collection-CreateAlias
sidebar_label: "CreateAlias"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はコレクションのエイリアスを作成し、別名で参照できるようにします。 | Go | v2"
type: docx
token: YJuQdfyRfonHrTxLh6ucA3EDnQf
sidebar_position: 8
keywords: 
  - 近似最近傍探索
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - zilliz
  - zilliz cloud
  - クラウド
  - CreateAlias
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreateAlias

この操作はコレクションのエイリアスを作成し、別名で参照できるようにします。

```go
func (c *Client) CreateAlias(ctx context.Context, option CreateAliasOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

CreateAlias() のリクエストを作成します。

```go
option := milvusclient.NewCreateAliasOption(collectionName, alias)

err := client.CreateAlias(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **alias** (*string*) -

    **[必須]**

    割り当てるエイリアス名です。

**ビルダーメソッド:**

- `NewCreateAliasOption(collectionName string, alias string)`

    CreateAlias() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示すエラーを返します。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

CreateAlias() の使用方法を示します。

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

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "bob"))
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "alice"))
if err != nil {
	// handle error
}
```
