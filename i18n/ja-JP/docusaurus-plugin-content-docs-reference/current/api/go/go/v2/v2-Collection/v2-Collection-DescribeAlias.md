---
title: "DescribeAlias() | Go | v2"
slug: /go/go/v2-Collection-DescribeAlias
sidebar_label: "DescribeAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、参照先の collection を含む collection alias の詳細を返します。 | Go | v2"
type: docx
token: EFC0drdqGoG559x5Zqzcpj7innc
sidebar_position: 10
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeAlias()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeAlias()

この操作は、参照先の collection を含む collection alias の詳細を返します。

```go
func (c *Client) DescribeAlias(ctx context.Context, option DescribeAliasOption, callOptions ...grpc.CallOption) (*entity.Alias, error)
```

## リクエスト構文\{#request-syntax}

```go
option := client.NewDescribeAliasOption(alias)

result, err := client.DescribeAlias(ctx, option)
```

**パラメーター:**

- **[alias](./v2-Collection-Alias)** (*string*)

    割り当てる alias 名です。

**戻り値の型:**

**[entity.Alias](./v2-Collection-Alias), error*

**戻り値:**

関連付けられた collection 名を含む alias の詳細です。操作が失敗した場合はエラーを返します。

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

alias, err := cli.DescribeAlias(ctx, milvusclient.NewDescribeAliasOption("bob"))
if err != nil {
	// handle error
}
fmt.Println(alias)
```
