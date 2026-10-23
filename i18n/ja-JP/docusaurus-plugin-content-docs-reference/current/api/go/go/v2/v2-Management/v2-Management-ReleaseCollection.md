---
title: "ReleaseCollection | Go | v2"
slug: /go/go/v2-Management-ReleaseCollection
sidebar_label: "ReleaseCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、リソースを解放するためにコレクションをメモリから解放します。 | Go | v2"
type: docx
token: VQTgdYK3yoNZPxxt9dfct0M4nze
sidebar_position: 23
keywords: 
  - LLMs
  - 機械学習
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - クラウド
  - ReleaseCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ReleaseCollection

この操作は、リソースを解放するためにコレクションをメモリから解放します。

```go
func (c *Client) ReleaseCollection(ctx context.Context, option ReleaseCollectionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

ReleaseCollection() のリクエストを作成します。

```go
option := milvusclient.NewReleaseCollectionOption(collectionName)

err := client.ReleaseCollection(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*) -

    **[必須]**

    対象のコレクションの名前です。

**ビルダーメソッド:**

- `NewReleaseCollectionOption(collectionName string)`

    ReleaseCollection() のリクエストを作成します。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、問題が発生した場合はその原因を示すエラーを返します。

**エラー処理:**

- **error**

    操作が失敗します。失敗の詳細については `err != nil` を確認してください。

## 例\{#example}

ReleaseCollection() の使用例を示します。

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

err = cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("custom_quick_setup"))
if err != nil {
	// handle error
}
```
