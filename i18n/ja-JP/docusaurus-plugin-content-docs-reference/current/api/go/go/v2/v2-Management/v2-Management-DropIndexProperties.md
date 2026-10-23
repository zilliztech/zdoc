---
title: "DropIndexProperties | Go | v2"
slug: /go/go/v2-Management-DropIndexProperties
sidebar_label: "DropIndexProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のインデックスから 1 つ以上のプロパティを削除します。 | Go | v2"
type: docx
token: DdDQdWN3OoSwZbxFTebctTRFnZf
sidebar_position: 8
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - クラウド
  - DropIndexProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropIndexProperties

この操作は、既存のインデックスから 1 つ以上のプロパティを削除します。

```go
func (c *Client) DropIndexProperties(ctx context.Context, opt DropIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropIndexProperties() のリクエストを作成します。

```go
option := milvusclient.NewDropIndexPropertiesOption(collectionName, indexName, keys...)

err := client.DropIndexProperties(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **indexName** (*string*) -

    **[必須]**

    インデックスの名前です。

- **keys** (*...string*) -

    **[必須]**

    DropIndexProperties のキーです。

**ビルダーメソッド:**

- `NewDropIndexPropertiesOption(collectionName string, indexName string, keys ...string)`

    インデックスのプロパティを削除するためのオプションを作成します。`collectionName` はコレクションを指定し、`indexName` はインデックスを指定し、`keys` は削除するプロパティキーを列挙します。

**戻り値の型:**

*error*

**戻り値:**

インデックスのプロパティが削除された後に nil を返します。操作が失敗した場合は、エラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。リクエストの構築または RPC が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropIndexProperties() の使用例を示します。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.DropIndexProperties(ctx, milvusclient.NewDropIndexPropertiesOption("books", "vector_index", "mmap.enabled"))
if err != nil {
	// handle error
}
```
