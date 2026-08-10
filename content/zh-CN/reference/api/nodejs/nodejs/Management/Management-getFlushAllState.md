---
title: "getFlushAllState() | Node.js"
slug: /node/node/Management-getFlushAllState
sidebar_label: "getFlushAllState()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作检查 flush-all 操作是否已完成。 | Node.js"
type: docx
token: WgfTdXbMmoFhO9xBpencxLRRnbb
sidebar_position: 25
keywords: 
  - 图像相似性搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - getFlushAllState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getFlushAllState()

此操作检查 flush-all 操作是否已完成。

```typescript
await milvusClient.getFlushAllState(data: GetFlushAllStateReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.getFlushAllState({
    flush_all_ts?: number,
    flush_all_tss?: Record\<string, number\>,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**参数：**

- **flush_all_ts** (*number*) -<br/>
  flush-all 时间戳。可选，且已弃用。

- **flush_all_tss** (*Record&lt;string, number&gt;*) -<br/>
  Database 名称到 flush-all 时间戳的映射。可选。

- **db_name** (*string*) -<br/>
  Database 的名称。可选，且已弃用。

- **timeout** (*number*) -<br/>
  允许 RPC 使用的可选时长，单位为毫秒。如果将其设置为 undefined，客户端会持续等待，直到服务器响应或发生错误。默认值为 undefined。

- **client_request_id** (*string*) -<br/>
  用于请求跟踪的追踪 ID。可选。

**返回值** *Promise&lt;GetFlushAllStateResponse&gt;*

此方法返回一个 promise，并解析为 **GetFlushAllStateResponse** 对象。

```typescript
{
    flushed: boolean,
    status:  ResStatus
}
```

**参数：**

- **flushed** (*boolean*) -<br/>
  由提供的时间戳标识的 flush-all 操作是否已完全完成。当每个通道都达到请求的 flush 时间戳时，其值为 **true**；否则为 **false**。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的原因。如果此操作成功，则其值保持为空字符串。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.getFlushAllState({
    flush_all_tss: { db1: 123456789 },
});
```
