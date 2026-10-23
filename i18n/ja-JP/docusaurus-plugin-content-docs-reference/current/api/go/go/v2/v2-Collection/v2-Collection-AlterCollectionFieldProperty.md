---
title: "AlterCollectionFieldProperty | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionFieldProperty
sidebar_label: "AlterCollectionFieldProperty"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "既存のコレクション内のフィールドのプロパティを変更します。 | Go | v2"
type: docx
token: DcWidpe28otXGSxUzvucDyrhnoc
sidebar_position: 4
keywords: 
  - 画像検索
  - LLM
  - 機械学習
  - RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - AlterCollectionFieldProperty
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperty

既存のコレクション内のフィールドのプロパティを変更します。

```go
func (c *Client) AlterCollectionFieldProperty(ctx context.Context, option AlterCollectionFieldPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AlterCollectionFieldProperty() のリクエストを作成します。

```go
option := milvusclient.NewAlterCollectionFieldPropertiesOption(collectionName, fieldName).
    WithProperty(key, value)

err := client.AlterCollectionFieldProperty(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象コレクションの名前です。

- **fieldName** (*string*) -

    **[必須]**

    AlterCollectionFieldProperty の fieldName です。

**ビルダーメソッド:**

- `NewAlterCollectionFieldPropertiesOption(collectionName string, fieldName string)`

    フィールドプロパティを変更するためのオプションを作成します。`collectionName` はコレクションを指定し、`fieldName` はプロパティを変更するフィールドを指定します。

- `WithProperty(key string, value any)`

    値を文字列表現に変換した後、フィールドプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

フィールドプロパティの変更後、nil を返します。操作が失敗した場合はエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。リクエストの構築または RPC が失敗します。失敗の詳細を確認するには、`err != nil` を確認してください。

## 例\{#example}

AlterCollectionFieldProperty() の使用例を示します。

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

err = cli.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption("books", "title").
	WithProperty("max_length", "512"))
if err != nil {
	// handle error
}
```
