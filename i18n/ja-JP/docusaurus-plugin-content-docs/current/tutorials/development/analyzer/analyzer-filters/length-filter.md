---
title: "Length | Cloud"
slug: /length-filter
sidebar_label: "Length"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`length` フィルターは、指定された長さの要件を満たさないトークンを削除し、テキスト処理中に保持されるトークンの長さを制御できるようにします。 | Cloud"
type: origin
token: MKdvwWBDRi5MMAkkn5PcD1x9nfh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Length

`length` フィルターは、指定された長さの要件を満たさないトークンを削除し、テキスト処理中に保持されるトークンの長さを制御できるようにします。

## 設定\{#configuration}

`length` フィルターは Zilliz Cloud のカスタムフィルターで、フィルター設定で `"type": "length"` を設定して指定します。`analyzer_params` 内で辞書として設定し、長さの制限を定義できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import "fmt"

analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "length",
        "max":  10,
    }}}

fmt.Println(analyzerParams)
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [
        {
            "type": "length",
            "max": 10
        }
    ]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "length"}, {"max", 10}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", // Specifies the filter type as length
        "max": 10, // Sets the maximum token length to 10 characters
    }],
};
```

</TabItem>

<TabItem value='bash'>

```bash
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

`length` フィルターは、以下の設定可能なパラメーターを受け付けます。

| パラメーター | 説明 |
| --- | --- |
| `max` | トークンの最大長を設定します。この長さを超えるトークンは削除されます。 |

`length` フィルターはトークナイザーが生成した語に対して動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloud で利用可能なトークナイザーの一覧については、[Standard Tokenizer](./standard-tokenizer) およびその関連ページを参照してください。

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` フィールドへ適用できます。これにより、Zilliz Cloud は指定されたアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length",
        "max": 10,
    }],
}

# Sample text to analyze
sample_text = "The length filter allows control over token length requirements for text processing."

# Run the standard analyzer with the defined configuration
result = client.run_analyzer(sample_text, analyzer_params)
print("Standard analyzer output:", result)
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

<TabItem value='go'>

```go
import "fmt"

analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "length",
        "max":  10,
    }}}

fmt.Println(analyzerParams)
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "standard",
    "filter": [
        {
            "type": "length",
            "max": 10
        }
    ]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "length"}, {"max", 10}}
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length", // Specifies the filter type as length
        "max": 10, // Sets the maximum token length to 10 characters
    }],
};
```

</TabItem>

<TabItem value='bash'>

```bash
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

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import java.util.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "standard");
analyzerParams.put("filter",
        Collections.singletonList(new HashMap<String, Object>() {{
            put("type", "length");
            put("max", 10);
        }}));

List<String> texts = new ArrayList<>();
texts.add("The length filter allows control over token length requirements for text processing.");

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
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

analyzerParams := map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type": "length",
        "max":  10,
    }}}

texts := []string{"The length filter allows control over token length requirements for text processing."}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

_, err = client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");
    let client = ClientV2::new(&config).await?;

    let analyzer_params = json!({
        "tokenizer": "standard",
        "filter": [
            {
                "type": "length",
                "max": 10
            }
        ]
    });

    let run_analyzer_req = RunAnalyzerRequest::builder()
        .texts(vec!["The length filter allows control over token length requirements for text processing."])
        .analyzer_params(analyzer_params)
        .build()?;

    let res = client.run_analyzer(run_analyzer_req).await?;
    println!("{:?}", res.results());
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

nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "length"}, {"max", 10}}
    }}
};

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

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
});

const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "length",
        "max": 10,
    }],
};

const sample_text = "The length filter allows control over token length requirements for text processing.";

const result = await client.runAnalyzer({
    analyzer_params: analyzer_params,
    text: sample_text,
});
console.log("Analyzer output:", result);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/common/run_analyzer" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "analyzerParams": "{\"tokenizer\":\"standard\",\"filter\":[{\"type\":\"length\",\"max\":10}]}",
    "text": ["The length filter allows control over token length requirements for text processing."]
}' 
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['The', 'length', 'filter', 'allows', 'control', 'over', 'token', 'length', 'for', 'text', 'processing']
```

