---
title: "ListPrivilegeGroups() | Go | v2"
slug: /go/go/v2-Authentication-ListPrivilegeGroups
sidebar_label: "ListPrivilegeGroups()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、すべての privilege group とそれに含まれる privileges を一覧表示します。 | Go | v2"
type: docx
token: H34hdV2rxodn9Pxy2Jyc8sBun9t
sidebar_position: 14
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - ListPrivilegeGroups()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListPrivilegeGroups()

この操作は、すべての privilege group とそれに含まれる privileges を一覧表示します。

```go
func (c *Client) ListPrivilegeGroups(ctx context.Context, option ListPrivilegeGroupsOption, callOptions ...grpc.CallOption) ([]*entity.PrivilegeGroup, error)
```

**RETURN TYPE:**

*[]*entity.PrivilegeGroup, error*

**RETURNS:**

含まれる privileges を持つ privilege group の一覧を返します。操作が失敗した場合はエラーを返します。

**EXCEPTIONS:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## Example\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

groups, err := cli.ListPrivilegeGroups(ctx, milvusclient.NewListPrivilegeGroupsOption())
if err != nil {
	// handle error
}
fmt.Println(groups)
```
