---
title: "Flush() | Go | v2"
slug: /go/go/v2-Management-Flush
sidebar_label: "Flush()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、挿入されたすべてのデータを永続ストレージにフラッシュし、データの耐久性を確保します。 | Go | v2"
type: docx
token: VUaadf505oQMTDx14XgcwJyNnDf
sidebar_position: 9
keywords: 
  - プライベート LLM
  - 近似最近傍探索
  - LLM 評価
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - Flush()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Flush()

この操作は、挿入されたすべてのデータを永続ストレージにフラッシュし、データの耐久性を確保します。

```go
func (c *Client) Flush(ctx context.Context, option FlushOption, callOptions ...grpc.CallOption) (*FlushTask, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewFlushOption(collName)

result, err := client.Flush(ctx, option)
```

**パラメータ:**

- **collName** (*string*)

    コレクション名です。

**戻り値の型:**

&ast;*[FlushTask](./v2-Management-FlushTask), error*

**戻り値:**

フラッシュの完了を待機するために使用できる FlushTask を返します。操作が失敗した場合はエラーが返されます。

**例外:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
