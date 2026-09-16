---
title: "ListIndexes() | Go | v2"
slug: /go/go/v2-Management-ListIndexes
sidebar_label: "ListIndexes()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションに構築されたすべてのインデックスを一覧表示します。 | Go | v2"
type: docx
token: S8NxdJc1gom2SVxxNYkc5lHxnMg
sidebar_position: 17
keywords: 
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ
  - ベクトル データベース
  - zilliz
  - zilliz cloud
  - クラウド
  - ListIndexes()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListIndexes()

この操作は、指定したコレクションに構築されたすべてのインデックスを一覧表示します。

```go
func (c *Client) ListIndexes(ctx context.Context, opt ListIndexOption, callOptions ...grpc.CallOption) ([]string, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewListIndexOption(collectionName).
    WithFieldName(fieldName)

result, err := client.ListIndexes(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前です。

**オプションメソッド:**

- `WithFieldName(fieldName string)`

    操作のフィールド名を設定します。

**戻り値の型:**

*[]string, error*

**戻り値:**

名前のリストを返します。操作が失敗した場合はエラーを返します。

**例外:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

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

indexes, err := cli.ListIndexes(ctx, milvusclient.NewListIndexOption("my_collection").WithFieldName("my_vector"))
if err != nil {
	// handle err
}
fmt.Println(indexes)
```
