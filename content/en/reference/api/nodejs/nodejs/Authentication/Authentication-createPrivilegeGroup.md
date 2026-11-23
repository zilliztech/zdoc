---
title: "createPrivilegeGroup() | Node.js"
slug: /node/node/Authentication-createPrivilegeGroup
sidebar_label: "createPrivilegeGroup()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation creates a new privilege group. | Node.js"
type: origin
token: shared-Authentication-createPrivilegeGroup
keywords: 
  - create privilege group
  - privilege group
  - rbac
  - zilliz
  - zilliz cloud
  - cloud
  - createPrivilegeGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createPrivilegeGroup()

This operation creates a new privilege group.

```javascript
await milvusClient.createPrivilegeGroup(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.createPrivilegeGroup({
    group_name: string,
    timeout?: number
})
```

**PARAMETERS:**

- **group_name** (*string*) -

    **[REQUIRED]**

    The name of the privilege group to create.

- **timeout** (*number*) -  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS:**

*Promise&lt;ResStatus&gt;*

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
await milvusClient.createPrivilegeGroup({
  group_name: 'exampleGroup',
});
```
