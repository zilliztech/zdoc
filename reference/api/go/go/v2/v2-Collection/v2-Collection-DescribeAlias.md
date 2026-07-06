---
title: "DescribeAlias() | Go | v2"
slug: /go/go/v2-Collection-DescribeAlias
sidebar_label: "DescribeAlias()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the details of a collection alias, including the collection it references. | Go | v2"
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

This operation returns the details of a collection alias, including the collection it references.

```go
func (c *Client) DescribeAlias(ctx context.Context, option DescribeAliasOption, callOptions ...grpc.CallOption) (*entity.Alias, error)
```

## Request Syntax\{#request-syntax}

```go
option := client.NewDescribeAliasOption(alias)

result, err := client.DescribeAlias(ctx, option)
```

**PARAMETERS:**

- **[alias](./v2-Collection-Alias)** (*string*)

    The alias name to assign.

**RETURN TYPE:**

**[entity.Alias](./v2-Collection-Alias), error*

**RETURNS:**

The alias details including the associated collection name. Returns an error if the operation fails.

**EXCEPTIONS:**

- **error**

    Check `err != nil` for failure details.

## Example\{#example}

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
