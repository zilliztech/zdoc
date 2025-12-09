---
title: "Jieba | BYOC"
slug: /jieba-tokenizer
sidebar_label: "Jieba"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
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
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

The `jieba` tokenizer processes Chinese text by breaking it down into its component words.

<Admonition type="info" icon="📘" title="Notes">

<p>The <code>jieba</code> tokenizer preserves punctuation marks as separate tokens in the output. For example, <code>"你好！世界。"</code> becomes <code>["你好", "！", "世界", "。"]</code>. To remove these standalone punctuation tokens, use the <a href="./remove-punct-filter"><code>removepunct</code></a> filter.</p>

</Admonition>

## Configuration\{#configuration}

Milvus supports two configuration approaches for the `jieba` tokenizer: a simple configuration and a custom configuration.

### Simple configuration\{#simple-configuration}

With the simple configuration, you only need to set the tokenizer to `"jieba"`. For example:

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

This simple configuration is equivalent to the following custom configuration:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Custom configuration equivalent to the simple configuration above
analyzer_params = {
    "type": "jieba",          # Tokenizer type, fixed as "jieba"
    "dict": ["_default_"],     # Use the default dictionary
    "mode": "search",          # Use search mode for improved recall (see mode details below)
    "hmm": True                # Enable HMM for probabilistic segmentation
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("_default_"));
analyzerParams.put("mode", "search");
analyzerParams.put("hmm", true);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"_default_"}, "mode": "search", "hmm": true}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

For details on parameters, refer to [Custom configuration](./jieba-tokenizer#custom-configuration).

### Custom configuration\{#custom-configuration}

For more control, you can provide a custom configuration that allows you to specify a custom dictionary, select the segmentation mode, and enable or disable the Hidden Markov Model (HMM). For example:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Custom configuration with user-defined settings
analyzer_params = {
    "tokenizer": {
        "type": "jieba",           # Fixed tokenizer type
        "dict": ["customDictionary"],  # Custom dictionary list; replace with your own terms
        "mode": "exact",           # Use exact mode (non-overlapping tokens)
        "hmm": False               # Disable HMM; unmatched text will be split into individual characters
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("customDictionary"));
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
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"customDictionary"}, "mode": "exact", "hmm": false}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Default Value</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>The type of tokenizer. This is fixed to <code>"jieba"</code>.</p></td>
     <td><p><code>"jieba"</code></p></td>
   </tr>
   <tr>
     <td><p><code>dict</code></p></td>
     <td><p>A list of dictionaries that the analyzer will load as its vocabulary source. Built-in options:</p><ul><li><p><code>"_default_"</code>: Loads the engine's built‑in Simplified‑Chinese dictionary. For details, refer to <a href="https://github.com/messense/jieba-rs/blob/v0.6.8/src/data/dict.txt">dict.txt</a>.</p></li><li><p><code>"_extend_default_"</code>: Loads everything in <code>"_default_"</code> plus an additional Traditional‑Chinese supplement. For details, refer to <a href="https://github.com/milvus-io/milvus/blob/v2.5.11/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/data/jieba/dict.txt.big">dict.txt.big</a>.</p><p>You can also mix the built‑in dictionary with any number of custom dictionaries. Example: <code>["_default_", "结巴分词器"]</code>.</p></li></ul></td>
     <td><p><code>["_default_"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>mode</code></p></td>
     <td><p>The segmentation mode. Possible values:</p><ul><li><p><code>"exact"</code>: Tries to segment the sentence in the most precise manner, making it ideal for text analysis.</p></li><li><p><code>"search"</code>: Builds on exact mode by further breaking down long words to improve recall, making it suitable for search engine tokenization.</p><p>For more information, refer to <a href="https://github.com/fxsjy/jieba">Jieba GitHub Project</a>.</p></li></ul></td>
     <td><p><code>"search"</code></p></td>
   </tr>
   <tr>
     <td><p><code>hmm</code></p></td>
     <td><p>A boolean flag indicating whether to enable the Hidden Markov Model (HMM) for probabilistic segmentation of words not found in the dictionary.</p></td>
     <td><p><code>true</code></p></td>
   </tr>
</table>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Analyzer configuration\{#analyzer-configuration}

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

### Verification using `run_analyzer`\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Sample text to analyze
sample_text = "milvus结巴分词器中文测试"

# Run the standard analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("milvus结巴分词器中文测试");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "encoding/json"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"milvus结巴分词器中文测试"}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParams(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### Expected output\{#expected-output}

```python
['milvus', '结巴分词器', '中', '文', '测', '试']
```

