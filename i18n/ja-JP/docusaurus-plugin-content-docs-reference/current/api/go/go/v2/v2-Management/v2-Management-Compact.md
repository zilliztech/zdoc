---
title: "Compact | Go | v2"
slug: /go/go/v2-Management-Compact
sidebar_label: "Compact"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は Compaction をトリガーし、小さなデータセグメントをより大きなセグメントにマージして、パフォーマンスを向上させます。 | Go | v2"
type: docx
token: Tex5dSQ3FoaEWGxTo7xcMPISndc
sidebar_position: 2
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - Compact
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Compact

この操作は Compaction をトリガーし、小さなデータセグメントをより大きなセグメントにマージして、パフォーマンスを向上させます。

```go
func (c *Client) Compact(ctx context.Context, option CompactOption, callOptions ...grpc.CallOption) (int64, error)
```

## リクエスト構文\{#request-syntax}

Compact() のリクエストを作成します。

```go
option := milvusclient.NewCompactOption(collectionName)

result, err := client.Compact(ctx, option)
```

**パラメーター：**

- **collectionName** (*string*) -

    **[必須]**

    対象のコレクションの名前です。

**ビルダーメソッド：**

- `NewCompactOption(collectionName string)`

    Compact() のリクエストを作成します。

**戻り値の型：**

*int64, error*

**戻り値：**

数値の結果値を返します。操作が失敗した場合はエラーを返します。

**パラメーター：**

- **result** (*int64*) -

    Compact() から返される int64 値です。

**エラー処理：**

- **error**

    操作が失敗した場合に発生します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

Compact() の使用例を示します。

```go
import (
	"context"
	"fmt"

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

compactID, err := cli.Compact(ctx, milvusclient.NewCompactOption(collectionName))
if err != nil {
	// handle err
}
fmt.Println(compactID)
```
