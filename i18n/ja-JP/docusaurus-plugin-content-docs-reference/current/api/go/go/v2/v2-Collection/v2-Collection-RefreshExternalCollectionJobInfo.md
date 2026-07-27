---
title: "RefreshExternalCollectionJobInfo | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "この型には、外部コレクションの更新ジョブに関する情報が含まれます。 | Go | v2"
type: docx
token: TxIQdcx34oB2CUxHIRMcRGPNnic
sidebar_position: 29
keywords: 
  - vector db の比較
  - openai vector db
  - 自然言語処理データベース
  - 安価な vector データベース
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

この型には、外部コレクションの更新ジョブに関する情報が含まれます。

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

- **JobID** (*int64*) -<br/>
  更新ジョブの一意の識別子です。

- **CollectionName** (*string*) -<br/>
  更新対象のコレクションの名前です。

- **State** (*[RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)*) -<br/>
  更新ジョブの現在の状態です。

- **Progress** (*int64*) -<br/>
  更新ジョブの進行率です。

- **Reason** (*string*) -<br/>
  現在の状態に関する追加情報または理由です。

- **ExternalSource** (*string*) -<br/>
  外部データソースの識別子です。

- **StartTime** (*int64*) -<br/>
  ジョブが開始された時刻の Unix タイムスタンプです。

- **EndTime** (*int64*) -<br/>
  ジョブが完了した時刻の Unix タイムスタンプです。

