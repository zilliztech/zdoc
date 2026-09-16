---
title: "Compact() | Go | v2"
slug: /go/go/v2-Management-Compact
sidebar_label: "Compact()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は Compaction をトリガーし、小さなデータセグメントをより大きなデータセグメントにマージしてパフォーマンスを向上させます。 | Go | v2"
type: docx
token: VJKcdlljXofguixcGe5c2CwwnEf
sidebar_position: 2
keywords: 
  - ANN Search
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - zilliz
  - zilliz cloud
  - cloud
  - Compact()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Compact()

この操作は Compaction をトリガーし、小さなデータセグメントをより大きなデータセグメントにマージしてパフォーマンスを向上させます。

```go
func (c *Client) Compact(ctx context.Context, option CompactOption, callOptions ...grpc.CallOption) (int64, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewCompactOption(collectionName)

result, err := client.Compact(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象コレクションの名前です。

**戻り値の型:**

*int64, error*

**戻り値:**

数値の結果値です。操作が失敗した場合はエラーが返されます。

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

collectionName := `customized_setup_1`

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}

compactID, err := cli.Compact(ctx, milvusclient.NewCompactOption(collectionName))
if err != nil {
	// handle err
}
fmt.Println(compactID)
```
