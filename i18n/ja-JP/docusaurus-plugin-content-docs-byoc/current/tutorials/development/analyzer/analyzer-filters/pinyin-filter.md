---
title: "Pinyin | BYOC"
slug: /pinyin-filter
sidebar_label: "pinyin"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "中国語テキスト検索では、多くの場合、ユーザーはインデックス化されたテキストに現れるとおりに中国語の漢字を正確に入力する必要があります。名前検索、オートコンプリート、入力しながら検索するワークフローでは、ユーザーは中国語の漢字の代わりに Pinyin を入力することがよくあります。たとえば、ユーザーは `足球` を検索するために `zuqiu` と入力する場合があります。`pinyin` フィルターはアナライザーの出力に Pinyin トークンを追加するため、別の Pinyin フィールドを維持しなくても、中国語テキストを Pinyin 入力に一致させることができます。 | BYOC"
type: origin
token: EhXXwmJzBi8pg9kJcC4ccm9OnDe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pinyin

中国語テキスト検索では、多くの場合、ユーザーはインデックス化されたテキストに現れるとおりに中国語の漢字を正確に入力する必要があります。名前検索、オートコンプリート、入力しながら検索するワークフローでは、ユーザーは中国語の漢字の代わりに Pinyin を入力することがよくあります。たとえば、ユーザーは `足球` を検索するために `zuqiu` と入力する場合があります。`pinyin` フィルターはアナライザーの出力に Pinyin トークンを追加するため、別の Pinyin フィールドを維持しなくても、中国語テキストを Pinyin 入力に一致させることができます。

`pinyin` フィルターは通常、中国語テキストに対して [Jieba](./jieba-tokenizer) トークナイザーとともに使用します。これはカスタムアナライザーフィルターパイプラインで動作し、同じ中国語トークンに対して複数の Pinyin トークン形式を出力できます。

## 設定\{#configuration}

デフォルトのオプションを使用するには、`analyzer_params` の `filter` セクションで `"pinyin"` を指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-next-line
    "filter": ["pinyin"],
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("pinyin"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter":    []string{"pinyin"},
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": ["pinyin"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"pinyin"}}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    tokenizer: "jieba",
    filter: ["pinyin"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba",
  "filter": ["pinyin"]
}'
```

</TabItem>
</Tabs>

この省略記法では、元の中国語トークンを保持し、文字単位の Pinyin トークンを出力します。joined Pinyin や Pinyin の頭文字は、それらのオプションを明示的に有効にしない限り出力されません。

完全に制御するには、フィルターをオブジェクトとして指定し、Zilliz Cloud が出力する Pinyin トークン形式を設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    # highlight-start
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": True,
            "keep_joined_full_pinyin": False,
            "keep_separate_first_letter": False,
        }
    ],
    # highlight-end
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
Map<String, Object> pinyinFilter = new HashMap<>();
pinyinFilter.put("type", "pinyin");
pinyinFilter.put("keep_original", true);
pinyinFilter.put("keep_full_pinyin", true);
pinyinFilter.put("keep_joined_full_pinyin", false);
pinyinFilter.put("keep_separate_first_letter", false);
analyzerParams.put("filter", Collections.singletonList(pinyinFilter));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter": []map[string]any{
        {
            "type":                       "pinyin",
            "keep_original":              true,
            "keep_full_pinyin":           true,
            "keep_joined_full_pinyin":    false,
            "keep_separate_first_letter": false,
        },
    },
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": true,
            "keep_full_pinyin": true,
            "keep_joined_full_pinyin": false,
            "keep_separate_first_letter": false
        }
    ]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {
        {
            {"type", "pinyin"},
            {"keep_original", true},
            {"keep_full_pinyin", true},
            {"keep_joined_full_pinyin", false},
            {"keep_separate_first_letter", false}
        }
    }}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    tokenizer: "jieba",
    filter: [
        {
            type: "pinyin",
            keep_original: true,
            keep_full_pinyin: true,
            keep_joined_full_pinyin: false,
            keep_separate_first_letter: false,
        },
    ],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba",
  "filter": [
    {
      "type": "pinyin",
      "keep_original": true,
      "keep_full_pinyin": true,
      "keep_joined_full_pinyin": false,
      "keep_separate_first_letter": false
    }
  ]
}'
```

</TabItem>
</Tabs>

このフィルターは以下のパラメーターを受け付けます。

| **パラメーター** | **タイプ** | **デフォルト** | **説明** |
| --- | --- | --- | --- |
| `keep_original` | Boolean | `true` | アナライザーの出力に元の中国語トークンを保持します。 |
| `keep_full_pinyin` | Boolean | `true` | 文字単位の Pinyin トークンを出力します。たとえば、`中文` から `zhong` と `wen` が生成されます。 |
| `keep_joined_full_pinyin` | Boolean | `false` | ソーストークンごとに結合された Pinyin トークンを出力します。たとえば、`中文` から `zhongwen` が生成されます。 |
| `keep_separate_first_letter` | Boolean | `false` | ソーストークンごとに Pinyin の頭文字トークンを出力します。たとえば、`中文` から `zw` が生成されます。 |

このフィルターはトークナイザーによって生成されたトークンに対して動作します。中国語テキストでは、`jieba` などのトークナイザーとともに使用してください。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` でその動作を確認してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "中文测试"
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import java.util.*;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("中文测试");
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
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

texts := []string{"中文测试"}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let sample_text = "中文测试";
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string sample_text = "中文测试";
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN",
});

const sample_text = "中文测试";
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# The run_analyzer request is sent directly to the endpoint below.
```

</TabItem>
</Tabs>

### 文字単位の Pinyin で中国語テキストを一致させる\{#match-chinese-text-with-character-level-pinyin}

デフォルトの `pinyin` フィルターは、元の中国語トークンを保持し、文字単位の Pinyin トークンを出力します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["pinyin"],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Collections.singletonList("pinyin"));

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter":    []string{"pinyin"},
}

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
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": ["pinyin"]
});

