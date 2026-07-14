---
title: "ListAliases() | Go | v2"
slug: /go/go/v2-Collection-ListAliases
sidebar_label: "ListAliases()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションに関連付けられているすべてのエイリアスを一覧表示します。 | Go | v2"
type: docx
token: Xq1Dd1B8goDbeRxHfMKc84VOnxg
sidebar_position: 20
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - ListAliases()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListAliases()

この操作は、コレクションに関連付けられているすべてのエイリアスを一覧表示します。

```go
func (c *Client) ListAliases(ctx context.Context, option ListAliasesOption, callOptions ...grpc.CallOption) ([]string, error)
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewListAliasesOption(collectionName)

result, err := client.ListAliases(ctx, option)
```

**パラメータ:**

- **collectionName** (*string*)

    対象コレクションの名前。

**戻り値の型:**

*[]string, error*

**戻り値:**

名前のリスト。操作が失敗した場合は error を返します。

**例外:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

## 例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

aliases, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_2"))
if err != nil {
	// handle error
}
fmt.Println(aliases)
```
