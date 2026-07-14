---
title: "AlterAlias() | Go | v2"
slug: /go/go/v2-Collection-AlterAlias
sidebar_label: "AlterAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存の alias を別の collection に再割り当てします。 | Go | v2"
type: docx
token: GNQcdBgh2oMyS9xxJk0cvESGnfe
sidebar_position: 3
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - zilliz
  - zilliz cloud
  - cloud
  - AlterAlias()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterAlias()

この操作は、既存の alias を別の collection に再割り当てします。

```go
func (c *Client) AlterAlias(ctx context.Context, option AlterAliasOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewAlterAliasOption(alias, collectionName)

err := client.AlterAlias(ctx, option)
```

**パラメータ:**

- **[alias](./v2-Collection-Alias)** (*string*)

    割り当てる alias 名。

- **collectionName** (*string*)

    対象 collection の名前。

**戻り値の型:**

*error*

**戻り値:**

成功時は nil、失敗時は問題の内容を示す error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

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

err = cli.AlterAlias(ctx, milvusclient.NewAlterAliasOption("alice", "customized_setup_1"))
if err != nil {
	// handle error
}

aliases, err := cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_1"))
if err != nil {
	// handle error
}
fmt.Println(aliases)

aliases, err = cli.ListAliases(ctx, milvusclient.NewListAliasesOption("customized_setup_2"))
if err != nil {
	// handle error
}
fmt.Println(aliases)
```
