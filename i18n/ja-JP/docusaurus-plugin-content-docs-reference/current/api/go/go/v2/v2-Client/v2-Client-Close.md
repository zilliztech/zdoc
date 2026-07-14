---
title: "Close() | Go | v2"
slug: /go/go/v2-Client-Close
sidebar_label: "Close()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クライアント接続を閉じ、関連するリソースを解放します。 | Go | v2"
type: docx
token: UN5Yd5ojPoTYrJxAtYzcgFs9nYe
sidebar_position: 2
keywords: 
  - managed milvus
  - Serverless ベクトルデータベース
  - milvus オープンソース
  - milvus はどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - Close()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Close()

この操作は、クライアント接続を閉じ、関連するリソースを解放します。

```go
func (c *Client) Close(ctx context.Context) error
```

**RETURN TYPE:**

*error*

**RETURNS:**

成功時は nil を返し、失敗時は問題の内容を示す error を返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細については `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"
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

err = cli.Close(ctx)
if err != nil {
	log.Fatal("failed to close client:", err)
}
```
