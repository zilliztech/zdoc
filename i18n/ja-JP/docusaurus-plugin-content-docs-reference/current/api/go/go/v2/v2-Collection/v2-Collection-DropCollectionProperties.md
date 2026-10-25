---
title: "DropCollectionProperties | Go | v2"
slug: /go/go/v2-Collection-DropCollectionProperties
sidebar_label: "DropCollectionProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションから指定されたプロパティを削除します。 | Go | v2"
type: docx
token: V7Zydmw53obtpRxMfqCcjj62njH
sidebar_position: 14
keywords: 
  - ベクトルデータベースのチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベースの比較
  - OpenAI ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - DropCollectionProperties
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropCollectionProperties

この操作は、コレクションから指定されたプロパティを削除します。

```go
func (c *Client) DropCollectionProperties(ctx context.Context, option DropCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropCollectionProperties() のリクエストを作成します。

```go
option := milvusclient.NewDropCollectionPropertiesOption(collection, propertyKeys)

err := client.DropCollectionProperties(ctx, option)
```

**パラメーター:**

- **コレクション** (*string*) -

    **[必須]**

    コレクションです。

- **propertyKeys** (*...string*) -

    **[必須]**

    プロパティキーです。

**ビルダーメソッド:**

- `NewDropCollectionPropertiesOption(collection string, propertyKeys ...string)`

    DropCollectionProperties() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示すエラーを返します。

**エラーハンドリング:**

- **error**

    操作が失敗します。失敗の詳細については、`err != nil` を確認してください。

## 例\{#example}

DropCollectionProperties() の使用例を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
	"github.com/milvus-io/milvus/pkg/v2/common"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

err = cli.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", common.CollectionTTLConfigKey))
if err != nil {
	// handle error
}
```
