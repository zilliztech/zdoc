---
title: "Stop | Cloud"
slug: /stop-filter
sidebar_label: "Stop"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`stop` フィルターは、トークン化されたテキストから指定したストップワードを削除し、一般的で意味の薄い単語の除去に役立ちます。ストップワードのリストは、`stopwords` パラメーターを使用して設定できます。 | Cloud"
type: origin
token: ScncwBnDBiVoLjksXAwcUgrgnod
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stop

`stop` フィルターは、トークン化されたテキストから指定したストップワードを削除し、一般的で意味の薄い単語の除去に役立ちます。ストップワードのリストは、`stop_words` パラメーターを使用して設定できます。

## 構成\{#configuration}

`stop` フィルターは、ストップワードリストを `stop_words` パラメーターによるインラインで受け取るか、`stop_words_file` パラメーターによる登録済みファイルリソースから受け取ります。

### インラインのストップワードリスト\{#inline-stop-words-list}

インラインリストで `stop` フィルターを使用するには、フィルター構成で `"type": "stop"` を指定し、ストップワードのリストを提供する `stop_words` パラメーターを併せて指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "stop",
        "stop_words": []string{"of", "to", "_english_"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

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
const analyzer_params = {
    tokenizer: "standard",
    filter: [{
        type: "stop",  // Specifies the filter type as stop
        stop_words: ["of", "to", "_english_"],  // Custom stop words + built-in English list
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

`stop` フィルターは、以下の構成可能なパラメーターを受け取ります。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>トークン化から削除する単語のリストです。デフォルトでは、フィルターは組み込みの <code>_english_</code> 辞書を使用します。上書きまたは拡張する方法は3つあります：</p><ul><li><p><strong>組み込み辞書</strong> – これらの言語エイリアスのいずれかを指定すると、定義済みの辞書を使用できます：</p><p><code>&quot;_english_&quot;</code>, <code>&quot;_danish_&quot;</code>, <code>&quot;_dutch_&quot;</code>, <code>&quot;_finnish_&quot;</code>, <code>&quot;_french_&quot;</code>, <code>&quot;_german_&quot;</code>, <code>&quot;_hungarian_&quot;</code>, <code>&quot;_italian_&quot;</code>, <code>&quot;_norwegian_&quot;</code>, <code>&quot;_portuguese_&quot;</code>, <code>&quot;_russian_&quot;</code>, <code>&quot;_spanish_&quot;</code>, <code>&quot;_swedish_&quot;</code></p></li><li><p><strong>カスタムリスト</strong> – 独自の用語の配列を渡します（例：<code>[&quot;foo&quot;, &quot;bar&quot;, &quot;baz&quot;]</code>）。</p></li><li><p><strong>混在リスト</strong> – エイリアスとカスタム用語を組み合わせます（例：<code>[&quot;of&quot;, &quot;to&quot;, &quot;_english_&quot;]</code>）。</p></li></ul><p>各定義済み辞書の正確な内容の詳細については、<a href="https://github.com/milvus-io/milvus/blob/master/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words.rs">stop_words</a> を参照してください。</p></td>
   </tr>
</table>

`stop` フィルターはトークナイザーが生成した用語に対して動作するため、トークナイザーと組み合わせて使用する必要があります。Zilliz Cloud で利用可能なトークナイザーの一覧については、[Standard Tokenizer](./standard-tokenizer) およびその関連ページを参照してください。

`analyzer_params` を定義した後、コレクションスキーマを定義するときにそれを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud は指定したアナライザーを使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを行えます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

アナライザー構成をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を検証します。

### アナライザー構成\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "stop",
        "stop_words": []string{"of", "to", "_english_"},
    }}}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

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
const analyzer_params = {
    tokenizer: "standard",
    filter: [{
        type: "stop",  // Specifies the filter type as stop
        stop_words: ["of", "to", "_english_"],  // Custom stop words + built-in English list
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

### Verification using `run_analyzer`\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Sample text to analyze
sample_text = "The stop filter allows control over common stop words for text processing."

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

texts := []string{"The stop filter allows control over common stop words for text processing."}
option := milvusclient.NewRunAnalyzerOption(texts...).
    WithAnalyzerParams(analyzerParams)

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

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
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <string>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

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

### 期待される出力\{#expected-output}

```plaintext
['The', 'stop', 'filter', 'allows', 'control', 'over', 'common', 'stop', 'words', 'text', 'processing']
```

