---
title: "getMetric() | Node.js"
slug: /node/node/Vector-getMetric
sidebar_label: "getMetric()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作从 Milvus 系统获取指标信息，包括系统信息、统计信息或日志。 | Node.js"
type: origin
token: shared-Vector-getMetric
keywords: 
  - 指标
  - 系统信息
  - 获取指标
  - zilliz
  - zilliz cloud
  - 云
  - getMetric()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getMetric()

此操作从 Milvus 系统获取指标信息，包括系统信息、统计信息或日志。

```javascript
await milvusClient.getMetric(data: GetMetricsRequest)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.getMetric({
    request: { metric_type: string },
    timeout?: number,
})
```

**参数：**

- **request**（*object*） -

    **[必需]**

    一个包含 `metric_type` 的对象，其值可以是 `"system_info"`、`"system_statistics"` 或 `"system_log"`。

- **timeout**（*number*） -

    RPC 超时时间，单位为毫秒。可选。

**返回：**

*Promise&lt;GetMetricsResponse&gt;*

此方法返回一个 promise，其解析结果为 **GetMetricsResponse** 对象。

```javascript
{
    response: any,
    component_name: string,
    status:  ResStatus
}
```

**参数：**

- **response**（*any*） -
由目标组件返回的指标负载。其结构取决于所请求的 **metric_type**（例如 **system_info**、**system_statistics** 和 **system_log**）；请将此值解析为 JSON。

- **component_name**（*string*） -
生成这些指标的组件（例如 **rootcoord**、**querynode** 和 **datanode**）。

- **ResStatus**
一个 **ResStatus** 对象。

    - **code**（*number*） -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code**（*string* | *number*） -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason**（*string*） -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。


**异常：**

- **Error**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({ 
    address: 'YOUR_CLUSTER_ENDPOINT', 
    token: 'YOUR_CLUSTER_TOKEN' 
});
const res = await client.getMetric({
    request: { metric_type: 'system_info' },
});
console.log(res.response);
```
