---
title: "RefreshExternalCollectionJobInfo | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "RefreshExternalCollectionJobInfo 实例包含有关刷新外部 Collection 作业的信息。 | Go | v2"
type: docx
token: TxIQdcx34oB2CUxHIRMcRGPNnic
sidebar_position: 34
keywords: 
  - 向量 Database 对比
  - openai 向量 Database
  - 自然语言处理 Database
  - 低成本向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - RefreshExternalCollectionJobInfo
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionJobInfo

RefreshExternalCollectionJobInfo 实例包含有关刷新外部 Collection 作业的信息。

```go
type RefreshExternalCollectionJobInfo struct {
    JobID int64
    CollectionName string
    State RefreshExternalCollectionState
    Progress int64
    Reason string
    ExternalSource string
    ExternalSpec string
    StartTime int64
    EndTime int64
}
```

**字段：**

- **JobID** (*int64*) -

    刷新作业的唯一标识符。

- **CollectionName** (*string*) -

    正在刷新的 Collection 的名称。

- **State** ([RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)) -

    刷新作业的当前状态。

- **Progress** (*int64*) -

    刷新作业的进度百分比。

- **Reason** (*string*) -

    当前状态的附加信息或原因。

- **ExternalSource** (*string*) -

    外部数据源标识符。

- **ExternalSpec** (*string*) -

    外部数据源规范（JSON），描述文件格式和对象存储设置。

- **StartTime** (*int64*) -

    作业开始时的 Unix 时间戳。

- **EndTime** (*int64*) -

    作业完成时的 Unix 时间戳。

## 示例\{#example}

演示 RefreshExternalCollectionJobInfo 的用法。

```go
import (
	"context"

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

jobs, err := cli.ListRefreshExternalCollectionJobs(ctx, milvusclient.NewListRefreshExternalCollectionJobsOption())
if err != nil {
	// handle error
}
for _, job := range jobs {
	fmt.Println(job.JobID, job.State)
}
```
