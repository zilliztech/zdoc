---
title: "Stop | BYOC"
slug: /stop-filter
sidebar_label: "Stop"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`stop` 过滤器删除分词文本中的指定停用词，帮助消除常见且意义不大的词。您可以使用 `stopwords` 参数配置停用词列表。 | BYOC"
type: origin
token: PcaswIdMjiPOrAkyA0uc5aXOn0b
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stop

`stop` 过滤器删除分词文本中的指定停用词，帮助消除常见且意义不大的词。您可以使用 `stop_words` 参数配置停用词列表。

## 配置\{#configuration}

`stop` 过滤器是 Zilliz Cloud 中的自定义过滤器，通过在过滤器配置中设置 `"type": "stop"` 来指定。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stop", # Specifies the filter type as stop
        "stop_words": ["of", "to", "_english_"], # Defines custom stop words and includes the English stop word list
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Arrays.asList("of", "to", "_english_"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "stop",
        "stop_words": []string{"of", "to", "_english_"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "stop",
        "stop_words": ["of", "to", "_english_"]
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "stop"}, {"stop_words", {"of", "to", "_english_"}}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
let analyzer_params = {
    tokenizer: "standard",
    filter: [{
        type: "stop",  // Specifies the filter type as stop
        stop_words: ["of", "to", "_english_"],  // Custom stop words + built-in English list
    }],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "standard",
    ["filter"] = new List<object>
    {
        new Dictionary<string, object>
        {
            ["type"] = "stop", // Specifies the filter type as stop
            ["stop_words"] = new List<object> { "of", "to", "_english_" } // Defines custom stop words and includes the English stop word list
        }
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "stop",
      "stop_words": [
        "of",
        "to",
        "_english_"
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

`stop` 过滤器接受以下可选参数。

| 参数 | 描述 |
| --- | --- |
| `stop_words` | 要从分词中移除的单词列表。默认情况下，使用预定义的 `_english_` 列表，其中包含常见的英语停用词。有关 `_english_` 的详细信息，请查看[这里](https://github.com/milvus-io/milvus/blob/master/internal/core/thirdparty/tantivy/tantivy-binding/src/stop_words.rs)。 |

`stop` 过滤器作用于分词器生成的词项，因此必须与分词器结合使用。有关 Zilliz Cloud 中可用的分词器列表，请参阅[Analyzer 概述](./analyzer-overview)。

定义 `analyzer_params` 后，您可以在定义 Collection Schema 时将其应用于 VARCHAR 字段。这使得 Zilliz Cloud 能够使用指定的分析器处理该字段中的文本，以实现高效的分词和过滤。更多信息，请参阅[使用示例](./analyzer-overview)。  

## 使用示例\{#examples}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### Analyzer 配置\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stop", # Specifies the filter type as stop
        "stop_words": ["of", "to", "_english_"], # Defines custom stop words and includes the English stop word list
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "stop");
                    put("stop_words", Arrays.asList("of", "to", "_english_"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "stop",
        "stop_words": []string{"of", "to", "_english_"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "stop",
        "stop_words": ["of", "to", "_english_"]
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "stop"}, {"stop_words", {"of", "to", "_english_"}}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
analyzer_params = {
    tokenizer: "standard",
    filter: [{
        type: "stop",  // Specifies the filter type as stop
        stop_words: ["of", "to", "_english_"],  // Custom stop words + built-in English list
    }],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
Dictionary<string, object> analyzerParams = new()
{
    ["tokenizer"] = "standard",
    ["filter"] = new List<object>
    {
        new Dictionary<string, object>
        {
            ["type"] = "stop", // Specifies the filter type as stop
            ["stop_words"] = new List<object> { "of", "to", "_english_" } // Defines custom stop words and includes the English stop word list
        }
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "stop",
      "stop_words": [
        "of",
        "to",
        "_english_"
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

### 使用 run_analyzer 验证效果\{#verification-using-run_analyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sample text to analyze
sample_text = "The stop filter allows control over common stop words for text processing."

# Run the standard analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
List<String> texts = new ArrayList<>();
texts.add("The stop filter allows control over common stop words for text processing.");

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
texts := []string{"The stop filter allows control over common stop words for text processing."}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(result)
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "stop",
        "stop_words": ["of", "to", "_english_"]
    }]
});
let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec!["The stop filter allows control over common stop words for text processing."])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::string text = "The stop filter allows control over common stop words for text processing.";
auto request = milvus::RunAnalyzerRequest()
                       .AddText(text)
                       .WithAnalyzerParams(analyzer_params);

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const sample_text = "The stop filter allows control over common stop words for text processing.";

// Run the standard analyzer with the defined configuration
const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params,
});
console.log("Standard analyzer output:", result);
```

</TabItem>

<TabItem value='csharp'>

```csharp
// Sample text to analyze
string sampleText = "The stop filter allows control over common stop words for text processing.";

// Run the standard analyzer with the defined configuration
RunAnalyzerResp result = await client.RunAnalyzerAsync(new RunAnalyzerReq
{
    AnalyzerParams = analyzerParams,
    Texts = [sampleText]
});

foreach (AnalyzerToken t in result.Results.SelectMany(r => r.Tokens))
{
    Console.WriteLine(t.Token);
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
        "text": ["The stop filter allows control over common stop words for text processing."],
        "analyzerParams": "{\"tokenizer\": \"standard\", \"filter\": [{\"type\": \"stop\", \"stop_words\": [\"of\", \"to\", \"_english_\"]}]}"
     }'
```

</TabItem>
</Tabs>

### 预期结果\{#expected-output}

```plaintext
['The', 'stop', 'filter', 'allows', 'control', 'over', 'common', 'stop', 'words', 'text', 'processing']
```

