---
title: "LoadState | Go | v2"
slug: /go/go/v2-Management-LoadState
sidebar_label: "LoadState"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示 Collection 或 Partition 的加载状态，包括进度百分比。 | Go | v2"
type: docx
token: XWSAdFkdDoaDPnxOtkEcuFETngL
sidebar_position: 20
keywords: 
  - 问答系统
  - llm-as-a-judge
  - 混合向量搜索
  - 视频去重
  - zilliz
  - zilliz cloud
  - 云
  - LoadState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# LoadState

表示 Collection 或 Partition 的加载状态，包括进度百分比。

```go
type LoadState struct {
    State LoadStateCode
    Progress int64
}
```

**字段：**

- **State** (*LoadStateCode*)

    当前状态。

- **Progress** (*int64*)

    进度百分比。