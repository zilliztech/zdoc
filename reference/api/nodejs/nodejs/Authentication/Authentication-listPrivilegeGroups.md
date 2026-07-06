---
title: "listPrivilegeGroups() | Node.js"
slug: /node/node/Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all privilege groups. | Node.js"
type: docx
token: HGpSdc7AOo7AV3xKCmOcWaIEnrd
sidebar_position: 19
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - listPrivilegeGroups()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPrivilegeGroups()

This operation lists all privilege groups.

```javascript
await milvusClient.listPrivilegeGroups(data?)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.listPrivilegeGroups({
   timeout?: number
 })
```

**PARAMETERS:**

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise&lt;ListPrivilegeGroupsResponse&gt;*

This method returns a promise that resolves to a **ListPrivilegeGroupsResponse** object.

```typescript
{
    privilege_groups: PrivelegeGroup[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **privilege_groups** (*PrivelegeGroup[]*) -
A list of privilege groups defined in the current Milvus instance.

    - **group_name** (*string*) -

        The name of the privilege group.

    - **privileges** (*PrivilegeEntity[]*) -

        The privileges contained in the group.

        - **name** (*string*) -

        The privilege name (for example, **Insert**, **Search**, **CreateCollection**).

        - **name** (*string*) -

            The privilege name (for example, **Insert**, **Search**, **CreateCollection**).

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
await milvusClient.listPrivilegeGroups();
```

