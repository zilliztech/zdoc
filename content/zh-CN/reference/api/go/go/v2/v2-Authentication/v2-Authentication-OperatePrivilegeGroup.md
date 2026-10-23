---
title: "OperatePrivilegeGroup | Go | v2"
slug: /go/go/v2-Authentication-OperatePrivilegeGroup
sidebar_label: "OperatePrivilegeGroup"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用底层 v2 API 在权限组中添加或移除权限。 | Go | v2"
type: docx
token: GCIadDUe1o31qKx66HCcLL3FnPf
sidebar_position: 29
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - OperatePrivilegeGroup
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# OperatePrivilegeGroup

此操作使用底层 v2 API 在权限组中添加或移除权限。

<Admonition type="info" title="Notes">

此接口已弃用，请改用 AddPrivilegesToGroup() 或 RemovePrivilegesFromGroup()。

</Admonition>

```go
func (c *Client) OperatePrivilegeGroup(ctx context.Context, option OperatePrivilegeGroupOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 OperatePrivilegeGroup() 创建请求。

```go
option := milvusclient.NewOperatePrivilegeGroupOption(groupName, privileges, operateType)

err := client.OperatePrivilegeGroup(ctx, option)
```

**参数：**

- **groupName**（*string*）-

    **[必需]**

    权限组的名称。

- **privileges**（<em>[]</em>milvuspb.PrivilegeEntity&ast;）-

    **[必需]**

    要添加到权限组或从权限组中移除的权限。

- **operateType**（*milvuspb.OperatePrivilegeGroupType*）-

    **[必需]**

    要执行的操作：添加或移除指定的权限。

**构建器方法：**

- `NewOperatePrivilegeGroupOption(groupName string, privileges []*milvuspb.PrivilegeEntity, operateType milvuspb.OperatePrivilegeGroupType)`

    创建一个新选项，用于在权限组中添加或移除权限。已弃用，请改用 `NewAddPrivilegesToGroupOption` 或 `NewRemovePrivilegesFromGroupOption`。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 OperatePrivilegeGroup() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus-proto/go-api/v3/milvuspb"
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

privileges := []*milvuspb.PrivilegeEntity{
	{Name: "Search"},
}

err = cli.OperatePrivilegeGroup(ctx, milvusclient.NewOperatePrivilegeGroupOption("my_priv_group", privileges, milvuspb.OperatePrivilegeGroupType_AddPrivilegesToGroup))
if err != nil {
	// handle error
}
```
