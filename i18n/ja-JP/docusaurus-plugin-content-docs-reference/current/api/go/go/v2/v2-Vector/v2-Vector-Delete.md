---
title: "削除 | Go | v2"
slug: /go/go/v2-Vector-Delete
sidebar_label: "削除"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、プライマリキー値またはフィルター式によってコレクションからエンティティを削除します。 | Go | v2"
type: docx
token: UsNSd8reIoOaBCxH2s7cvMIDnUf
sidebar_position: 7
keywords: 
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトル DB とは
  - ベクトルデータベースとは
  - zilliz
  - zilliz cloud
  - クラウド
  - 削除
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# 削除

この操作では、プライマリキー値またはフィルター式によってコレクションからエンティティを削除します。

```go
func (c *Client) Delete(ctx context.Context, option DeleteOption, callOptions ...grpc.CallOption) (DeleteResult, error)
```

## リクエスト構文\{#request-syntax}

Delete() のリクエストを作成します。

```go
option := milvusclient.NewDeleteOption(collectionName).
    WithExpr(expr).
    WithInt64IDs(fieldName, ids).
    WithStringIDs(fieldName, ids).
    WithPartition(partitionName)

result, err := client.Delete(ctx, option)
```

**パラメーター：**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

**ビルダーメソッド：**

- `NewDeleteOption(collectionName string)`

    Delete() のリクエストを作成します。

- `WithExpr(expr string)`

    操作の expr を設定します。

- `WithTemplateParam(key string, val any)`

    式評価のテンプレートパラメーターを設定します。

- `WithInt64IDs(fieldName string, ids []int64)`

    操作の int64 ID を設定します。

- `WithStringIDs(fieldName string, ids []string)`

    操作の文字列 ID を設定します。

- `WithPartition(partitionName string)`

    操作のパーティションを設定します。

- `WithNamespace(namespace string)`

    削除のスコープをコレクションの名前空間に限定します。

**戻り値の型：**

*DeleteResult, error*

**戻り値：**

削除結果です。操作が失敗した場合はエラーを返します。

```go
type DeleteResult struct {
    DeleteCount int64
}
```

**パラメーター：**

- **DeleteCount** (*int64*) -

    影響を受けたエンティティの数です。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

Delete() の使用方法を示します。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

res, err := cli.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
	WithInt64IDs("id", []int64{1, 2, 3}))
if err != nil {
	// handle error
}

fmt.Println(res.DeleteCount)
```
