---
title: "AlterCollectionProperties | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionProperties
sidebar_label: "AlterCollectionProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作修改现有 Collection 的属性。 | Go | v2"
type: docx
token: Q9Atd2A9LoykWSxJHuXcq09xnRg
sidebar_position: 5
keywords: 
  - LLM 作为评判者
  - 混合向量搜索
  - 视频去重
  - 视频相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - AlterCollectionProperties
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AlterCollectionProperties

此操作修改现有 Collection 的属性。

```go
func (c *Client) AlterCollectionProperties(ctx context.Context, option AlterCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 AlterCollectionProperties() 的请求。

```go
option := milvusclient.NewAlterCollectionPropertiesOption(collection).
    WithProperty(key, value)

err := client.AlterCollectionProperties(ctx, option)
```

**参数：**

- **collection** （*string*） -

    **[必需]**

    Collection。

**构建器方法：**

- `NewAlterCollectionPropertiesOption(collection string)`

    创建 AlterCollectionProperties() 的请求。

- `WithProperty(key string, value any)`

    在资源上设置自定义属性键值对。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    操作失败。请查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 AlterCollectionProperties() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
	"github.com/milvus-io/milvus/pkg/v2/common"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

err = cli.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
	// handle error
}
```
