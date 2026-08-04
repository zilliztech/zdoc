---
title: "Collection | Go | v2"
slug: /go/go/v2-Collection
sidebar_label: "Collection"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示由 DescribeCollection 返回的集合描述，包括 schema、分片和属性。 | Go | v2"
type: docx
token: PNwFdxMMdo6rtIxERDHcVFgdnxc
sidebar_position: 6
keywords: 
  - 廉价向量数据库
  - 托管向量数据库
  - Pinecone 向量数据库
  - 音频搜索
  - zilliz
  - zilliz cloud
  - cloud
  - Collection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Collection

表示由 DescribeCollection 返回的集合描述，包括 schema、分片和属性。

```go
type Collection struct {
    ID int64
    Name string
    Schema *Schema
    PhysicalChannels []string
    VirtualChannels []string
    Loaded bool
    ConsistencyLevel ConsistencyLevel
    ShardNum int32
    Properties map[string]string
    UpdateTimestamp uint64
}
```

**字段：**

- **ID** (*int64*)

    集合 ID

- **Name** (*string*)

    集合名称

- **[Schema](./v2-Collection-Schema)** (**[Schema](./v2-Collection-Schema)*)

    集合 schema，包含字段 schema 和主键定义

- **PhysicalChannels** (*[]string*)

    物理通道。

- **VirtualChannels** (*[]string*)

    虚拟通道。

- **Loaded** (*bool*)

    资源是否已加载到内存中。

- **[ConsistencyLevel](./v2-Collection-ConsistencyLevel)** (*[ConsistencyLevel](./v2-Collection-ConsistencyLevel)*)

    读操作的一致性级别。

- **ShardNum** (*int32*)

    用于数据分布的分片数量。

- **Properties** (*map[string]string*)

    自定义键值属性。

- **UpdateTimestamp** (*uint64*)

    用于检测变更的最后更新时间戳。
