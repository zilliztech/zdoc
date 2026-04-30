---
title: "delete() | Node.js"
slug: /node/node/Vector-delete
sidebar_key: node/Vector-delete
sidebar_label: "delete()"
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
beta: false
notebook: false
description: "This operation deletes entities by their IDs or with a boolean expression. | Node.js"
type: docx
token: KOZHdyeQvo4htOxhO8BcbEudnNd
sidebar_position: 2
keywords: 
  - Image Search
  - LLMs
  - Machine Learning
  - RAG
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# delete()

This operation deletes entities by their IDs or with a boolean expression.

```javascript
await milvusClient.delete(data)
```

## Request Syntax\{#request-syntax}

This method has the following alternatives.

### With DeleteByIdsReq\{#with-deletebyidsreq}

```javascript
await milvusClient.delete({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   ids: string[] | number[],
   consistency_level: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_name** (*string*) -

    The name of an existing partition in the collection.

- **ids** (*string[]* | *number[]*) -

    **[REQUIRED]**

    A specific entity ID or a list of entity IDs.

    The value defaults to **None**, indicating that a scalar filtering condition applies.

- **consistency_level** (*ConsistencyLevelEnum*) -

    The consistency level of the target collection. The value defaults to **Bounded** (**1**) with options of **Strong** (**0**), **Bounded** (**1**), **Session** (**2**), and **Eventually** (**3**).

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<MutationResult>*

### With DeleteByFilterReq\{#with-deletebyfilterreq}

```javascript
await milvusClient.delete({
   db_name: string,
   collection_name: string,
   partition_name?: string,
   filter: string,
   exprValues?: keyValueObject,
   consistency_level?: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_name** (*string*) -

    The name of an existing partition in the collection.

- **filter** (*string*) -

    A scalar filtering condition to filter matching entities. 

    The value defaults to an empty string, indicating that no condition applies. Setting both **ids** and **filter** results in a **ParamError** exception.

    You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md). 

- **consistency_level** (*ConsistencyLevelEnum*) -

    The consistency level of the target collection. The value defaults to **Bounded** (**1**) with options of **Strong** (**0**), **Bounded** (**1**), **Session** (**2**), and **Eventually** (**3**).

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<MutationResult>*

## Example\{#example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.delete({
   collection_name: 'my_collection',
   ids: [1,2,3,4]
 });
```

</TabItem>

<TabItem value='java'>

```java
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

// Delete by IDs
const resStatus1 = await milvusClient.delete({
    collection_name: 'my_collection',
    ids: [1, 2, 3, 4],
});

// Delete by filter
const resStatus2 = await milvusClient.delete({
    collection_name: 'my_collection',
    filter: 'id in [5, 6, 7, 8]',
});
```

</TabItem>
</Tabs>