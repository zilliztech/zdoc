---
title: "RefreshLoad | Go | v2"
slug: /go/go/v2-Management-RefreshLoad
sidebar_label: "RefreshLoad"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、新しく挿入されたデータを検索結果に含めるためにコレクションを再読み込みします。 | Go | v2"
type: docx
token: Ava5d8VRjo9lM2x0fJccDqi5nHd
sidebar_position: 22
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - zilliz
  - Zilliz Cloud
  - クラウド
  - RefreshLoad
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshLoad

この操作は、新しく挿入されたデータを検索結果に含めるためにコレクションを再読み込みします。

```go
func (c *Client) RefreshLoad(ctx context.Context, option RefreshLoadOption, callOptions ...grpc.CallOption) (LoadTask, error)
```

## リクエスト構文\{#request-syntax}

RefreshLoad() のリクエストを作成します。

```go
option := milvusclient.NewRefreshLoadOption(collectionName)

result, err := client.RefreshLoad(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewRefreshLoadOption(collectionName string)`

    RefreshLoad() のリクエストを作成します。

**戻り値の型:**

*LoadTask, error*

**戻り値:**

ロード操作が完了するまで待機するために使用できる LoadTask です。操作が失敗した場合は、エラーを返します。

**メソッド:**

- **Await** (*error*) -

    更新後のロードが完了したことが確認されるまでブロックし、更新の進行状況が 100 を報告するか、コンテキストがキャンセルされるまで、タスクのチェック間隔でサーバーをポーリングします。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

RefreshLoad() の使用例を示します。

```go
import (
	"context"

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

loadTask, err := cli.RefreshLoad(ctx, milvusclient.NewRefreshLoadOption(collectionName))
if err != nil {
	// handle err
}
err = loadTask.Await(ctx)
if err != nil {
	// handler err
}
```
