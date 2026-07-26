---
title: "Lindera | BYOC"
slug: /lindera-tokenizer
sidebar_label: "Lindera"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`lindera` 分词器用于根据指定的字典对文本进行词形学分析。该分词器对于诸如中文、日语和韩语等语言来说是个不错的选择。这些语言的共同点是不使用空格定义单词的边界。 | BYOC"
type: origin
token: IWMVwdnisijLNGkLUlAcCZCmnWc
sidebar_position: 4
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
  - lindera

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lindera

`lindera` 分词器用于根据指定的字典对文本进行词形学分析。该分词器对于诸如中文、日语和韩语等语言来说是个不错的选择。这些语言的共同点是不使用空格定义单词的边界。

<Admonition type="info" icon="📘" title="说明">

<p><code>lindera</code> 分词器在输出的分词结果中会将标点符号作为独立的词元予以保留。例如：<code>"こんにちは！"</code> 的分词结果为 <code>["こんにちは", "！"]</code>。如果需要在分词结果中去除标点符号词元，需要使用 <code>removepunct</code> 过滤器。</p>

</Admonition>

## 配置\{#configuration}

在配置 Analyzer 使用 Lindera 分词器时，需要将 `tokenizer.type` 设置为 `lindera`，并将 `dict_kind` 设置为需要使用的字典。

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
     <th><p>参数名称</p></th>
     <th><p>参数描述</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>分词器类型，在使用 Lindera 分词器时，该值为 <code>lindera</code>。</p></td>
   </tr>
   <tr>
     <td><p><code>dict_kind</code></p></td>
     <td><p>作为参考词表的字典。取值范围如下：</p><ul><li><p><code>ko-dic</code>：韩语 - 韩语词形学字典 (<a href="https://bitbucket.org/eunjeon/mecab-ko-dic">MeCab Ko-dic</a>)</p></li><li><p><code>ipadic</code>：日语 - 标准词形学字典 (<a href="https://taku910.github.io/mecab/">MeCab IPADIC</a>)</p></li></ul></td>
   </tr>
</table>

在定义了 `analyzer_params` 后，您可以在定义 Collection Schema 时将其应用到 VARCHAR 类型的字段上。Zilliz Cloud 将会根据 Analyzer 的设置对该字段的内容进行分词和过滤。更多详情，可参考[使用示例](./analyzer-overview#example-use)。

## 使用示例\{#examples}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### Analyzer 配置\{#analyzer-configuration}

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

### 使用 run_analyzer 验证效果\{#verification-using-run_analyzer}

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
    Address: "localhost:19530",
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

### 预期结果\{#expected-output}

```plaintext
{tokens: ['東京', 'スカイ', 'ツリー', 'の', '最寄り駅', 'は', 'とう', 'きょう', 'スカイ', 'ツリー', '駅', 'で']} 
```
