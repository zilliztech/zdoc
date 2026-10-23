---
title: "Flush | Go | v2"
slug: /go/go/v2-Management-Flush
sidebar_label: "Flush"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、挿入されたすべてのデータを永続ストレージにフラッシュし、データの耐久性を確保します。 | Go | v2"
type: docx
token: JhQ6djjqiocqgYxLmQOcdgQqnJb
sidebar_position: 9
keywords: 
  - NLP 検索
  - LLM のハルシネーション
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - zilliz
  - zilliz cloud
  - クラウド
  - Flush
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Flush

この操作は、挿入されたすべてのデータを永続ストレージにフラッシュし、データの耐久性を確保します。

```go
func (c *Client) Flush(ctx context.Context, option FlushOption, callOptions ...grpc.CallOption) (*FlushTask, error)
```

## リクエスト構文\{#request-syntax}

Flush() のリクエストを作成します。

```go
option := milvusclient.NewFlushOption(collName)

result, err := client.Flush(ctx, option)
```

**パラメーター:**

- **collName** (*string*) -

    **[必須]**

    コレクション名です。

**ビルダーメソッド:**

- `NewFlushOption(collName string)`

    Flush() のリクエストを作成します。

**戻り値の型:**

&ast;*FlushTask, error*

**戻り値:**

Flush の完了を待つために使用できる FlushTask です。操作が失敗した場合は、エラーを返します。

**メソッド:**

- **Await** (*error*) -

    Flush が完了したことが確認されるまでブロックし、コレクションが Flush 済みを報告するか、コンテキストがキャンセルされるまで、タスクのチェック間隔でサーバーをポーリングします。

- **GetFlushStats** (<em>(segIDs []int64, flushSegIDs []int64, flushTs uint64, channelCheckpoints map[string]</em>msgpb.MsgPosition)&ast;) -

    Flush を要求されたセグメント ID、すでに Flush されたセグメント ID、Flush のタイムスタンプ、およびサーバーから報告されたチャネルチェックポイントを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細を確認するには、`err != nil` を確認してください。

## 例\{#example}

Flush() の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

collectionName := `customized_setup_1`

task, err := cli.Flush(ctx, milvusclient.NewFlushOption(collectionName))
if err != nil {
	// handle err
}

err = task.Await(ctx)
if err != nil {
	// handle err
}
```
