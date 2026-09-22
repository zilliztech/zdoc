---
title: "Whitespace | BYOC"
slug: /whitespace-tokenizer
sidebar_label: "Whitespace"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`whitespace` 分词器在五种 ASCII 空白字符处切分文本：水平制表符、换行符、换页符、回车符和空格。 | BYOC"
type: origin
token: DUzAwFTRNidwUlkgWSicIeDKndb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Whitespace

`whitespace` 分词器在五种 ASCII 空白字符处切分文本：水平制表符、换行符、换页符、回车符和空格。

## 分词规则\{#tokenization-rules}

`whitespace` 分词器仅在以下五种 ASCII 空白字符处切分文本：

| 字符 | 名称 | Unicode 码点 |
| --- | --- | --- |
| `\t` | 水平制表符 | U+0009 |
| `\n` | 换行符 | U+000A |
| `\x0C` 或 `\f` | 换页符 | U+000C |
| `\r` | 回车符 | U+000D |
| `' '` | 空格 | U+0020 |

这些分隔符会在切分时丢弃，连续的分隔符不会产生空词项。标点符号和其他字符会保留在词项中。特别是，垂直制表符（`\x0B`，U+000B）、不换行空格（`\u00A0`）和全角空格（`\u3000`）都不会触发切分。

这一字符集合遵循 Rust 的 [`char::is_ascii_whitespace()`](https://doc.rust-lang.org/std/primitive.char.html#method.is_ascii_whitespace)，不包含其他 Unicode 空白字符。

以下示例使用 `{"tokenizer": "whitespace"}`，不添加任何过滤器。输入和输出采用 Python 字符串表示法：`\t`、`\u00A0` 等转义序列表示实际字符。

| 输入 | 输出词项 |
| --- | --- |
| `"a\tb\nc\x0Cd\re f"` | `["a", "b", "c", "d", "e", "f"]` |
| `"Hello,World! foo_bar"` | `["Hello,World!", "foo_bar"]` |
| `"a\x0Bb"` | `["a\x0Bb"]` |
| `"a\u00A0b"` | `["a\u00A0b"]` |
| `"a\u3000b"` | `["a\u3000b"]` |
| `"\x20a\x20\x20b\x20"` | `["a", "b"]` |

## 配置\{#configuration}

要使用空格分词器配置分析器，请在 `analyzer_params` 中将 `tokenizer` 设置为 `whitespace`。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace"
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "whitespace"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "whitespace"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "whitespace"}
};
```

</TabItem>
</Tabs>

空格分词器可以与一个或多个过滤器结合使用。例如，以下代码定义了一个使用空格分词器和小写过滤器的分析器：  

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"]
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "whitespace", "filter": []any{"lowercase"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "whitespace",
  "filter": [
    "lowercase"
  ]
}'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "whitespace"},
    {"filter", {"lowercase"}}
};
```

</TabItem>
</Tabs>

定义 `analyzer_params` 后，您可以在定义 Collection Schema 时将其应用于 VARCHAR 字段。这使得 Zilliz Cloud 能够使用指定的分析器处理该字段中的文本，以实现高效的分词和过滤。更多信息，请参阅[使用示例](./analyzer-overview)。  

## 使用示例\{#examples}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### Analyzer 配置\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "whitespace",
    "filter": ["lowercase"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "whitespace");
analyzerParams.put("filter", Collections.singletonList("lowercase"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "whitespace", "filter": []any{"lowercase"}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "whitespace"},
    {"filter", {"lowercase"}}
};
```

</TabItem>
</Tabs>

### 使用 run_analyzer 验证效果\{#verification-using-run_analyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
sample_text = "The Milvus vector database is built for scale!"

# Run the whitespace analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Whitespace analyzer output:", result)
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
// javascript
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

texts := []string{"The Milvus vector database is built for scale!"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

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

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "The Milvus vector database is built for scale!";
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
</Tabs>

### 预期输出\{#expected-output}

```sql
['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale!']
```
