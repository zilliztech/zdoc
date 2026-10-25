---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/Function-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "`Function` オブジェクトの辞書表現を返す操作です。 | Python | MilvusClient"
type: docx
token: HacudytI2olONTxEtofcuXLin1f
sidebar_position: 4
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# to_dict()

この操作は、`Function` オブジェクトの辞書表現を返します。

## Request Syntax\{#request-syntax}

```python
to_dict()
```

**RETURN TYPE:**

*dict*

**RETURNS:**

Function オブジェクトの辞書表現。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Examples\{#examples}

```python
from pymilvus import Function, FunctionType

bm25_function = Function(
    name="bm25_fn",
    input_field_names=["document_content"],
    output_field_names="sparse_vector",
    function_type=FunctionType.BM25,
)

bm25_func_dict = bm25_function.to_dict()

print(bm25_func_dict)
```
