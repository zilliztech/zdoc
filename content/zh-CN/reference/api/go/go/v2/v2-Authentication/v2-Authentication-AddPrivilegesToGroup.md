---
title: "AddPrivilegesToGroup | Go | v2"
slug: /go/go/v2-Authentication-AddPrivilegesToGroup
sidebar_label: "AddPrivilegesToGroup"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向现有权限组添加一个或多个权限。 | Go | v2"
type: docx
token: VCAedbFRIoAQS8x97rRcN32unMg
sidebar_position: 1
keywords: 
  - 音频搜索
  - 什么是语义搜索
  - 嵌入模型
  - 图像相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - AddPrivilegesToGroup
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddPrivilegesToGroup

此操作会向现有权限组添加一个或多个权限。

```go
func (c *Client) AddPrivilegesToGroup(ctx context.Context, option AddPrivilegeToGroupOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 AddPrivilegesToGroup() 创建请求。

```go
option := milvusclient.NewAddPrivilegesToGroupOption(groupName, privilegeNames...)

err := client.AddPrivilegesToGroup(ctx, option)
```

**参数：**

- **groupName** （*string*） -

    **[必需]**

    权限组的名称。

- **privileges** （*...string*） -

    **[必需]**

    要添加到权限组中的权限名称。

**构建器方法：**

- `NewAddPrivilegesToGroupOption(groupName string, privileges ...string)`

    创建一个新选项，用于向权限组添加权限。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 AddPrivilegesToGroup() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

err = cli.AddPrivilegesToGroup(ctx, milvusclient.NewAddPrivilegesToGroupOption("my_priv_group", "Search", "Query"))
if err != nil {
	// handle error
}
```
