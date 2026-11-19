---
title: "FunctionObject | Node.js"
slug: /node/node/Collections-FunctionObject
sidebar_label: "FunctionObject"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes the function object used in a collection schema. | Node.js"
type: origin
token: shared-Collections-FunctionObject
keywords: 
  - function object
  - bm25
  - schema
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionObject

Describes a doc-in/doc-out function attached to a collection (for example a text-embedding function), passed via `functions` in the create-collection request.

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

**FIELDS:**

- **name** (*string*) -

    The function name.

- **description** (*string*) -

    Optional description of the function.

- **type** (*FunctionType | FunctionTypeName*) -

    The function type.

- **input_field_names** (*string[]*) -

    The input field names of the function.

- **output_field_names** (*string[]*) -

    The output field names of the function.

- **params** (*Record&lt;string, any&gt;*) -

    Function parameters.

## Example\{#example}

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

