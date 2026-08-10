---
title: "runAnalyzer() | Node.js"
slug: /node/node/Collections-runAnalyzer
sidebar_label: "runAnalyzer()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会对提供的文本运行 Analyzer，以用于测试。 | Node.js"
type: docx
token: LsMldPd8GodoVqxCAZUcWYjdnwh
sidebar_position: 18
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - runAnalyzer()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# runAnalyzer()

此操作会对提供的文本运行 Analyzer，以用于测试。

```javascript
await milvusClient.runAnalyzer(data)
```

## 请求语法\{#request-syntax}

```javascript
milvusClient({
    analyzer_params: Record<string, any>,
    text: string | string[],
    with_detail: boolean,
    with_hash: boolean
})
```

**参数：**

- **analyzer_params** (*Record&lt;string, any&gt;*) -

    Analyzer 的参数。

- **text** (*string* | *string[]*) -

    要分析的输入文本或文本列表。

- **with_detail** (*boolean*) -

    可选标志，指示是否返回详细的分析输出。

- **with_hash** (*boolean*) -

    可选标志，指示是否包含基于哈希的处理。

**返回** *Promise&lt;RunAnalyzerResponse&gt;*

此方法返回一个 promise，该 promise 会解析为 **RunAnalyzerResponse** 对象。

```typescript
{
    results: AnalyzerResult[],
    status:  ResStatus
}
```

**参数：**

- **results** (*AnalyzerResult[]*) -<br/>
  分词输出。当 **text** 为单个字符串时，此列表包含一个条目；当 **text** 为数组时，各条目与输入顺序一一对应。

    - **tokens** (*AnalyzerToken[]*) -

        Analyzer 生成的 token。

        - **token** (*string*) -

        token 文本。

        - **start_offset** (*number*) -

        token 在输入中开始位置的从零开始字符偏移量。

        - **end_offset** (*number*) -

        token 之后紧接位置的从零开始字符偏移量。

        - **position** (*number*) -

        token 在流中的位置，用于短语查询。

        - **position_length** (*number*) -

        token 跨越的流位置数量。

        - **hash** (*number*) -

        token 的哈希值；当请求将 **with_hash** 设置为 **true** 时会填充该字段。

        - **token** (*string*) -

            token 文本。

        - **start_offset** (*number*) -

            token 在输入中开始位置的从零开始字符偏移量。

        - **end_offset** (*number*) -

            token 之后紧接位置的从零开始字符偏移量。

        - **position** (*number*) -

            token 在流中的位置，用于短语查询。

        - **position_length** (*number*) -

            token 跨越的流位置数量。

        - **hash** (*number*) -

            token 的哈希值；当请求将 **with_hash** 设置为 **true** 时会填充该字段。

- **ResStatus**<br/>
  一个 **ResStatus** 对象。

    - **code** (*number*) -

        表示操作结果的代码。如果此操作成功，则其值保持为 **0**。

    - **error_code** (*string* | *number*) -

        表示已发生错误的错误代码。如果此操作成功，则其值保持为 **Success**。

    - **reason** (*string*) -

        表示所报告错误原因的说明。如果此操作成功，则其值保持为空字符串。
