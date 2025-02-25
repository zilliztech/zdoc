---
title: "English | BYOC"
slug: /english-analyzer
sidebar_label: "English"
beta: PUBLIC
notebook: FALSE
description: "The `english` analyzer in Zilliz Cloud is designed to process English text, applying language-specific rules for tokenization and filtering. | BYOC"
type: origin
token: W0WhwqRyciRMRLklcsdca1U2nae
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in analyzer
  - english analyzer
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# English

The `english` analyzer in Zilliz Cloud is designed to process English text, applying language-specific rules for tokenization and filtering.

### Definition{#definition}

The `english` analyzer uses the following components:

- **Tokenizer**: Uses the `standard`[ tokenizer](./standard-tokenizer) to split text into discrete word units.

- **Filters**: Includes multiple filters for comprehensive text processing:

    - `lowercase`: Converts all tokens to lowercase, enabling case-insensitive searches.

    - `stemmer`: Reduces words to their root form to support broader matching (e.g., "running" becomes "run").

    - `stop_words`: Removes common English stop words to focus on key terms in text.

The functionality of the `english` analyzer is equivalent to the following custom analyzer configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
        "tokenizer": "standard",
        "filter": [
                "lowercase",
                {
                        "type": "stemmer",
                        "language": "english"
                }, {
                        "type": "stop",
                        "stop_words": "_english_"
                }
        ]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Arrays.asList("lowercase",
                new HashMap<String, Object>() {{
                    put("type", "stemmer");
                    put("language", "english");
                }},
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Collections.singletonList("_english_"));
                }}
        )
);
```

</TabItem>
</Tabs>

### Configuration{#configuration}

To apply the `english` analyzer to a field, simply set `type` to `english` in `analyzer_params`, and include optional parameters as needed.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "english",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");
```

</TabItem>
</Tabs>

The `english` analyzer accepts the following optional parameters: 

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>An array containing a list of stop words, which will be removed from tokenization. Defaults to <code>_english_</code>, a built-in set of common English stop words.</p></td>
   </tr>
</table>

Example configuration with custom stop words:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "english",
    "stop_words": ["a", "an", "the"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "english");
analyzerParams.put("stop_words", Arrays.asList("a", "an", "the"));
```

</TabItem>
</Tabs>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview).

### Example output{#example-output}

Here’s how the `english` analyzer processes text.

**Original text**:

```python
"The Milvus vector database is built for scale!"
```

**Expected output**:

```python
["milvus", "vector", "databas", "built", "scale"]
```

