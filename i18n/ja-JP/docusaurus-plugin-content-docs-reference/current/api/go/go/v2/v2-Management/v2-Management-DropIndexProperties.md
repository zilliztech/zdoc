---
title: "DropIndexProperties() | Go | v2"
slug: /go/go/v2-Management-DropIndexProperties
sidebar_label: "DropIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、インデックスから指定したプロパティを削除します。 | Go | v2"
type: docx
token: VuYydaf7loMiRAxkB3scXzA1nPb
sidebar_position: 8
keywords: 
  - milvus lite
  - milvus ベンチマーク
  - マネージド Milvus
  - Serverless ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - DropIndexProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropIndexProperties()

この操作は、インデックスから指定したプロパティを削除します。

```go
func (c *Client) DropIndexProperties(ctx context.Context, opt DropIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewDropIndexPropertiesOption(collectionName, indexName, keys)

err := client.DropIndexProperties(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

- **indexName** (*string*)

    インデックスの名前。

- **keys** (*...string*)

    キー。

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

err = cli.DropIndexProperties(ctx, milvusclient.NewDropIndexPropertiesOption("my_collection", "my_index", "mmap.enabled"))
if err != nil {
	// handle err
}
```
