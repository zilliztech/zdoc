---
title: "CreateAlias() | Go | v2"
slug: /go/go/v2-Collection-CreateAlias
sidebar_label: "CreateAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection の alias を作成し、別名で参照できるようにします。 | Go | v2"
type: docx
token: HbsGdw2PboyE0Yxcp8IcaG4Qnmg
sidebar_position: 8
keywords: 
  - Zilliz database
  - 非構造化データ
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - CreateAlias()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateAlias()

この操作は collection の alias を作成し、別名で参照できるようにします。

```go
func (c *Client) CreateAlias(ctx context.Context, option CreateAliasOption, callOptions ...grpc.CallOption) error
```

## リクエスト構文\{#request-syntax}

```go
option := milvusclient.NewCreateAliasOption(collectionName, alias)

err := client.CreateAlias(ctx, option)
```

**パラメーター:**

- **collectionName** (*string*)

    対象 collection の名前。

- **[alias](./v2-Collection-Alias)** (*string*)

    割り当てる alias 名。

**戻り値の型:**

*error*

**戻り値:**

成功した場合は nil を返し、失敗した場合は問題の内容を説明する error を返します。

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

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "bob"))
if err != nil {
	// handle error
}

err = cli.CreateAlias(ctx, milvusclient.NewCreateAliasOption("customized_setup_2", "alice"))
if err != nil {
	// handle error
}
```
