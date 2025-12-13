---
title: "ICU | Cloud"
slug: /icu-tokenizer
sidebar_label: "ICU"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `icu` tokenizer is built on the Internationalization Components of Unicode open‑source project, which provides key tools for software internationalization. By using ICU's word‑break algorithm, the tokenizer can accurately split text into words across the majority of the world’s languages. | Cloud"
type: origin
token: Q3gKwc5lkilAbKkalCWcW2AbnLe
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in tokenizer
  - icu-tokenizer
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ICU

The `icu` tokenizer is built on the [Internationalization Components of Unicode](http://site.icu-project.org/) (ICU) open‑source project, which provides key tools for software internationalization. By using ICU's word‑break algorithm, the tokenizer can accurately split text into words across the majority of the world’s languages.

<Admonition type="info" icon="📘" title="Notes">

<p>The <code>icu</code> tokenizer preserves punctuation marks and spaces as separate tokens in the output. For example, <code>"Привет! Как дела?"</code> becomes <code>["Привет", "!", " ", "Как", " ", "дела", "?"]</code>. To remove these standalone punctuation tokens, use the <a href="./remove-punct-filter"><code>removepunct</code></a> filter.</p>

</Admonition>

## Configuration\{#configuration}

To configure an analyzer using the `icu` tokenizer, set `tokenizer` to `icu` in `analyzer_params`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "icu"}
```

</TabItem>

<TabItem value='bash'>

```bash
# curl
```

</TabItem>
</Tabs>

The `icu` tokenizer can work in conjunction with one or more filters. For example, the following code defines an analyzer that uses the `icu` tokenizer and [remove punct filter](./remove-punct-filter):

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
    "filter": ["removepunct"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
analyzerParams.put("filter", Collections.singletonList("removepunct"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "icu", "filter": []string{"removepunct"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# curl
```

</TabItem>
</Tabs>

After defining `analyzer_params`, you can apply them to a `VARCHAR` field when defining a collection schema. This allows Zilliz Cloud to process the text in that field using the specified analyzer for efficient tokenization and filtering. For details, refer to [Example use](./analyzer-overview#example-use).

## Examples\{#examples}

Before applying the analyzer configuration to your collection schema, verify its behavior using the `run_analyzer` method.

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "icu",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "icu");
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "icu"}
```

</TabItem>

<TabItem value='bash'>

```bash
# curl
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
sample_text = "Привет! Как дела?"

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
texts.add("Привет! Как дела?");

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
texts := []string{"Привет! Как дела?"}
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

```plaintext
['Привет', '!', ' ', 'Как', ' ', 'дела', '?']
```

