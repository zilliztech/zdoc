---
title: "dropCollectionField() | Node.js"
slug: /node/node/Collections-dropCollectionField
sidebar_label: "dropCollectionField()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作按名称或 ID 从现有 Collection 中删除字段。 | Node.js"
type: docx
token: ANWZdmEMkocWK3xo2ZxcnqtLnUh
sidebar_position: 31
keywords: 
  - 异常检测
  - 句子转换器
  - 推荐系统
  - 信息检索
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropCollectionField()
  - nodejs30
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropCollectionField()

此操作按名称或 ID 从现有 Collection 中删除字段。

## 请求语法\{#request-syntax}

```typescript
milvusClient.dropCollectionField({ collection_name, field_name | field_id, timeout? })
```

**参数：**

- **collection_name** （*string*） -

    现有 Collection 的名称。

- **field_name** （*string*） -

    要删除的字段的名称。请提供 field_name 或 field_id，不要同时提供两者。

- **field_id** （*number | string*） -

    要删除的字段的标识符。请提供 field_name 或 field_id，不要同时提供两者。

- **timeout** （*number*） -

    允许 RPC 执行的可选时长，单位为毫秒。该值默认为 undefined。

**返回类型：**

*ResStatus*

**返回：**

Schema 变更的状态。

**参数：**

- **error_code** （*number*） -

    错误代码编号：0 表示成功。

- **reason** （*string*） -

    错误的原因（如果有）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息，以确定确切的失败原因。

## 示例\{#example}

```javascript
await milvusClient.dropCollectionField({
  collection_name: 'my_collection',
  field_name: 'sparse_vector',
});
```
