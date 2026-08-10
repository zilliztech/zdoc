---
title: "RefreshExternalCollectionJobInfo | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "此类型包含有关刷新外部 Collection 作业的信息。 | Go | v2"
type: docx
token: TxIQdcx34oB2CUxHIRMcRGPNnic
sidebar_position: 29
keywords: 
  - 向量数据库对比
  - openai 向量数据库
  - 自然语言处理 Database
  - 低成本向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - RefreshExternalCollectionJobInfo
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionJobInfo

此类型包含有关刷新外部 Collection 作业的信息。

```go
type RefreshExternalCollectionJobInfo struct {
    JobID          int64
    CollectionName string
    State          RefreshExternalCollectionState
    Progress       int64
    Reason         string
    ExternalSource string
    StartTime      int64
    EndTime        int64
}
```

**字段：**

- **JobID** (*int64*) -<br/>
  刷新作业的唯一标识符。

- **CollectionName** (*string*) -<br/>
  正在刷新的 Collection 的名称。

- **State** (*[RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)*) -<br/>
  刷新作业的当前状态。

- **Progress** (*int64*) -<br/>
  刷新作业的进度百分比。

- **Reason** (*string*) -<br/>
  当前状态的附加信息或原因。

- **ExternalSource** (*string*) -<br/>
  外部数据源标识符。

- **StartTime** (*int64*) -<br/>
  作业开始时的 Unix 时间戳。

- **EndTime** (*int64*) -<br/>
  作业完成时的 Unix 时间戳。