let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec![sample_text])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {"pinyin"}}
};

auto request = milvus::RunAnalyzerRequest()
                       .AddText(sample_text)
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
const analyzer_params = {
    tokenizer: "jieba",
    filter: ["pinyin"],
};

const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
        "text": ["中文测试"],
        "analyzerParams": "{\"tokenizer\": \"jieba\", \"filter\": [\"pinyin\"]}"
     }'
```

</TabItem>
</Tabs>

期待される出力:

```plaintext
['中文', 'zhong', 'wen', '测试', 'ce', 'shi']
```

### 結合された Pinyin で中国語の用語を一致させる\{#match-chinese-terms-with-joined-pinyin}

中国語の用語を完全に結合された Pinyin 形式に一致させる必要がある場合は、`keep_joined_full_pinyin` を有効にします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": False,
            "keep_joined_full_pinyin": True,
            "keep_separate_first_letter": False,
        }
    ],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
Map<String, Object> pinyinFilter = new HashMap<>();
pinyinFilter.put("type", "pinyin");
pinyinFilter.put("keep_original", true);
pinyinFilter.put("keep_full_pinyin", false);
pinyinFilter.put("keep_joined_full_pinyin", true);
pinyinFilter.put("keep_separate_first_letter", false);
analyzerParams.put("filter", Collections.singletonList(pinyinFilter));

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter": []map[string]any{
        {
            "type":                       "pinyin",
            "keep_original":              true,
            "keep_full_pinyin":           false,
            "keep_joined_full_pinyin":    true,
            "keep_separate_first_letter": false,
        },
    },
}

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
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": true,
            "keep_full_pinyin": false,
            "keep_joined_full_pinyin": true,
            "keep_separate_first_letter": false
        }
    ]
});

let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec![sample_text])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {
        {
            {"type", "pinyin"},
            {"keep_original", true},
            {"keep_full_pinyin", false},
            {"keep_joined_full_pinyin", true},
            {"keep_separate_first_letter", false}
        }
    }}
};

auto request = milvus::RunAnalyzerRequest()
                       .AddText(sample_text)
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
const analyzer_params = {
    tokenizer: "jieba",
    filter: [
        {
            type: "pinyin",
            keep_original: true,
            keep_full_pinyin: false,
            keep_joined_full_pinyin: true,
            keep_separate_first_letter: false,
        },
    ],
};

const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
        "text": ["中文测试"],
        "analyzerParams": "{\"tokenizer\": \"jieba\", \"filter\": [{\"type\": \"pinyin\", \"keep_original\": true, \"keep_full_pinyin\": false, \"keep_joined_full_pinyin\": true, \"keep_separate_first_letter\": false}]}"
     }'
```

