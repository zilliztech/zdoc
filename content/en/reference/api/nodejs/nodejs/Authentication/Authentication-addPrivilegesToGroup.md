---
title: "addPrivilegesToGroup() | Node.js"
slug: /node/node/Authentication-addPrivilegesToGroup
sidebar_label: "addPrivilegesToGroup()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds privileges to a specific privilege group in Milvus. | Node.js"
type: origin
token: shared-Authentication-addPrivilegesToGroup
keywords: 
  - add privileges
  - privilege group
  - rbac
  - zilliz
  - zilliz cloud
  - cloud
  - addPrivilegesToGroup()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addPrivilegesToGroup()

This operation adds privileges to a specific privilege group in Milvus.

```javascript
await milvusClient.addPrivilegesToGroup(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.addPrivilegesToGroup({
   group_name: string,
   privileges: string[],
   timeout?: number
 })
```

**PARAMETERS:**

- **group_name** (*string*) -

    **[REQUIRED]**

    The name of a privilege group.

- **privileges** (*string[]*) -

    **[REQUIRED]**

    The list of privileges to add to the above group.

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
await milvusClient.addPrivilegesToGroup({
    group_name: 'exampleGroup',
    privileges: ['CreateCollection', 'DropCollection'],
});
```

