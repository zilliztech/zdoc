---
title: "English | Cloud"
slug: /english-analyzer
sidebar_label: "English"
beta: PUBLIC
notebook: FALSE
description: "The `english` analyzer in Zilliz Cloud is designed to process English text, applying language-specific rules for tokenization and filtering. | Cloud"
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
  - LLMs
  - Machine Learning
  - RAG
  - NLP

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# English

The `english` analyzer in Zilliz Cloud is designed to process English text, applying language-specific rules for tokenization and filtering.

## Definition{#definition}

The `english` analyzer uses the following components:

- **Tokenizer**: Uses the `standard`[ tokenizer](./standard-tokenizer) to split text into discrete word units.

- **Filters**: Includes multiple filters for comprehensive text processing:

    - `lowercase`: Converts all tokens to lowercase, enabling case-insensitive searches.

    - `stemmer`: Reduces words to their root form to support broader matching (e.g., "running" becomes "run").

    - `stop_words`: Removes common English stop words to focus on key terms in text.

The functionality of the `english` analyzer is equivalent to the following custom analyzer configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // Specifies the standard analyzer type
    "stop_words", ["of"] // Optional: List of words to exclude from tokenization
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## Configuration{#configuration}

To apply the `english` analyzer to a field, simply set `type` to `english` in `analyzer_params`, and include optional parameters as needed.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "english",
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "english",
    "stop_words": ["a", "an", "the"]
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview).

## Examples{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

**Analyzer configuration**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

**Verification using `run_analyzer`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample text to analyze
sample_text = "Milvus is a vector database built for scale!"

# Run the standard analyzer with the defined configuration
result = MilvusClient.run_analyzer(sample_text, analyzer_params)
print("English analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

**Expected output**:

```python
English analyzer output: ['milvus', 'vector', 'databas', 'built', 'scale']
```

