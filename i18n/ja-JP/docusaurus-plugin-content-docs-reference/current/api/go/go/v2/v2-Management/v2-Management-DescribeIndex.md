---
title: "DescribeIndex | Go | v2"
slug: /go/go/v2-Management-DescribeIndex
sidebar_label: "DescribeIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、インデックスの種類やパラメーターを含む詳細情報を返します。 | Go | v2"
type: docx
token: PcKJdVvSkolLwnxpiQUcHO9Mnfh
sidebar_position: 6
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex

この操作は、インデックスの種類やパラメーターを含む詳細情報を返します。

```go
func (c *Client) DescribeIndex(ctx context.Context, opt DescribeIndexOption, callOptions ...grpc.CallOption) (IndexDescription, error)
```

## リクエスト構文\{#request-syntax}

DescribeIndex() のリクエストを作成します。

```go
option := milvusclient.NewDescribeIndexOption(collectionName, indexName)

result, err := client.DescribeIndex(ctx, option)
```

**パラメーター：**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **indexName** (*string*) -

    **[必須]**

    インデックスの名前です。

**ビルダーメソッド：**

- `NewDescribeIndexOption(collectionName string, indexName string)`

    DescribeIndex() のリクエストを作成します。

**戻り値の型：**

*IndexDescription, error*

**戻り値：**

種類、メトリック、パラメーターを含むインデックスの詳細情報を返します。操作が失敗した場合はエラーを返します。

```go
type IndexDescription struct {
    index.Index
    State index.IndexState
    PendingIndexRows int64
    TotalRows int64
    IndexedRows int64
}
```

**パラメーター：**

- **State** (*index.IndexState*) -

    現在の状態です。

- **PendingIndexRows** (*int64*) -

    インデックス作成待ちの行数です。

- **TotalRows** (*int64*) -

    行の合計数です。

- **IndexedRows** (*int64*) -

    インデックス作成済みの行数です。

**エラー処理：**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DescribeIndex() の使用例を示します。

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

indexInfo, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
fmt.Println(indexInfo)
```
