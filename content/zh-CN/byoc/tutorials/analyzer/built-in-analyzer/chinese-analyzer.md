---
title: "Chinese | BYOC"
slug: /chinese-analyzer
sidebar_label: "Chinese"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Chinese Analyzer 专门设计用于处理中文文本，提供有效的分段和分词。 | BYOC"
type: origin
token: UlMPwmPO5iJBn1kDTLzc5cJVnXO
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Chinese

Chinese Analyzer 专门设计用于处理中文文本，提供有效的分段和分词。

## 定义\{#definition}

Chinese Analyzer 由以下部分组成：

- 分词器：使用 `jieba` 分词器根据词汇和上下文将中文文本分割成标记。更多内容，可以参考[Jieba](./jieba-tokenizer)。

- 过滤器：使用 `cnalphanumonly` 过滤器去除包含任何非中文字符的标记。更多内容，可以参考[Cnalphanumonly](./cnalphanumonly-filter)。

Chinese Analyzer 的功能等同于以下自定义分析器配置：

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

## 配置\{#configuration}

要将 Chinese Analyzer 应用于字段，只需在 `analyzer_params` 中将 `type` 设置为 `chinese`，并根据需要包含可选参数。  

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

<Admonition type="info" icon="📘" title="说明">

Chinese Analyzer 不接受任何可选参数。

</Admonition>

## 使用示例\{#examples}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### Analyzer 配置\{#analyzer-configuration}

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
analyzer_params = {
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
analyzerParams='{"type": "chinese"}'
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

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Sample text to analyze
sample_text = "Milvus 是一个高性能、可扩展的向量数据库！"

# Run the standard analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("English analyzer output:", result)
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
texts.add("Milvus 是一个高性能、可扩展的向量数据库！");

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

const sampleText = "Milvus 是一个高性能、可扩展的向量数据库！";

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
texts := []string{"Milvus 是一个高性能、可扩展的向量数据库！"}
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
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -d '{
    "analyzerParams": "{\"type\": \"chinese\"}",
    "text": ["Milvus 是一个高性能、可扩展的向量数据库！"]
  }'
```

</TabItem>
</Tabs>

### 预期输出\{#expected_output}

```python
Chinese analyzer output: ['Milvus', '是', '一个', '高性', '性能', '高性能', '可', '扩展', '的', '向量', '数据', '据库', '数据库']
```
