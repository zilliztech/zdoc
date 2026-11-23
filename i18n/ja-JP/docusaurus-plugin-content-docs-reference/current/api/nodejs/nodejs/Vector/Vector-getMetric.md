---
title: "getMetric() | Node.js"
slug: /node/node/Vector-getMetric
sidebar_label: "getMetric()"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、システム情報、統計情報、ログなど、Milvus システムからメトリクス情報を取得します。 | Node.js"
type: origin
token: shared-Vector-getMetric
keywords: 
  - メトリクス
  - システム情報
  - メトリクスの取得
  - zilliz
  - zilliz cloud
  - クラウド
  - getMetric()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getMetric()

この操作は、システム情報、統計情報、ログなどのメトリクス情報を Milvus システムから取得します。

```javascript
await milvusClient.getMetric(data: GetMetricsRequest)
```

## リクエスト構文\{#request-syntax}

```javascript
await milvusClient.getMetric({
    request: { metric_type: string },
    timeout?: number,
})
```

**パラメーター:**

- **request** (*object*) -

    **[必須]**

    `"system_info"`、`"system_statistics"`、または `"system_log"` のいずれかを指定できる `metric_type` を含むオブジェクトです。

- **timeout** (*number*) -

    ミリ秒単位の RPC タイムアウトです。任意です。

**戻り値:**

*Promise&lt;GetMetricsResponse&gt;*

このメソッドは、**GetMetricsResponse** オブジェクトに解決される Promise を返します。

```javascript
{
    response: any,
    component_name: string,
    status:  ResStatus
}
```

**パラメーター:**

- **response** (*any*) -
対象コンポーネントによって返されるメトリクスペイロードです。形状は、要求された **metric_type** によって異なります（例: **system_info**、**system_statistics**、**system_log**）。この値は JSON として解析してください。

- **component_name** (*string*) -
メトリクスを生成したコンポーネントです（例: **rootcoord**、**querynode**、**datanode**）。

- **ResStatus**
**ResStatus** オブジェクトです。

    - **code** (*number*) -

        操作結果を示すコードです。この操作が成功した場合、**0** のままです。

    - **error_code** (*string* | *number*) -

        発生したエラーを示すエラーコードです。この操作が成功した場合、**Success** のままです。

    - **reason** (*string*) -

        報告されたエラーの理由を示す理由です。この操作が成功した場合、空の文字列のままです。


**例外:**

- **Error**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

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
