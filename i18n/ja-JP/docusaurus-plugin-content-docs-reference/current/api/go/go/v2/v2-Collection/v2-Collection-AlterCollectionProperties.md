---
title: "AlterCollectionProperties() | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存の collection のプロパティを変更します。 | Go | v2"
type: docx
token: DumcdeKcuoSJybxv0V5ckFrFnyg
sidebar_position: 5
keywords: 
  - openai vector db
  - 自然言語処理データベース
  - 安価な vector データベース
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties()

この操作は既存の collection のプロパティを変更します。

```go
func (c *Client) AlterCollectionProperties(ctx context.Context, option AlterCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewAlterCollectionPropertiesOption(collection).
    WithProperty(key, value)

err := client.AlterCollectionProperties(ctx, option)
```

**パラメータ:**

- **[collection](./v2-Collection)** (*string*)

    collection。

**オプションメソッド:**

- `WithProperty(key string, value any)`

    リソースにカスタムプロパティのキーと値のペアを設定します。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
