---
title: "English | BYOC"
slug: /english-analyzer
sidebar_label: "English"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud中的English Analyzer旨在处理英语文本，应用特定语言的规则进行分词和过滤。 | BYOC"
type: origin
token: OokXwlKt9i0gUrkv8YicGJ9Ynad
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - schema
  - 标量字段
  - 分析器
  - analyzer
  - tokenizer
  - filter

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# English

Zilliz Cloud中的English Analyzer旨在处理英语文本，应用特定语言的规则进行分词和过滤。

## 定义\{#definition}

English Analyzer使用以下组件：

- 分词器：使用 Standard 分词器将文本拆分为离散的单词单元。

- 过滤器：包括多个过滤器以进行全面的文本处理： 

    - `lowercase`：将所有标记转换为小写，以支持不区分大小写的搜索。

    - `stemmer`：将单词还原为其根形式，以支持更广泛的匹配（例如，“running”变为“run”）。

    - `stop_words`：删除常见的英语停用词，以集中关注文本中的关键术语。

English Analyzer 的功能等同于以下自定义 Analyzer 配置：

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
analyzerParams = map[string]any{"tokenizer": "standard",
        "filter": []any{"lowercase", map[string]any{
            "type":     "stemmer",
            "language": "english",
        }, map[string]any{
            "type":       "stop",
            "stop_words": "_english_",
        }}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "lowercase",
    {
      "type": "stemmer",
      "language": "english"
    },
    {
      "type": "stop",
      "stop_words": "_english_"
    }
  ]
}'

```

</TabItem>
</Tabs>

## 配置\{#configuration}

要将 English Analyzer 应用于字段，只需在 `analyzer_params` 中将 `type` 设置为 `english`，并根据需要包含可选参数。  

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
analyzerParams = map[string]any{"type": "english"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "english"
}'
```

</TabItem>
</Tabs>

English Analyzer 接受以下可选参数：  

<table>
   <tr>
     <th><p>参数</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>包含停用词列表的数组，这些词将在分词过程中被移除。默认为 <code>_english_</code>，即内置的常见英文停用词集合。</p></td>
   </tr>
</table>

自定义停用词的配置示例：  

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
analyzerParams = map[string]any{"type": "english", "stop_words": []string{"a", "an", "the"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "english",
  "stop_words": [
    "a",
    "an",
    "the"
  ]
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
analyzer_params = {
    "type": "english",
    "stop_words": ["a", "an", "the"]
}
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "english", "stop_words": []string{"a", "an", "the"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "type": "english",
  "stop_words": [
    "a",
    "an",
    "the"
  ]
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
sample_text = "Milvus is a vector database built for scale!"

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
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("Milvus is a vector database built for scale!");

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

const sampleText = "Milvus is a vector database built for scale!"

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
    Address: "localhost:19530",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"Milvus is a vector database built for scale!"}
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

### 预期输出\{#expected-output}

```python
English analyzer output: ['milvus', 'vector', 'databas', 'built', 'scale']
```

