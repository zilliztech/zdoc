---
title: "listPrivilegeGroups() | Node.js"
slug: /node/node/Authentication-listPrivilegeGroups
sidebar_label: "listPrivilegeGroups()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all privilege groups. | Node.js"
type: docx
token: HGpSdc7AOo7AV3xKCmOcWaIEnrd
sidebar_position: 19
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - listPrivilegeGroups()
  - nodejs26
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPrivilegeGroups()

This operation lists all privilege groups.

```javascript
listPrivilegeGroups(data?): Promise<ListPrivilegeGroupsResponse>
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

**RETURNS** *Promise\<ListPrivilegeGroupsResponse>*

This method returns a promise that resolves to a **ListPrivilegeGroupsResponse** object.

```javascript
{
    privilege_groups: [
        {
            group_name: string,
            privileges: PrivilegeEntity[]
        },
        ...
    ],
    status: {
        code: number,
        error_code: string | number,
        reason: string    
    }
}
```

**PARAMETERS:**

- **privilege_groups** (*PrivelegeGroup[]*) -

    A list of all privilege groups in the form of a **PrivelegeGroup** object.

    - **group_name** (*string*) -

        The name of a privilege group.

    - **privileges** (*PrivilegeEntity[]*) -

        A list of privileges.

        - **name** (*string*) -

            The name of a privilege. 

- **status** (*ResStatus*) -

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

