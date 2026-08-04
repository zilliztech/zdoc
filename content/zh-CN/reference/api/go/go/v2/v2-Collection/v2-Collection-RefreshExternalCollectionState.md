---
title: "RefreshExternalCollectionState | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionState
sidebar_label: "RefreshExternalCollectionState"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "此类型表示刷新外部集合任务的状态。 | Go | v2"
type: docx
token: Or8Gd2JEIo1swQxD3QTccFoBn9b
sidebar_position: 30
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollectionState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionState

此类型表示刷新外部集合任务的状态。

```go
type RefreshExternalCollectionState milvuspb.RefreshExternalCollectionState
```

**常量：**

- **RefreshStatePending** -<br/>
  任务正在等待中，尚未开始。

- **RefreshStateInProgress** -<br/>
  任务当前正在进行中。

- **RefreshStateCompleted** -<br/>
  任务已成功完成。

