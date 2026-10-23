---
title: "AlterIndexProperties | Go | v2"
slug: /go/go/v2-Management-AlterIndexProperties
sidebar_label: "AlterIndexProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のインデックスのプロパティを変更します。 | Go | v2"
type: docx
token: KAfCd9KE6oD9XmxgntMcfFNTn0c
sidebar_position: 1
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - クラウド
  - AlterIndexProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterIndexProperties

この操作は、既存のインデックスのプロパティを変更します。

```go
func (c *Client) AlterIndexProperties(ctx context.Context, opt AlterIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AlterIndexProperties() のリクエストを作成します。

```go
option := milvusclient.NewAlterIndexPropertiesOption(collectionName, indexName).
    WithProperty(key, value)

err := client.AlterIndexProperties(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[REQUIRED]**

    対象のコレクションの名前です。

- **indexName** (*string*) -

    **[REQUIRED]**

    インデックスの名前です。

**ビルダーメソッド:**

- `NewAlterIndexPropertiesOption(collectionName string, indexName string)`

    AlterIndexProperties() のリクエストを作成します。

- `WithProperty(key string, value any)`

    リソースにカスタムプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を示すエラーを返します。

**エラー処理:**

- **error**

    操作は失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

AlterIndexProperties() の使用例を示します。

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
defer cli.Close(ctx)

err = cli.AlterIndexProperties(ctx, milvusclient.NewAlterIndexPropertiesOption("my_collection", "my_index").
	WithProperty("mmap.enabled", true))
if err != nil {
	// handle err
}
```
