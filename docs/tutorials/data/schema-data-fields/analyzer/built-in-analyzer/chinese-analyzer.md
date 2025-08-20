---
title: "Chinese | Cloud"
slug: /chinese-analyzer
sidebar_label: "Chinese"
beta: FALSE
notebook: FALSE
description: "The `chinese` analyzer is designed specifically to handle Chinese text, providing effective segmentation and tokenization. | Cloud"
type: origin
token: Of8PwuunCihBfxksNJJcSCRYnsf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in analyzer
  - chinese analyzer
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Chinese

The `chinese` analyzer is designed specifically to handle Chinese text, providing effective segmentation and tokenization.

### Definition{#definition}

The `chinese` analyzer consists of:

- **Tokenizer**: Uses the `jieba` tokenizer to segment Chinese text into tokens based on vocabulary and context. For more information, refer to [Jieba](./jieba-tokenizer).

- **Filter**: Uses the `cnalphanumonly` filter to remove tokens that contain any non-Chinese characters. For more information, refer to [Cnalphanumonly](./cnalphanumonly-filter).

The functionality of the `chinese` analyzer is equivalent to the following custom analyzer configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("cnalphanumonly"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "jieba", "filter": []any{"cnalphanumonly"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba",
  "filter": [
    "cnalphanumonly"
  ]
}'

```

</TabItem>
</Tabs>

### Configuration{#configuration}

To apply the `chinese` analyzer to a field, simply set `type` to `chinese` in `analyzer_params`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "chinese",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "chinese");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "type": "chinese",
}
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "chinese"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "chinese"
}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>The <code>chinese</code> analyzer does not accept any optional parameters.</p>

</Admonition>

## Examples{#examples}

### Analyzer configuration{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "chinese",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "chinese");
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "chinese"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### Expected output{#expected-output}

```python
Chinese analyzer output: ['Milvus', '是', '一个', '高性', '性能', '高性能', '可', '扩展', '的', '向量', '数据', '据库', '数据库']
```

