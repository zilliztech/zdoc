---
title: "ListPrivilegeGroups | Go | v2"
slug: /go/go/v2-Authentication-ListPrivilegeGroups
sidebar_label: "ListPrivilegeGroups"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出所有权限组及其包含的权限。 | Go | v2"
type: docx
token: XbybdCKjgoveJExG4SDcpBjenkg
sidebar_position: 14
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - LLM 幻觉
  - 多模态搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListPrivilegeGroups
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListPrivilegeGroups

此操作会列出所有权限组及其包含的权限。

```go
func (c *Client) ListPrivilegeGroups(ctx context.Context, option ListPrivilegeGroupsOption, callOptions ...grpc.CallOption) ([]*entity.PrivilegeGroup, error)
```

## 请求语法\{#request-syntax}

创建 ListPrivilegeGroups() 的请求。

```go
option := milvusclient.NewListPrivilegeGroupsOption()

groups, err := client.ListPrivilegeGroups(ctx, option)
```

**构建器方法：**

- `NewListPrivilegeGroupsOption()`

    创建 ListPrivilegeGroups() 的请求。

**返回类型：**

<em>[]</em>Entity.PrivilegeGroup, error&ast;

**返回：**

权限组及其所包含权限的列表。如果操作失败，则返回错误。

```go
type PrivilegeGroup struct {
    GroupName string
    Privileges []string
}
```

**参数：**

- **GroupName** （*string*） -

    权限组的名称。

- **Privileges** （*[]string*） -

    已授予权限的列表。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ListPrivilegeGroups() 的用法。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
