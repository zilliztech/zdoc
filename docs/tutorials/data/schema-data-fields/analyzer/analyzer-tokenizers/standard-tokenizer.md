---
title: "Standard Tokenizer | Cloud"
slug: /standard-tokenizer
sidebar_label: "Standard Tokenizer"
beta: PUBLIC
notebook: FALSE
description: "The `standard` tokenizer in Zilliz Cloud splits text based on spaces and punctuation marks, making it suitable for most languages. | Cloud"
type: origin
token: GAX8wkC1QiTZhXkLBocc1GoTnke
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - standard-tokenizer
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Standard Tokenizer

The `standard` tokenizer in Zilliz Cloud splits text based on spaces and punctuation marks, making it suitable for most languages.

## Configuration{#configuration}

To configure an analyzer using the `standard` tokenizer, set `tokenizer` to `standard` in `analyzer_params`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
```

</TabItem>
</Tabs>

The `standard` tokenizer can work in conjunction with one or more filters. For example, the following code defines an analyzer that uses the `standard` tokenizer and `lowercase` filter:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>For simpler setup, you may choose to use the <code>standard</code> <a href="./standard-analyzer">analyzer</a>, which combines the <code>standard</code> tokenizer with the <code>lowercase</code><a href="./lowercase-filter"> filter</a>.</p>

</Admonition>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview).

## Example output{#example-output}

Here’s an example of how the `standard` tokenizer processes text:

**Original text**:

```python
"The Milvus vector database is built for scale!"
```

**Expected output**:

```python
["The", "Milvus", "vector", "database", "is", "built", "for", "scale"]
```

