---
title: "AlterIndexProperties() | Go | v2"
slug: /go/go/v2-Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存のインデックスのプロパティを変更します。 | Go | v2"
type: docx
token: XzLnd1w4uo2RM0xS8UWc5K6in1R
sidebar_position: 1
keywords: 
  - 類似検索
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - クラウド
  - AlterIndexProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterIndexProperties()

この操作は既存のインデックスのプロパティを変更します。

```go
func (c *Client) AlterIndexProperties(ctx context.Context, opt AlterIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewAlterIndexPropertiesOption(collectionName, indexName).
    WithProperty(key, value)

err := client.AlterIndexProperties(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

- **indexName** (*string*)

    インデックスの名前。

**オプションメソッド:**

- `WithProperty(key string, value any)`

    リソースにカスタムプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil、失敗した場合は問題の内容を示す error を返します。

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

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle err
}
defer cli.Close(ctx)

err = cli.AlterIndexProperties(ctx, milvusclient.NewAlterIndexPropertiesOption("my_collection", "my_index").
	WithProperty("mmap.enabled", true))
if err != nil {
	// handle err
}
```
