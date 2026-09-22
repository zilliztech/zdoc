---
title: "Standard 分词器 | Cloud"
slug: /standard-tokenizer
sidebar_label: "Standard 分词器"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 中的 `standard` 分词器将连续的 Unicode 字母和数字字符组成词项，并在其他字符处切分。 | Cloud"
type: origin
token: Zy1KwpriziqRlqka3Oxc0W4tnhg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Standard 分词器

Zilliz Cloud 中的 `standard` 分词器将连续的 Unicode 字母和数字字符组成词项，并在其他字符处切分。

## 分词规则\{#tokenization-rules}

`standard` 分词器将属于以下字符集合的连续字符保留在同一个词项中：

- <strong>ASCII 字符：</strong>字母 `A-Z`、`a-z` 和数字 `0-9`。

- <strong>非 ASCII 字符：</strong>具有 Unicode `Alphabetic` 属性，或属于数字通用类别 `Nd`、`Nl`、`No` 的字符。

| Unicode 属性或类别 | 含义 | 保留在词项中的字符示例 |
| --- | --- | --- |
| `Alphabetic` | 各种书写系统中的字母（包括汉字和日文假名），以及部分组合标记 | `中文测试`, `カタカナ` |
| `Nd` (`Decimal_Number`) | 十进制数字 | `٣` |
| `Nl` (`Letter_Number`) | 形似字母的数字字符 | `Ⅷ` |
| `No` (`Other_Number`) | 其他数字字符，例如带圈数字、上标数字和分数 | `①²¾` |

不属于上述集合的字符用作分隔符，并在切分时丢弃，包括空白字符、标点符号、下划线（`_`）、连字符（`-`）、撇号（`'`），以及 `+`、`$`、`😀` 等符号。连续的分隔符不会产生空词项。

字符分类遵循 Rust 的 [`char::is_alphanumeric()`](https://doc.rust-lang.org/std/primitive.char.html#method.is_alphanumeric)。属性定义请参阅 [Unicode 标准附录 #44](https://www.unicode.org/reports/tr44/)。Unicode 17.0 的完整字符列表可分别在 [`DerivedCoreProperties.txt`](https://www.unicode.org/Public/17.0.0/ucd/DerivedCoreProperties.txt) 中查看 `Alphabetic` 属性，在 [`DerivedGeneralCategory.txt`](https://www.unicode.org/Public/17.0.0/ucd/extracted/DerivedGeneralCategory.txt) 中查看 `Nd`、`Nl` 和 `No` 类别。具体哪些字符属于这些集合，取决于所部署版本使用的 Unicode 数据。

以下示例使用 `{"tokenizer": "standard"}`，不添加任何过滤器。该分词器保留字母大小写，不会将连续的中文文本切分成单独的词语。

| 输入 | 输出词项 |
| --- | --- |
| `foo_bar-can't😀123` | `["foo", "bar", "can", "t", "123"]` |
| `中文测试` | `["中文测试"]` |
| `version①.¾` | `["version①", "¾"]` |
| `Hello,World!` | `["Hello", "World"]` |

## 配置\{#configuration}

要使用标准分词器配置分析器，请在 `analyzer_params` 中将 `tokenizer` 设置为 `standard`。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"}
};
```

</TabItem>
</Tabs>

标准分词器可以与一个或多个过滤器结合使用。例如，以下代码定义了一个使用 Standard 分词器和 Lowercase 过滤器的分析器：  

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
analyzerParams = map[string]any{"tokenizer": "standard", "filter": []any{"lowercase"}}
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

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"lowercase"}}
};
```

</TabItem>
</Tabs>

<Admonition type="info" title="说明">

更简单的设置，可以直接使用 [Standard Analyzer](./standard-analyzer)。该 Analayzer 使用了 Standard 分词器和 [Lowercase 过滤器](./lowercase-filter)。

</Admonition>

定义 `analyzer_params` 后，您可以在定义 Collection Schema 时将其应用于 VARCHAR 字段。这使得 Zilliz Cloud 能够使用指定的分析器处理该字段中的文本，以实现高效的分词和过滤。更多信息，请参阅[使用示例](./analyzer-overview)。  

## 使用示例\{#examples}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### Analyzer 配置\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard", "filter": []any{"lowercase"}}
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
    {"tokenizer", "standard"},
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
['the', 'milvus', 'vector', 'database', 'is', 'built', 'for', 'scale']
```

