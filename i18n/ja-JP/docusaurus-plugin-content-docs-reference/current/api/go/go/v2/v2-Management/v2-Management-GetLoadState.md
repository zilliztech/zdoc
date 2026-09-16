---
title: "GetLoadState() | Go | v2"
slug: /go/go/v2-Management-GetLoadState
sidebar_label: "GetLoadState()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションまたはパーティションの現在のロード状態と進捗を返します。 | Go | v2"
type: docx
token: AvOXd92pPoAXPcxvArwcvKnSnph
sidebar_position: 12
keywords: 
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - 密埋め込み
  - Faiss ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - GetLoadState()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetLoadState()

この操作は、コレクションまたはパーティションの現在のロード状態と進捗を返します。

```go
func (c *Client) GetLoadState(ctx context.Context, option GetLoadStateOption, callOptions ...grpc.CallOption) (entity.LoadState, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewGetLoadStateOption(collectionName, partitionNames)

result, err := client.GetLoadState(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

- **partitionNames** (*...string*)

    パーティションの名前。

**戻り値の型:**

*[entity.LoadState](./v2-Management-LoadState), error*

**戻り値:**

コレクションまたはパーティションの現在のロード状態。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
