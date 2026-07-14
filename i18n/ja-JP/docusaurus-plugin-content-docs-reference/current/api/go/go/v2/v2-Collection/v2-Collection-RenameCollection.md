---
title: "RenameCollection() | Go | v2"
slug: /go/go/v2-Collection-RenameCollection
sidebar_label: "RenameCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存の collection の名前を変更します。 | Go | v2"
type: docx
token: XJN5dD1ifo5A9xxEfFKcf7Fxn1g
sidebar_position: 22
keywords: 
  - 動画検索
  - AIハルシネーション
  - AIエージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - クラウド
  - RenameCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RenameCollection()

この操作は既存の collection の名前を変更します。

```go
func (c *Client) RenameCollection(ctx context.Context, option RenameCollectionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewRenameCollectionOption(oldName, newName)

err := client.RenameCollection(ctx, option)
```

**パラメータ:**

- **oldName** (*string*)

    以前の名前です。

- **newName** (*string*)

    collection の新しい名前です。

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

err = cli.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
	// handle error
}
```