</TabItem>
</Tabs>

期待される出力:

```plaintext
['中文', 'zhongwen', '测试', 'ceshi']
```

### Pinyin の頭文字で中国語の用語を一致させる\{#match-chinese-terms-with-pinyin-initials}

中国語の用語をその Pinyin 形式の頭文字に一致させる必要がある場合は、`keep_separate_first_letter` を有効にします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": True,
            "keep_full_pinyin": False,
            "keep_joined_full_pinyin": False,
            "keep_separate_first_letter": True,
        }
    ],
}

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.RunAnalyzerReq;
import io.milvus.v2.service.vector.response.RunAnalyzerResp;

Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
Map<String, Object> pinyinFilter = new HashMap<>();
pinyinFilter.put("type", "pinyin");
pinyinFilter.put("keep_original", true);
pinyinFilter.put("keep_full_pinyin", false);
pinyinFilter.put("keep_joined_full_pinyin", false);
pinyinFilter.put("keep_separate_first_letter", true);
analyzerParams.put("filter", Collections.singletonList(pinyinFilter));

RunAnalyzerResp resp = client.runAnalyzer(RunAnalyzerReq.builder()
        .texts(texts)
        .analyzerParams(analyzerParams)
        .build());
List<RunAnalyzerResp.AnalyzerResult> results = resp.getResults();
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{
    "tokenizer": "jieba",
    "filter": []map[string]any{
        {
            "type":                       "pinyin",
            "keep_original":              true,
            "keep_full_pinyin":           false,
            "keep_joined_full_pinyin":    false,
            "keep_separate_first_letter": true,
        },
    },
}

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
use serde_json::json;

let analyzer_params = json!({
    "tokenizer": "jieba",
    "filter": [
        {
            "type": "pinyin",
            "keep_original": true,
            "keep_full_pinyin": false,
            "keep_joined_full_pinyin": false,
            "keep_separate_first_letter": true
        }
    ]
});

let result = client
    .run_analyzer(
        RunAnalyzerRequest::builder()
            .texts(vec![sample_text])
            .analyzer_params(analyzer_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"filter", {
        {
            {"type", "pinyin"},
            {"keep_original", true},
            {"keep_full_pinyin", false},
            {"keep_joined_full_pinyin", false},
            {"keep_separate_first_letter", true}
        }
    }}
};

auto request = milvus::RunAnalyzerRequest()
                       .AddText(sample_text)
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
const analyzer_params = {
    tokenizer: "jieba",
    filter: [
        {
            type: "pinyin",
            keep_original: true,
            keep_full_pinyin: false,
            keep_joined_full_pinyin: false,
            keep_separate_first_letter: true,
        },
    ],
};

const result = await client.runAnalyzer({
    text: sample_text,
    analyzer_params,
});
console.log(result.results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
     --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/common/run_analyzer" \
     --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
     --header "Content-Type: application/json" \
     -d '{
        "text": ["中文测试"],
        "analyzerParams": "{\"tokenizer\": \"jieba\", \"filter\": [{\"type\": \"pinyin\", \"keep_original\": true, \"keep_full_pinyin\": false, \"keep_joined_full_pinyin\": false, \"keep_separate_first_letter\": true}]}"
     }'
```

</TabItem>
</Tabs>

期待される出力:

```plaintext
['中文', 'zw', '测试', 'cs']
```
