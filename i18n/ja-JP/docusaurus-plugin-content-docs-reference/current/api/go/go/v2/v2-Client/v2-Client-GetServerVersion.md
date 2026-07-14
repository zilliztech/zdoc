---
title: "GetServerVersion() | Go | v2"
slug: /go/go/v2-Client-GetServerVersion
sidebar_label: "GetServerVersion()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、接続されている Zilliz Cloud クラスターのバージョンを返します。 | Go | v2"
type: docx
token: TUYsd2ko4oAlB4xa9nxc6rhRnpc
sidebar_position: 3
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - GetServerVersion()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersion()

この操作は、接続されている Zilliz Cloud クラスターのバージョンを返します。

```go
func (c *Client) GetServerVersion(ctx context.Context, option GetServerVersionOption, callOptions ...grpc.CallOption) (string, error)
```

**RETURN TYPE:**

*string, error*

**RETURNS:**

要求された文字列値を返します。操作が失敗した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}
defer cli.Close(ctx)

version, err := cli.GetServerVersion(ctx, milvusclient.NewGetServerVersionOption())
if err != nil {
	log.Fatal("failed to get server version:", err)
}
fmt.Println(version)
```
