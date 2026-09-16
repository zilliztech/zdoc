---
title: "Index | Go | v2"
slug: /go/go/v2-Management-Index
sidebar_label: "Index"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "索引配置的接口。使用 NewAutoIndex() 或 NewHNSWIndex() 等构造函数创建实例。 | Go | v2"
type: docx
token: ERQodkjAzotUQ3xKvA8c6jmLn3e
sidebar_position: 1
keywords: 
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - 云
  - Index
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Index

索引配置的接口。使用 NewAutoIndex() 或 NewHNSWIndex() 等构造函数创建实例。

```go
type Index interface {
    Name() string
    IndexType() IndexType
    Params() map[string]string
}
```

**方法：**

- `Name() string`

    返回索引的名称。

- `IndexType() IndexType`

    返回索引算法类型。

- `Params() map[string]string`

    以键值映射形式返回索引参数。
