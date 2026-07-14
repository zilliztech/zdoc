---
title: "RefreshExternalCollectionJobInfo | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "この型には、外部 collection のリフレッシュジョブに関する情報が含まれます。 | Go | v2"
type: docx
token: TxIQdcx34oB2CUxHIRMcRGPNnic
sidebar_position: 28
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshExternalCollectionJobInfo
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RefreshExternalCollectionJobInfo

この型には、外部 collection のリフレッシュジョブに関する情報が含まれます。

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

**FIELDS:**

- **JobID** (*int64*) -
リフレッシュジョブの一意の識別子。

- **CollectionName** (*string*) -
リフレッシュ対象の collection 名。

- **State** (*[RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)*) -
リフレッシュジョブの現在の状態。

- **Progress** (*int64*) -
リフレッシュジョブの進行率。

- **Reason** (*string*) -
現在の状態に関する追加情報または理由。

- **ExternalSource** (*string*) -
外部データソースの識別子。

- **StartTime** (*int64*) -
ジョブが開始された時刻の Unix タイムスタンプ。

- **EndTime** (*int64*) -
ジョブが完了した時刻の Unix タイムスタンプ。

