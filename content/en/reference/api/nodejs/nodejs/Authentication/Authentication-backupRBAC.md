---
title: "backupRBAC() | Node.js"
slug: /node/node/Authentication-backupRBAC
sidebar_label: "backupRBAC()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation backs up the current RBAC configurations. | Node.js"
type: origin
token: shared-Authentication-backupRBAC
keywords: 
  - backup
  - backup rbac
  - rbac
  - zilliz
  - zilliz cloud
  - cloud
  - backupRBAC()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# backupRBAC()

This operation backs up the current RBAC configurations.

```javascript
await milvusClient.backupRBAC(data?)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.backupRBAC({
   timeout?: number
 })
```

**PARAMETERS:**

- **timeout** (*number*) -  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS:**

*Promise&lt;BackupRBACResponse&gt;*

This method returns a promise that resolves to a **BackupRBACResponse** object.

```javascript
{
    RBAC_meta: RBACMeta,
    status:  ResStatus
}
```

**PARAMETERS:**

- **RBAC_meta** (*[RBACMeta](./Authentication-RBACMeta)*) -

A snapshot of all RBAC metadata in the current Milvus instance. Pass this value to `restoreRBAC()` to recreate the same users, roles, grants, and privilege groups in another instance. See [RBACMeta](./Authentication-RBACMeta) for the field reference.

- **ResStatus**

A **ResStatus** object.

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
milvusClient.backupRBAC();
```

