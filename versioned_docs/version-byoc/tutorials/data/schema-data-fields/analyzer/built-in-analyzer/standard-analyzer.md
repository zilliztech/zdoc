---
title: "Standard Analyzer | BYOC"
slug: /standard-analyzer
sidebar_label: "Standard Analyzer"
beta: PUBLIC
notebook: FALSE
description: "The `standard` analyzer is the default analyzer in Zilliz Cloud, which is automatically applied to text fields if no analyzer is specified. It uses grammar-based tokenization, making it effective for most languages. | BYOC"
type: origin
token: WMSvwXXz4iR7mZkGmUscF3Y1nxs
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in analyzer
  - standard-analyzer
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Standard Analyzer

The `standard` analyzer is the default analyzer in Zilliz Cloud, which is automatically applied to text fields if no analyzer is specified. It uses grammar-based tokenization, making it effective for most languages.

## Definition{#definition}

The `standard` analyzer consists of:

- **Tokenizer**: Uses the `standard` tokenizer to split text into discrete word units based on grammar rules. For more information, refer to [Standard](./standard-tokenizer).

- **Filter**: Uses the `lowercase`[ filter](./lowercase-filter) to convert all tokens to lowercase, enabling case-insensitive searches. For more information, refer to

The functionality of the `standard` analyzer is equivalent to the following custom analyzer configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
analyzerParams.put("type", "english");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": ["lowercase"]
};
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

To apply the `standard` analyzer to a field, simply set `type` to `standard` in `analyzer_params`, and include optional parameters as needed.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # Specifies the standard analyzer type
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "standard", // Specifies the standard analyzer type
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

The `standard` analyzer accepts the following optional parameters: 

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

Example configuration of custom stop words:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard", # Specifies the standard analyzer type
    "stop_words", ["of"] # Optional: List of words to exclude from tokenization
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Collections.singletonList("of"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
analyzer_params = {
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

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For more information, refer to [Example use](./analyzer-overview).

## Examples{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

**Analyzer configuration**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "standard",  # Standard analyzer configuration
    "stop_words": ["for"] # Optional: Custom stop words parameter
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
sample_text = "The Milvus vector database is built for scale!"

# Run the standard analyzer with the defined configuration
result = MilvusClient.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
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

```plaintext
Standard analyzer output: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'scale']
```
