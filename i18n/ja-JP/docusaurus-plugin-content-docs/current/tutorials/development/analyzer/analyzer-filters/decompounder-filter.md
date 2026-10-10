---
title: "Decompounder | Cloud"
slug: /decompounder-filter
sidebar_label: "Decompounder"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`decompounder` フィルターは、指定された辞書に基づいて複合語を個々の構成要素に分割し、複合語の一部を検索しやすくします。このフィルターは、ドイツ語のように複合語を頻繁に使用する言語で特に有用です。 | Cloud"
type: origin
token: DDrHwdsb7idJa9kVU6zc2VwInBf
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decompounder

`decompounder` フィルターは、指定された辞書に基づいて複合語を個々の構成要素に分割し、複合語の一部を検索しやすくします。このフィルターは、ドイツ語のように複合語を頻繁に使用する言語で特に有用です。

## 設定\{#configuration}

`decompounder` フィルターは、`word_list` パラメーターを介してインラインで構成要素辞書を受け取るか、`word_list_file` パラメーターを介して登録済みのファイルリソースから受け取ります。

### インラインの単語リスト\{#inline-word-list}

`decompounder` フィルターは Zilliz Cloud のカスタムフィルターです。これを使用するには、フィルター設定で `"type": "decompounder"` を指定し、認識する単語構成要素の辞書を提供する `word_list` パラメーターをあわせて指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", # Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "decompounder");
                    put("word_list", Arrays.asList("dampf", "schiff", "fahrt", "brot", "backen", "automat"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "decompounder",
        "word_list": []string{"dampf", "schiff", "fahrt", "brot", "backen", "automat"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "decompounder",
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"]
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {
            {"type", "decompounder"},
            {"word_list", {"dampf", "schiff", "fahrt", "brot", "backen", "automat"}}
        }
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", // Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
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
      "type": "decompounder",
      "word_list": [
        "dampf",
        "schiff",
        "fahrt",
        "brot",
        "backen",
        "automat"
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

`decompounder` フィルターは、以下の設定可能なパラメーターを受け入れます。

| パラメーター | 説明 |
| --- | --- |
| `word_list` | 複合語を分割するために使用される単語構成要素のリストです。この辞書によって、複合語をどのように個別の語に分解するかが決まります。 |

`decompounder` フィルターは tokenizer によって生成された terms に対して動作するため、tokenizer と組み合わせて使用する必要があります。Zilliz Cloud で利用可能な tokenizer の一覧については、[Standard Tokenizer](./standard-tokenizer) とその関連ページを参照してください。

`analyzer_params` を定義した後、コレクションスキーマを定義する際にそれらを `VARCHAR` フィールドへ適用できます。これにより、Zilliz Cloud はそのフィールド内のテキストを、指定したアナライザーを使用して効率的にトークン化およびフィルタリングできます。詳細については、[Example use](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", # Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(
                new HashMap<String, Object>() {{
                    put("type", "decompounder");
                    put("word_list", Arrays.asList("dampf", "schiff", "fahrt", "brot", "backen", "automat"));
                }}
        )
);
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "decompounder",
        "word_list": []string{"dampf", "schiff", "fahrt", "brot", "backen", "automat"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": [{
        "type": "decompounder",
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"]
    }]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {
            {"type", "decompounder"},
            {"word_list", {"dampf", "schiff", "fahrt", "brot", "backen", "automat"}}
        }
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "decompounder", // Specifies the filter type as decompounder
        "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"],
    }],
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
      "type": "decompounder",
      "word_list": [
        "dampf",
        "schiff",
        "fahrt",
        "brot",
        "backen",
        "automat"
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Sample text to analyze
sample_text = "dampfschifffahrt brotbackautomat"

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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("dampfschifffahrt brotbackautomat");

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

    "github.com/milvus-io/milvus/client/v3/milvusclient"
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
texts := []string{"dampfschifffahrt brotbackautomat"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParamsStr(string(bs))

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
use milvus::v2::error::Result;
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let analyzer_params = json!({
        "tokenizer": "standard",
        "filter": [{
            "type": "decompounder",
            "word_list": ["dampf", "schiff", "fahrt", "brot", "backen", "automat"]
        }]
    });

    let result = client.run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(["dampfschifffahrt brotbackautomat".to_string()])
            .analyzer_params(analyzer_params)
            .build()?,
    ).await?;
    println!("{:?}", result.results());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "dampfschifffahrt brotbackautomat";
auto request = milvus::RunAnalyzerRequest()
                       .AddText(text)
                       .WithAnalyzerParams(analyzer_params);

milvus::RunAnalyzerResponse response;
status = client->RunAnalyzer(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& result : response.Results()) {
    for (const auto& token : result.Tokens()) {
        std::cout << token.token_ << " ";
    }
    std::cout << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

const res = await client.runAnalyzer({
  text: 'dampfschifffahrt brotbackautomat',
  analyzer_params: analyzer_params
});

console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "analyzerParams": "{\"tokenizer\":\"standard\",\"filter\":[{\"type\":\"decompounder\",\"word_list\":[\"dampf\",\"schiff\",\"fahrt\",\"brot\",\"backen\",\"automat\"]}]}",
    "text": ["dampfschifffahrt brotbackautomat"]
  }'
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['dampf', 'schiff', 'fahrt', 'brotbackautomat']
```

