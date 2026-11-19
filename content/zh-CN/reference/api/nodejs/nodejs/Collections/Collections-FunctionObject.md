---
title: "FunctionObject | Node.js"
slug: /node/node/Collections-FunctionObject
sidebar_label: "FunctionObject"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作介绍 Collection Schema 中使用的函数对象。 | Node.js"
type: origin
token: shared-Collections-FunctionObject
keywords: 
  - 函数对象
  - bm25
  - Schema
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionObject

描述一个附加到 Collection 的 doc-in/doc-out 函数（例如文本嵌入函数），该函数在创建 Collection 请求中通过 `functions` 传入。

```typescript
export type FunctionObject = {
  name: string;
  description?: string;
  type: FunctionType | FunctionTypeName;
  input_field_names: string[];
  output_field_names?: string[];
  params: Record<string, any>;
};
```

**字段：**

- **name**（*string*）-

    函数名称。

- **description**（*string*）-

    函数的可选描述。

- **type**（*FunctionType | FunctionTypeName*）-

    函数类型。

- **input_field_names**（*string[]*）-

    函数的输入字段名称。

- **output_field_names**（*string[]*）-

    函数的输出字段名称。

- **params**（*Record&lt;string, any&gt;*）-

    函数参数。

## 示例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createCollection({
    collection_name: 'my_collection',
    functions: [
        {
            name: 'text_embedding',
            type: FunctionType.TEXTEMBEDDING,
            input_field_names: ['text'],
            output_field_names: ['vector'],
            params: { model: 'bge-large-zh-v1.5' },
        },
    ],
});
```
