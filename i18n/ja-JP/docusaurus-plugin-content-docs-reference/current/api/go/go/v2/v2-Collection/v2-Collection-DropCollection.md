---
title: "DropCollection | Go | v2"
slug: /go/go/v2-Collection-DropCollection
sidebar_label: "DropCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションとそのすべてのデータを完全に削除します。 | Go | v2"
type: docx
token: MPMwdusXRoBFuUxQolHcZBFhn5e
sidebar_position: 13
keywords: 
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollection

この操作は、コレクションとそのすべてのデータを完全に削除します。

```go
func (c *Client) DropCollection(ctx context.Context, option DropCollectionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

DropCollection() のリクエストを作成します。

```go
option := milvusclient.NewDropCollectionOption(name)

err := client.DropCollection(ctx, option)
```

**パラメーター：**

- **name** (*string*) -

    **[必須]**

    対象のコレクションの名前です。

**ビルダーメソッド：**

- `NewDropCollectionOption(name string)`

    DropCollection() のリクエストを作成します。

**戻り値の型：**

*error*

**戻り値：**

成功した場合は nil を返し、失敗した場合は問題の内容を説明する error を返します。

**エラー処理：**

- **error**

    操作は失敗します。失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

DropCollection() の使用例を示します。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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

err = cli.DropCollection(ctx, milvusclient.NewDropCollectionOption("customized_setup_2"))
if err != nil {
	// handle err
}
```
