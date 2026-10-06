---
title: "Alphanumonly | BYOC"
slug: /alphanumonly-filter
sidebar_label: "Alphanumonly"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`alphanumonly` 过滤器删除包含非ASCII字符的词项，仅保留字母数字词项。该过滤器在处理仅与基本字母和数字相关的文本时非常有用，排除任何特殊字符或符号。 | BYOC"
type: origin
token: FnxIwZq7wi8N8Kk2GbqcTeHXnsb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Alphanumonly

`alphanumonly` 过滤器删除包含非ASCII字符的词项，仅保留字母数字词项。该过滤器在处理仅与基本字母和数字相关的文本时非常有用，排除任何特殊字符或符号。

## 配置\{#configuration}

`alphanumonly` 过滤器内置于 Zilliz Cloud。要使用它，只需在 `analyzer_params` 的过滤器部分指定其名称。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["alphanumonly"],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;

import java.util.HashMap;

import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

analyzerParams.put("tokenizer", "standard");

analyzerParams.put("filter", Collections.singletonList("alphanumonly"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard", "filter": []any{"alphanumonly"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({

    "tokenizer": "standard",

    "filter": ["alphanumonly"]

});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"alphanumonly"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": ["alphanumonly"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "alphanumonly"
  ]
}'
```

</TabItem>
</Tabs>

`alphanumonly` 过滤器作用于分词器生成的词项，因此必须与分词器结合使用。

定义 `analyzer_params` 后，您可以在定义 Collection Schema 时将其应用于 VARCHAR 字段。这使得 Zilliz Cloud 能够使用指定的分析器处理该字段中的文本，以实现高效的分词和过滤。更多信息，请参阅[使用示例](./analyzer-overview)。  

## 使用示例\{#examples}

在完成 Analyzer 配置后，您可以使用 `run_analyzer` 方法来验证分词效果是否符合预期。

### Analyzer 配置\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["alphanumonly"],
}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;

import java.util.HashMap;

import java.util.Map;

Map<String, Object> analyzerParams = new HashMap<>();

analyzerParams.put("tokenizer", "standard");

analyzerParams.put("filter", Collections.singletonList("alphanumonly"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard", "filter": []any{"alphanumonly"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({

    "tokenizer": "standard",

    "filter": ["alphanumonly"]

});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"alphanumonly"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {

    "tokenizer": "standard",

    "filter": ["alphanumonly"],

};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful

analyzerParams='{

  "tokenizer": "standard",

  "filter": [

    "alphanumonly"

  ]

}'
```

</TabItem>
</Tabs>

### 使用 run_analyzer 验证效果\{#verification-using-run_analyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
sample_text = "Milvus 2.0 @ Scale! #AI #Vector_Databasé"

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

import java.util.List;

ConnectConfig config = ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .token("YOUR_CLUSTER_TOKEN")

        .build();

MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();

texts.add("Milvus 2.0 @ Scale! #AI #Vector_Databasé");

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

texts := []string{"Milvus 2.0 @ Scale! #AI #Vector_Databasé"}

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
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");

let client = ClientV2::new(&config).await?;

let sample_text = "Milvus 2.0 @ Scale! #AI #Vector_Databasé";

let result = client

    .run_analyzer(

        RunAnalyzerRequest::builder()

            .texts(vec![sample_text])

            .analyzer_params(analyzer_params)

            .build()?,

    )

    .await?;

println!("Standard analyzer output: {:?}", result);
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

std::string text = "Milvus 2.0 @ Scale! #AI #Vector_Databasé";
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

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const sampleText = "Milvus 2.0 @ Scale! #AI #Vector_Databasé";

const result = await client.runAnalyzer({

    text: sampleText,

    analyzer_params,

});

console.log("Standard analyzer output:", result);
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

--header "Request-Timeout: 10" \

-d '{

    "text": ["Milvus 2.0 @ Scale! #AI #Vector_Databasé"],

    "analyzerParams": "{\"tokenizer\": \"standard\", \"filter\": [\"alphanumonly\"]}"

}'
```

</TabItem>
</Tabs>

### 预期结果\{#expected-output}

```python
['Milvus', '2', '0', 'Scale', 'AI', 'Vector']
```

