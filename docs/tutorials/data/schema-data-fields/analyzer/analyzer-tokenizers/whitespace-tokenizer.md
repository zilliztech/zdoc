---
title: "Whitespace | Cloud"
slug: /whitespace-tokenizer
sidebar_label: "Whitespace"
beta: PUBLIC
notebook: FALSE
description: "The `whitespace` tokenizer divides text into terms whenever there is a space between words. | Cloud"
type: origin
token: F2QrwjFSziSUkJkyXzbcwovUnCg
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - whitespace-tokenizer
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Whitespace

The `whitespace` tokenizer divides text into terms whenever there is a space between words.

## Configuration{#configuration}

To configure an analyzer using the `whitespace` tokenizer, set `tokenizer` to `whitespace` in `analyzer_params`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
```

</TabItem>
</Tabs>

The whitespace tokenizer can work in conjunction with one or more filters. For example, the following code defines an analyzer that uses the `whitespace` tokenizer and `lowercase`[ filter](./lowercase-filter):

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>
</Tabs>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

## Example output{#example-output}

Here’s an example of how the `whitespace` tokenizer processes text:

**Original text**:

```python
"The Milvus vector database is built for scale!"
```

**Expected output**:

```python
["The", "Milvus", "vector", "database", "is", "built", "for", "scale!"]
```

