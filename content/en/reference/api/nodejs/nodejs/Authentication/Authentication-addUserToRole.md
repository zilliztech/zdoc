---
title: "addUserToRole() | Node.js"
slug: /node/node/Authentication-addUserToRole
sidebar_label: "addUserToRole()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a user to a specific role. | Node.js"
type: docx
token: Qc72dTKgroNdHjxIG2xcwNdmnHb
sidebar_position: 2
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - addUserToRole()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# addUserToRole()

This operation adds a user to a specific role.

```javascript
await milvusClient.addUserToRole(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.addUserToRole({
   username: string,
   roleName: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **username** (*string*) -

    **[REQUIRED]**

    The name of a user.

- **roleName** (*string*) -

    **[REQUIRED]**

    The name of a role

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
await milvusClient.addUserToRole({
    username: 'myUser',
    roleName: 'myRole'
});
```

