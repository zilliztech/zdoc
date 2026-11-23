---
title: "getMetric() | Node.js"
slug: /node/node/Vector-getMetric
sidebar_label: "getMetric()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation gets metric information from the Milvus system, including system info, statistics, or logs. | Node.js"
type: origin
token: shared-Vector-getMetric
keywords: 
  - metrics
  - system info
  - get metric
  - zilliz
  - zilliz cloud
  - cloud
  - getMetric()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getMetric()

This operation gets metric information from the Milvus system, including system info, statistics, or logs.

```javascript
await milvusClient.getMetric(data: GetMetricsRequest)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getMetric({
    request: { metric_type: string },
    timeout?: number,
})
```

**PARAMETERS:**

- **request** (*object*) -

    **[REQUIRED]**

    An object containing `metric_type` which can be `"system_info"`, `"system_statistics"`, or `"system_log"`.

- **timeout** (*number*) -

    RPC timeout in milliseconds. Optional.

**RETURNS:**

*Promise&lt;GetMetricsResponse&gt;*

This method returns a promise that resolves to a **GetMetricsResponse** object.

```javascript
{
    response: any,
    component_name: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **response** (*any*) -
The metrics payload returned by the targeted component. The shape depends on the requested **metric_type** (for example, **system_info**, **system_statistics**, **system_log**); parse this value as JSON.

- **component_name** (*string*) -
The component that produced the metrics (for example, **rootcoord**, **querynode**, **datanode**).

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
