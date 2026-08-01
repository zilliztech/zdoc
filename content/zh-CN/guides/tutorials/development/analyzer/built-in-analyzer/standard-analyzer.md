---
title: "Standard Analyzer | Cloud"
slug: /standard-analyzer
sidebar_label: "Standard Analyzer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Standard Analyzer 是 Zilliz Cloud 中的默认 Analyzer ，如果未指定 Analyzer ，它将自动应用于文本字段。它使用基于语法的分词，因此对大多数语言都有效。 | Cloud"
type: origin
token: ZdWIwmiQCiKcIlkAHAZc1tDSngs
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Standard Analyzer

Standard Analyzer 是 Zilliz Cloud 中的默认 Analyzer ，如果未指定 Analyzer ，它将自动应用于文本字段。它使用基于语法的分词，因此对大多数语言都有效。

<Admonition type="info" icon="📘" title="说明">

为了更好地提升查询和搜索性能，根据您的文本语言选择一个合适的 Analyzer 是十分必要的。虽然 `standard` Analyzer 适用于大多数西方语言，但对于中文、日语和韩语这样有着特殊语法结构的语言来说却不是最佳选择。在这种情况下，建议您选择使用 [`chinese`](./chinese-analyzer) 或自定义使用指定分词器（如 lindera 或 icu）和过滤器的 Analyzer ，准确分词可以极大保障搜索结果的可靠性。  

</Admonition>

## 定义\{#definition}

Standard Analyzer由以下部分组成：  

- **分词器**：使用标准分词器根据语法规则将文本拆分为离散的单词单元。

- **过滤器**：使用小写过滤器将所有词元转换为小写，以实现不区分大小写的搜索。

Standard Analyzer 的功能等同于以下自定义 Analyzer 配置：  

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
analyzerParams.put("tokenizer", "standard");
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
analyzerParams := map[string]any{"tokenizer": "standard", "filter": []any{"lowercase"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "lowercase"
  ]
}'
```

</TabItem>
</Tabs>

## 配置\{#configuration}

要将 Standard Analyzer 应用于字段，只需在 `analyzer_params` 中将 `type` 设置为 `standard`，并根据需要包含可选参数。  

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
analyzerParams = map[string]any{"type": "standard"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "standard"
}'
```

</TabItem>
</Tabs>

Standard Analyzer 接受以下可选参数：  

| 参数 | 描述 |
| --- | --- |
| `stop_words` | 包含停用词列表的数组，这些词将在分词过程中被移除。默认为 `_english_`，即内置的常见英文停用词集合。 |

自定义停用词的配置示例：  

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
    "stop_words": ["of"] // Optional: List of words to exclude from tokenization
}
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "standard", "stop_words": []string{"of"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "standard",
  "stop_words": ["of"]
}'
```

</TabItem>
</Tabs>

定义 `analyzer_params` 后，您可以在定义集合模式时将其应用于 VARCHAR 字段。这使得 Zilliz Cloud 能够使用指定的 Analyzer 处理该字段中的文本，以实现高效的分词和过滤。更多信息，请参阅[使用示例](./analyzer-overview#example-use)。  

## 使用示例\{#examples}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### Analyzer 配置\{#analyzer-configuration}

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
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "standard");
analyzerParams.put("stop_words", Collections.singletonList("for"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
analyzer_params = {
    "type": "standard",  // Standard analyzer configuration
    "stop_words": ["for"] // Optional: Custom stop words parameter
}
    
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "standard", "stop_words": []string{"for"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "standard",
  "stop_words": ["for"]
}'
```

</TabItem>
</Tabs>

### 使用 `run_analyzer` 验证效果\{#verification-using-run_analyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Sample text to analyze
sample_text = "The Milvus vector database is built for scale!"

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
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("The Milvus vector database is built for scale!");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-node-sdk";

const sampleText = "The Milvus vector database is built for scale!";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
});

const result = await client.runAnalyzer({
    ...analyzerParams,
    text: sampleText
});
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
texts := []string{"The Milvus vector database is built for scale!"}
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
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
  -H "Content-Type: application/json" \
  -d '{
    "analyzerParams": "{\"type\": \"standard\", \"stop_words\": [\"for\"]}",
    "text": ["The Milvus vector database is built for scale!"]
  }'
```

</TabItem>
</Tabs>

### 预期输出\{#expected-output}

```sql
Standard analyzer output: ['the', 'milvus', 'vector', 'database', 'is', 'built', 'scale']
```

