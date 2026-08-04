---
title: "getLoadState() | Node.js"
slug: /node/node/Management-getLoadState
sidebar_label: "getLoadState()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作显示指定集合或分区是否已加载。 | Node.js"
type: docx
token: J17ZdPNwqo4nt3x5b8pc0H5Nnph
sidebar_position: 14
keywords: 
  - 什么是语义搜索
  - Embedding model
  - 图像相似性搜索
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - getLoadState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getLoadState()

此操作显示指定集合或分区是否已加载。

```javascript
await milvusClient.getLoadState(data)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getLoadState({
   db_name: string,
   collection_name: string,
   partition_names?: string[],
   timeout?: number
 })
```

**参数：**

- **db_name** (*string*) -

    保存目标集合的数据库名称。

- **collection_name** (*string*) -

    **[必需]**

    集合的名称。

- **partition_names** (*string[]*) -

    一个或多个分区的名称。

- **timeout** (*number*) -

    此操作的超时时长。将其设置为 **None** 表示此操作会在任意响应返回或发生错误时超时。

**返回值** *Promise&lt;GetLoadStateResponse&gt;*

此方法返回一个 promise，该 promise 会解析为一个 **GetLoadStateResponse** 对象。

```typescript
{
    state: LoadState,
    status:  ResStatus
}
```

**参数：**

- **state** (*LoadState*) -<br/>
  当前加载状态。可能的值有 **LoadStateNotExist**、**LoadStateNotLoad**、**LoadStateLoading** 和 **LoadStateLoaded**。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则该值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则该值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则该值保持为空字符串。

## 示例\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.getLoadState({
   collection_name: 'my_collection',
 });
```

