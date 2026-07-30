---
title: "RefreshExternalCollectionJobInfo | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "This type contains information about a refresh external collection job. | Go | v2"
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

This type contains information about a refresh external collection job.

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
The unique identifier of the refresh job.

- **CollectionName** (*string*) -
The name of the collection being refreshed.

- **State** (*[RefreshExternalCollectionState](./v2-Collection-RefreshExternalCollectionState)*) -
The current state of the refresh job.

- **Progress** (*int64*) -
The progress percentage of the refresh job.

- **Reason** (*string*) -
Additional information or reason for the current state.

- **ExternalSource** (*string*) -
The external data source identifier.

- **StartTime** (*int64*) -
The Unix timestamp when the job started.

- **EndTime** (*int64*) -
The Unix timestamp when the job completed.

