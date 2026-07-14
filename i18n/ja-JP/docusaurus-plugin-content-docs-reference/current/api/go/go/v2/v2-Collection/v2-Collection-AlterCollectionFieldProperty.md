---
title: "AlterCollectionFieldProperty() | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionFieldProperty
sidebar_label: "AlterCollectionFieldProperty()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection 内の特定の field のプロパティを変更します。 | Go | v2"
type: docx
token: MIyedieIBo43Yrxee0lcY3cUn8b
sidebar_position: 4
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - AlterCollectionFieldProperty()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperty()

この操作は、collection 内の特定の field のプロパティを変更します。

```go
func (c *Client) AlterCollectionFieldProperty(ctx context.Context, option AlterCollectionFieldPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewAlterCollectionFieldPropertiesOption(collectionName, fieldName).
    WithProperty(key, value)

err := client.AlterCollectionFieldProperty(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*)

    対象の collection の名前。

- **fieldName** (*string*)

    field の名前。

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

err = cli.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption("my_collection", "my_vector").
	WithProperty("mmap.enabled", true))
if err != nil {
	// handle error
}
```
