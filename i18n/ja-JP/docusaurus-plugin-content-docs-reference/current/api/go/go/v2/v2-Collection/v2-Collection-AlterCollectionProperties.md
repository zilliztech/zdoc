---
title: "AlterCollectionProperties | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションのプロパティを変更します。 | Go | v2"
type: docx
token: Q9Atd2A9LoykWSxJHuXcq09xnRg
sidebar_position: 5
keywords: 
  - llm-as-a-judge
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - AlterCollectionProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties

この操作は、既存のコレクションのプロパティを変更します。

```go
func (c *Client) AlterCollectionProperties(ctx context.Context, option AlterCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

AlterCollectionProperties() のリクエストを作成します。

```go
option := milvusclient.NewAlterCollectionPropertiesOption(collection).
    WithProperty(key, value)

err := client.AlterCollectionProperties(ctx, option)
```

**パラメーター:**

- **コレクション** (*string*) -

    **[必須]**

    コレクションです。

**ビルダーメソッド:**

- `NewAlterCollectionPropertiesOption(collection string)`

    AlterCollectionProperties() のリクエストを作成します。

- `WithProperty(key string, value any)`

    リソースにカスタムプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**エラー処理:**

- **error**

    操作は失敗します。失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

AlterCollectionProperties() の使用例を示します。

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

err = cli.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
	// handle error
}
```
