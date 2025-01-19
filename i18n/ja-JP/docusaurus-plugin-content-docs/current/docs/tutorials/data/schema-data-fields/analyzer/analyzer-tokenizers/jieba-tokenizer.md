---
title: "Jieba | Cloud"
slug: /jieba-tokenizer
sidebar_label: "Jieba"
beta: PUBLIC
notebook: FALSE
description: "The `jieba` tokenizer processes Chinese text by breaking it down into its component words. | Cloud"
type: origin
token: JGURwBQNOijp2DkspFFctbAGnLh
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - jieba-tokenizer
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

The `jieba` tokenizer processes Chinese text by breaking it down into its component words.

## Configuration{#configuration}

To configure an analyzer using the `jieba` tokenizer, set `tokenizer` to `jieba` in `analyzer_params`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
```

</TabItem>
</Tabs>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview).

## Example output{#example-output}

Here’s an example of how the `jieba` tokenizer processes text:

**Original text**:

```python
"Milvus 是一个高性能、可扩展的向量数据库！"
```

**Expected output**:

```python
["Milvus", " ", "是", "一个", "高性", "性能", "高性能", "、", "可", "扩展", "的", "向量", "数据", "据库", "数据库", "！"]
```

