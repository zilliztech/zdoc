---
title: "RefreshLoad() | Go | v2"
slug: /go/go/v2-Management-RefreshLoad
sidebar_label: "RefreshLoad()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、新しく挿入されたデータを検索結果に含めるためにコレクションを再ロードします。 | Go | v2"
type: docx
token: VtZWdaMz6o9iYrxcEaMcsnJin0e
sidebar_position: 23
keywords: 
  - LLM のハルシネーション
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - zilliz
  - zilliz cloud
  - クラウド
  - RefreshLoad()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshLoad()

この操作は、新しく挿入されたデータを検索結果に含めるためにコレクションを再ロードします。

```go
func (c *Client) RefreshLoad(ctx context.Context, option RefreshLoadOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewRefreshLoadOption(collectionName)

result, err := client.RefreshLoad(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

**戻り値の型:**

*LoadTask, error*

**戻り値:**

ロード操作の完了を待機するために使用できる LoadTask を返します。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

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

loadTask, err := cli.RefreshLoad(ctx, milvusclient.NewRefreshLoadOption(collectionName))
if err != nil {
	// handle err
}
err = loadTask.Await(ctx)
if err != nil {
	// handler err
}
```
