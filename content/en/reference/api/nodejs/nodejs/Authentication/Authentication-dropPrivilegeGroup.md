---
title: "dropPrivilegeGroup() | Node.js"
slug: /node/node/Authentication-dropPrivilegeGroup
sidebar_label: "dropPrivilegeGroup()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a user to a specific role. | Node.js"
type: docx
token: I63tdWAY2ok8V1xrK4tcrkwjncd
sidebar_position: 12
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - dropPrivilegeGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# dropPrivilegeGroup()

This operation drops a privilege group.

```javascript
await milvusClient.dropPrivilegeGroup(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropPrivilegeGroup({
   group_name: string,
   timeout?: number
})
```

**PARAMETERS:**

- **group_name** (*string*) -

    **[REQUIRED]**

    The name of the privilege group to drop.

- **timeout** (*number*) -  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS:**

*Promise\<ResStatus\>*

This method returns a promise that resolves to a **ResStatus** object.

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    A code that indicates the operation result. It remains **0** if this operation succeeds.

- **error_code** (*string* | *number*) -

    An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

- **reason** (*string*) - 

    The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
await milvusClient.dropPrivilegeGroup({
    group_name: 'my_group',
});
```

