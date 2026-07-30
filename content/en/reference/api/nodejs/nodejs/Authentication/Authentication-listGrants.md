---
title: "listGrants() | Node.js"
slug: /node/node/Authentication-listGrants
sidebar_label: "listGrants()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the privileges granted to the specified role. | Node.js"
type: docx
token: CJ9DdmU1ooquOnxcK5AciA3sn3g
sidebar_position: 18
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - listGrants()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listGrants()

This operation lists the privileges granted to the specified role.

```javascript
await milvusClient.listGrants(data)
```

## Request Syntax\{#request-syntax}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```

**PARAMETERS:**

- roleName (*string*)  

    The target role name

    Setting this to the name of a non-existing role may result in errors.

**RETURNS** *Promise&lt;SelectGrantResponse&gt;*

This method returns a promise that resolves to a **SelectGrantResponse** object.

```typescript
{
    entities: GrantEntity[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **entities** (*GrantEntity[]*) -
A list of grants attached to the requested role. Each entry pairs a privilege with the target object and the principal that granted it. For the full **GrantEntity** field reference, refer to the `describeRole()` doc.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```javascript
 milvusClient.listGrants({
   roleName: 'roleName',
 });
```
