---
title: "FileResource | Go | v2"
slug: /go/go/v2-FileResources-FileResource
sidebar_label: "FileResource"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FileResource 实例表示系统中的文件资源，由 ListFileResources 返回。 | Go | v2"
type: docx
token: FyjHdFDWBolmHNxYQ5rcGunqn6d
sidebar_position: 2
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - zilliz
  - Zilliz Cloud
  - 云
  - FileResource
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# FileResource

FileResource 实例表示系统中的文件资源，由 ListFileResources 返回。

```go
type FileResource struct {
    ID int64
    Name string
    Path string
}
```

**字段：**

- **ID**（*int64*）-

    文件资源的唯一标识符。

- **Name**（*string*）-

    文件资源的名称。

- **Path**（*string*）-

    文件资源的路径。

## 示例\{#example}

演示 FileResource 的用法。

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

resources, err := cli.ListFileResources(ctx, milvusclient.NewListFileResourcesOption())
if err != nil {
	// handle error
}

for _, resource := range resources {
	fmt.Println(resource.ID, resource.Name, resource.Path)
}
if err != nil {
	// handle error
}
```
