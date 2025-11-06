---
title: "alterIndexProperties() | Node.js"
slug: /node/node/Management-alterIndexProperties
sidebar_label: "alterIndexProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies the settings of specific index properties. | Node.js"
type: docx
token: PcQcdDwthoSEZaxI6GncpUpGnBh
sidebar_position: 1
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - alterIndexProperties()
  - nodejs26
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# alterIndexProperties()

This operation modifies the settings of specific index properties.

```javascript
alterIndexProperties(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.alterIndexProperties({
     db_name?: string,
     collection_name: string,
     index_name: string,
     params: Record<string, string | number | boolean>,
     timeout?: number
});
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **index_name** (*string*) -

    **[REQUIRED]**

    The name of the target index.

- **params** (*Record*\<*string*, *string* | *number* | *boolean*>) -

    **[REQUIRED]**

    The index properties to modify and their expected values. Possible properties are as follows:

    - **mmap.enabled** (*bool*) -

        Whether to enable mmap for the specified index. Setting this to `True` offloads the specified index onto the disk. For details, refer to [Use mmap](/docs/use-mmap)

- **timeout** (number) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<ResStatus>*

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

## Example\{#example}

```java
const milvusClient = new MilvusClient(MILUVS_ADDRESS);
const alterIndexReq = {
    collection_name: 'my_collection',
    params: { nlist: 20 },
};
const res = await milvusClient.alterIndex(alterIndexReq);
console.log(res);
```

