---
title: "ListIndexes | Go | v2"
slug: /go/go/v2-Management-ListIndexes
sidebar_label: "ListIndexes"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションに構築されたすべてのインデックスを一覧表示します。 | Go | v2"
type: docx
token: R53fdYWNAorBuUxdrF7cSuovnnf
sidebar_position: 16
keywords: 
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - zilliz
  - zilliz cloud
  - クラウド
  - ListIndexes
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListIndexes

この操作は、指定したコレクションに構築されたすべてのインデックスを一覧表示します。

```go
func (c *Client) ListIndexes(ctx context.Context, opt ListIndexOption, callOptions ...grpc.CallOption) ([]string, error)
```

## リクエスト構文\{#request-syntax}

ListIndexes() のリクエストを作成します。

```go
option := milvusclient.NewListIndexOption(collectionName).
    WithFieldName(fieldName)

result, err := client.ListIndexes(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

**ビルダーメソッド:**

- `NewListIndexOption(collectionName string)`

    ListIndexes() のリクエストを作成します。

- `WithFieldName(fieldName string)`

    操作のフィールド名を設定します。

**戻り値の型:**

*[]string, error*

**戻り値:**

インデックス名のリストです。操作が失敗した場合はエラーを返します。

**パラメーター:**

- **result** (*[]string*) -

    ListIndexes() によって返される []string 値です。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

ListIndexes() の使用例を示します。

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
	// handle err
}

indexes, err := cli.ListIndexes(ctx, milvusclient.NewListIndexOption("my_collection").WithFieldName("my_vector"))
if err != nil {
	// handle err
}
fmt.Println(indexes)
```
