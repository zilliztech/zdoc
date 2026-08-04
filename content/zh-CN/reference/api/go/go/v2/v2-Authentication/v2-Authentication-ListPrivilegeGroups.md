---
title: "ListPrivilegeGroups() | Go | v2"
slug: /go/go/v2-Authentication-ListPrivilegeGroups
sidebar_label: "ListPrivilegeGroups()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有权限组及其包含的权限。 | Go | v2"
type: docx
token: H34hdV2rxodn9Pxy2Jyc8sBun9t
sidebar_position: 14
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
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

此操作列出所有权限组及其包含的权限。

```go
func (c *Client) ListPrivilegeGroups(ctx context.Context, option ListPrivilegeGroupsOption, callOptions ...grpc.CallOption) ([]*entity.PrivilegeGroup, error)
```

**返回类型：**

*[]*entity.PrivilegeGroup, error*

**返回：**

包含其所含权限的权限组列表。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以查看失败详情。

## 示例\{#example}

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
