---
title: "Jieba | BYOC"
slug: /jieba-tokenizer
sidebar_label: "Jieba"
beta: FALSE
notebook: FALSE
description: "The `jieba` tokenizer processes Chinese text by breaking it down into its component words. | BYOC"
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
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

The `jieba` tokenizer processes Chinese text by breaking it down into its component words.

<Admonition type="info" icon="📘" title="Notes">

<p>The <code>jieba</code> tokenizer preserves punctuation marks as separate tokens in the output. For example, <code>"你好！世界。"</code> becomes <code>&#91;"你好", "！", "世界", "。"&#93;</code>. To remove these standalone punctuation tokens, use the <code>removepunct</code> filter.</p>

</Admonition>

## Configuration{#configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Simple configuration: only specifying the tokenizer name
analyzer_params = {
    "tokenizer": "jieba",  # Use the default settings: dict=["_default_"], mode="search", hmm=True
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "jieba"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba"
}'
```

</TabItem>
</Tabs>

## Examples{#examples}

### Analyzer configuration{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["结巴分词器"],
        "mode": "exact",
        "hmm": False
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("结巴分词器"));
analyzerParams.put("mode", "exact");
analyzerParams.put("hmm", false);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"结巴分词器"}, "mode": "exact", "hmm": false}
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
['milvus', '结巴分词器', '中', '文', '测', '试']
```

