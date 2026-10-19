---
title: "アラビア語正規化 | BYOC"
slug: /arabic-normalization
sidebar_label: "アラビア語正規化"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`arabicnormalization` フィルターは、アラビア語テキスト用の組み込みトークンフィルターです。アラビア語固有の文字バリアントを正規化し、テキスト分析時に同等のアラビア語用語が異なって表示される原因となる省略可能な記号を削除します。 | BYOC"
type: origin
token: HNE5w9HfNidqWukjovgcrVT0n8e
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# アラビア語正規化

`arabic_normalization` フィルターは、アラビア語テキスト用の組み込みトークンフィルターです。アラビア語固有の文字バリアントを正規化し、テキスト分析時に同等のアラビア語用語が異なって表示される原因となる省略可能な記号を削除します。

## 設定\{#configuration}

<Admonition type="info" title="Notes">

アラビア語テキストには、ほとんどの場合、組み込みの [アラビア語アナライザー](./arabic-analyzer) を使用します。組み込みアナライザーには、このフィルターと、標準のトークン化、小文字化、10 進数字の正規化、アラビア語のステミング、アラビア語のストップワード削除が含まれています。カスタムアナライザーパイプラインを構築する必要がある場合にのみ、`arabic_normalization` を直接使用します。

</Admonition>

カスタムアナライザーで `arabic_normalization` フィルターを使用するには、`analyzer_params` の `filter` セクションに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["arabic_normalization"],
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
analyzerParams.put("filter", Collections.singletonList("arabic_normalization"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]any{"tokenizer": "standard", "filter": []any{"arabic_normalization"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": ["arabic_normalization"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"arabic_normalization"}},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": ["arabic_normalization"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "arabic_normalization"
  ]
}'
```

</TabItem>
</Tabs>

`arabic_normalization` フィルターには、設定可能なパラメーターはありません。

このフィルターは、以下の変換を適用します。

| **変換** | **変換前** | **変換後** |
| --- | --- | --- |
| ハムザ + アリフのバリアント | `آ`, `أ`, `إ` | `ا` |
| テー・マルブータ | `ة` | `ه` |
| アリフ・マクスーラ | `ى` | `ي` |
| ハラカート | `U+064B` から `U+065F` | 削除 |
| タトウィール / カシーダ | `ـ` | 削除 |

このフィルターは、トークナイザーによって生成されたトークンを処理します。上記の設定は意図的にカスタムアナライザーの例としたものであり、アラビア語処理の完全なパイプラインを含んでいません。

## 例\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### アナライザー設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": ["arabic_normalization"],
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
analyzerParams.put("filter", Collections.singletonList("arabic_normalization"));
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "standard", "filter": []any{"arabic_normalization"}}
```

</TabItem>

<TabItem value='rust'>

```rust
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": ["arabic_normalization"]
});
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {"arabic_normalization"}},
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter": ["arabic_normalization"],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "standard",
  "filter": [
    "arabic_normalization"
  ]
}'
```

</TabItem>
</Tabs>

### `run_analyzer` を使用した検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

sample_text = "آدم أحمد إسلام مدرسة كبرى كِتَابٌ عـــربي"

result = client.run_analyzer(sample_text, analyzer_params)
print(result)
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
texts.add("آدم أحمد إسلام مدرسة كبرى كِتَابٌ عـــربي");

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

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"آدم أحمد إسلام مدرسة كبرى كِتَابٌ عـــربي"}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParamsStr(string(bs))

result, err := client.RunAnalyzer(ctx, option)
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

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let texts = ["آدم أحمد إسلام مدرسة كبرى كِتَابٌ عـــربي".to_string()];
let analyzer_params = serde_json::json!({
    "tokenizer": "standard",
    "filter": ["arabic_normalization"]
});

let result = client.run_analyzer(
    RunAnalyzerRequest::builder()
        .texts(texts)
        .analyzer_params(analyzer_params)
        .build()?,
).await?;

println!("{:?}", result.results());
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "آدم أحمد إسلام مدرسة كبرى كِتَابٌ عـــربي";
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

const res = await client.runAnalyzer({
    text: 'آدم أحمد إسلام مدرسة كبرى كِتَابٌ عـــربي',
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
    "text": ["آدم أحمد إسلام مدرسة كبرى كِتَابٌ عـــربي"],
    "analyzerParams": "{\"tokenizer\":\"standard\",\"filter\":[\"arabic_normalization\"]}"
  }'
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```plaintext
['ادم', 'احمد', 'اسلام', 'مدرسه', 'كبري', 'كتاب', 'عربي']
```
