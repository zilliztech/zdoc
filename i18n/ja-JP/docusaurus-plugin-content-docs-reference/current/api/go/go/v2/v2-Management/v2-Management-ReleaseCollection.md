---
title: "ReleaseCollection() | Go | v2"
slug: /go/go/v2-Management-ReleaseCollection
sidebar_label: "ReleaseCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、リソースを解放するためにコレクションをメモリから解放します。 | Go | v2"
type: docx
token: YMxDdZUXfoCEPtxBhN8clGxDnUd
sidebar_position: 24
keywords: 
  - ベクトルインデックス
  - ベクトルデータベース オープンソース
  - オープンソースのベクトル db
  - ベクトルデータベースの例
  - zilliz
  - zilliz cloud
  - クラウド
  - ReleaseCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ReleaseCollection()

この操作は、リソースを解放するためにコレクションをメモリから解放します。

```go
func (c *Client) ReleaseCollection(ctx context.Context, option ReleaseCollectionOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewReleaseCollectionOption(collectionName)

err := client.ReleaseCollection(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象のコレクションの名前。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、問題が発生した場合はその原因を示すエラーを返します。

**例外:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

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

err = cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("custom_quick_setup"))
if err != nil {
	// handle error
}
```
