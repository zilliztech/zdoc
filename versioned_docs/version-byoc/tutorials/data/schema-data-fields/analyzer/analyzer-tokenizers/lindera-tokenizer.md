---
title: "Lindera | BYOC"
slug: /lindera-tokenizer
sidebar_label: "Lindera"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `lindera` tokenizer performs dictionary-based morphological analysis. It is a good choice for languages—such as Japanese, Korean, and Chinese—whose words are not separated by spaces. | BYOC"
type: origin
token: PvwZwtu3FiBQNqkPa5VcqH6qnmg
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - lindera-tokenizer
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lindera

The `lindera` tokenizer performs dictionary-based morphological analysis. It is a good choice for languages—such as Japanese, Korean, and Chinese—whose words are not separated by spaces.

<Admonition type="info" icon="📘" title="Notes">

<p>The <code>lindera</code> tokenizer preserves punctuation marks as separate tokens in the output. For example, <code>"こんにちは！"</code> becomes <code>["こんにちは", "！"]</code>. To remove these standalone punctuation tokens, use the <a href="./remove-punct-filter"><code>removepunct</code></a> filter.</p>

</Admonition>

## Configuration\{#configuration}

To configure an analyzer using the `lindera` tokenizer, set `tokenizer.type` to `lindera` and choose a dictionary with `dict_kind`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
      "type": "lindera",
      "dict_kind": "ipadic"
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer",
                new HashMap<String, Object>() {{
                    put("type", "lindera");
                    put("dict_kind", "ipadic");
                }});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": map[string]any{"type": "lindera", "dict_kind": "ipadic"}}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
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
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>The type of tokenizer. This is fixed to <code>"lindera"</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>dict_kind</code></p></td>
     <td><p>A dictionary used to define vocabulary. Possible values:</p><ul><li><p><code>ko-dic</code>: Korean - Korean morphological dictionary (<a href="https://bitbucket.org/eunjeon/mecab-ko-dic">MeCab Ko-dic</a>)</p></li><li><p><code>ipadic</code>: Japanese - Standard morphological dictionary (<a href="https://taku910.github.io/mecab/">MeCab IPADIC</a>)</p></li></ul></td>
   </tr>
</table>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
      "type": "lindera",
      "dict_kind": "ipadic"
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer",
                new HashMap<String, Object>() {{
                    put("type", "lindera");
                    put("dict_kind", "ipadic");
                }});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": map[string]any{"type": "lindera", "dict_kind": "ipadic"}}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### Verification using `run_analyzer`\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
sample_text = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅で"

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
texts.add("東京スカイツリーの最寄り駅はとうきょうスカイツリー駅で");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
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
texts := []string{"東京スカイツリーの最寄り駅はとうきょうスカイツリー駅で"}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParams(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node.js
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### Expected output\{#expected-output}

```plaintext
{tokens: ['東京', 'スカイ', 'ツリー', 'の', '最寄り駅', 'は', 'とう', 'きょう', 'スカイ', 'ツリー', '駅', 'で']} 
```
