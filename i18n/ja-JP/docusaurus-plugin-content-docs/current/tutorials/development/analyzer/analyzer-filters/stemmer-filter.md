---
title: "Stemmer | Cloud"
slug: /stemmer-filter
sidebar_label: "Stemmer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`stemmer` フィルターは、単語をその基本形または語幹形（ステミングとして知られる）に変換し、異なる活用形にまたがる類似した意味の単語を照合しやすくします。`stemmer` フィルターは複数の言語をサポートしており、さまざまな言語コンテキストで効果的な検索とインデックス作成を可能にします。 | Cloud"
type: origin
token: JksSwTwJPidjsnk18Olc2TjWnZe
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stemmer

`stemmer` フィルターは、単語をその基本形または語幹形（ステミングとして知られる）に変換し、異なる活用形にまたがる類似した意味の単語を照合しやすくします。`stemmer` フィルターは複数の言語をサポートしており、さまざまな言語コンテキストで効果的な検索とインデックス作成を可能にします。

## Configuration\{#configuration}

`stemmer` フィルターは Zilliz Cloud のカスタムフィルターです。これを使用するには、フィルター設定で `"type": "stemmer"` を指定し、さらにステミング対象の言語を選択するための `language` パラメーターを指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", # フィルタータイプとして stemmer を指定
        "language": "english", # ステミングの言語を英語に設定
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
                    put("type", "stemmer");
                    put("language", "english");
                }}
        )
);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", // フィルタータイプとして stop を指定
        "language": "english", 
    }],
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":     "stemmer",
        "language": "english",
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
      "type": "stemmer",
      "language": "english"
    }
  ]
}'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {
            {"type", "stemmer"},
            {"language", "english"}
        }
    }}
};
```

</TabItem>
</Tabs>

`stemmer` フィルターは、以下の設定可能なパラメーターを受け付けます。

| Parameter | Description |
| --- | --- |
| `language` | ステミング処理に使用する言語を指定します。サポートされる言語は次のとおりです: `"arabic"`, `"danish"`, `"dutch"`, `"english"`, `"finnish"`, `"french"`, `"german"`, `"greek"`, `"hungarian"`, `"italian"`, `"norwegian"`, `"portuguese"`, `"romanian"`, `"russian"`, `"spanish"`, `"swedish"`, `"tamil"`, `"turkish"` |

`stemmer` フィルターは tokenizer によって生成された terms に対して動作するため、tokenizer と組み合わせて使用する必要があります。

`analyzer_params` を定義した後、collection schema を定義する際にそれらを `VARCHAR` フィールドへ適用できます。これにより Zilliz Cloud は、そのフィールド内のテキストを指定された analyzer を使って処理し、効率的なトークン化とフィルタリングを行えます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## Examples\{#examples}

analyzer 設定を collection schema に適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### Analyzer configuration\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stemmer", # フィルタータイプとして stemmer を指定
        "language": "english", # ステミングの言語を英語に設定
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
                    put("type", "stemmer");
                    put("language", "english");
                }}
        )
);
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
        "type":     "stemmer",
        "language": "english",
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
      "type": "stemmer",
      "language": "english"
    }
  ]
}'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {
            {"type", "stemmer"},
            {"language", "english"}
        }
    }}
};
```

</TabItem>
</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# 分析するサンプルテキスト
sample_text = "running runs looked ran runner"

# 定義した設定で standard analyzer を実行
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
texts.add("running runs looked ran runner");

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
    // エラーを処理
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"running runs looked ran runner"}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParams(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // エラーを処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
not support yet
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "running runs looked ran runner";
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

### Expected output\{#expected-output}

```python
['run', 'run', 'look', 'ran', 'runner']
```

