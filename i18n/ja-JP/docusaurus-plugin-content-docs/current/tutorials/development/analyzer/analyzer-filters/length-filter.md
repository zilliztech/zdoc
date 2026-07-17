---
title: "Length | Cloud"
slug: /length-filter
sidebar_label: "Length"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`length` filter は、指定された長さの要件を満たさない token を削除し、テキスト処理中に保持される token の長さを制御できるようにします。 | Cloud"
type: origin
token: MKdvwWBDRi5MMAkkn5PcD1x9nfh
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Length

`length` filter は、指定された長さの要件を満たさない token を削除し、テキスト処理中に保持される token の長さを制御できるようにします。

## 設定\{#configuration}

`length` filter は Zilliz Cloud のカスタム filter で、filter 設定で `"type": "length"` を設定して指定します。`analyzer_params` 内の辞書として設定し、長さの制限を定義できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", # Specifies the filter type as length
        "max": 10, # Sets the maximum token length to 10 characters
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(new HashMap<String, Object>() {{
            put("type", "length");
            put("max", 10);
        }}));
```

</TabItem>

<TabItem value='javascript'>

```javascript
cosnt analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", # Specifies the filter type as length
        "max": 10, # Sets the maximum token length to 10 characters
    }],
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "length",
        "max":  10,
    }}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "length",
      "max": 10
    }
  ]
}'
```

</TabItem>
</Tabs>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "length"}, {"max", 10}}
    }}
};
```

`length` filter は、次の設定可能なパラメーターを受け入れます。

| パラメーター | 説明 |
| --- | --- |
| `max` | token の最大長を設定します。この長さより長い token は削除されます。 |

`length` filter は tokenizer によって生成された term に対して動作するため、tokenizer と組み合わせて使用する必要があります。Zilliz Cloud で利用可能な tokenizer の一覧については、[Standard Tokenizer](./standard-tokenizer) とその関連ページを参照してください。

`analyzer_params` を定義した後、collection schema を定義する際にそれらを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定された analyzer を使用してそのフィールドのテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

analyzer 設定を collection schema に適用する前に、`run_analyzer` メソッドを使用してその動作を確認します。

### Analyzer 設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", # Specifies the filter type as length
        "max": 10, # Sets the maximum token length to 10 characters
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(new HashMap<String, Object>() {{
            put("type", "length");
            put("max", 10);
        }}));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "length",
        "max":  10,
    }}}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "length"}, {"max", 10}}
    }}
};
```

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Sample text to analyze
sample_text = "The length filter allows control over token length requirements for text processing."

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
texts.add("The length filter allows control over token length requirements for text processing.");

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
texts := []string{"The length filter allows control over token length requirements for text processing."}
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

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "The length filter allows control over token length requirements for text processing.";
auto request = milvus::RunAnalyzerRequest()
                       .AddText(text)
                       .WithAnalyzerParams(analyzer_params);

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

### 期待される出力\{#expected-output}

```python
['The', 'length', 'filter', 'allows', 'control', 'over', 'token', 'length', 'for', 'text', 'processing']
```
