---
title: "Stop | Cloud"
slug: /stop-filter
sidebar_label: "Stop"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`stop` filter は、トークン化されたテキストから指定された stop words を削除し、一般的で意味の薄い単語を取り除くのに役立ちます。`stopwords` パラメータを使用して stop words のリストを設定できます。 | Cloud"
type: origin
token: ScncwBnDBiVoLjksXAwcUgrgnod
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stop

`stop` filter は、トークン化されたテキストから指定された stop words を削除し、一般的で意味の薄い単語を取り除くのに役立ちます。`stop_words` パラメータを使用して stop words のリストを設定できます。

## 設定\{#configuration}

`stop` filter は、`stop_words` パラメータを介してインラインで、または `stop_words_file` パラメータを介して登録済みファイルリソースから、stop-words リストを受け取ります。

### インライン stop-words リスト\{#inline-stop-words-list}

インラインリストで `stop` filter を使用するには、filter 設定で `"type": "stop"` を指定し、stop words のリストを提供する `stop_words` パラメータを指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "standard",
    "filter":[{
        "type": "stop", # Specifies the filter type as stop
        "stop_words": ["of", "to", "_english_"], # Defines custom stop words and includes the English stop word list
    }],
};
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

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "standard"},
    {"filter", {
        {{"type", "stop"}, {"stop_words", {"of", "to", "_english_"}}}
    }}
};
```

`stop` filter は、以下の設定可能なパラメータを受け付けます。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>トークン化から削除される単語のリストです。デフォルトでは、filter は組み込みの <code>_english_</code> 辞書を使用します。次の 3 つの方法で上書きまたは拡張できます。</p><ul><li><p><strong>組み込み辞書</strong> – 定義済み辞書を使用するには、次のいずれかの言語エイリアスを指定します。</p><p><code>"_english_"</code>, <code>"_danish_"</code>, <code>"_dutch_"</code>, <code>"_finnish_"</code>, <code>"_french_"</code>, <code>"_german_"</code>, <code>"_hungarian_"</code>, <code>"_italian_"</code>, <code>"_norwegian_"</code>, <code>"_portuguese_"</code>, <code>"_russian_"</code>, <code>"_spanish_"</code>, <code>"_swedish_"</code></p></li><li><p><strong>カスタムリスト</strong> – 独自の用語の配列を渡します。例: <code>["foo", "bar", "baz"]</code>。</p></li><li><p><strong>混合リスト</strong> – エイリアスとカスタム用語を組み合わせます。例: <code>["of", "to", "_english_"]</code>。</p><p>各定義済み辞書の正確な内容の詳細については、<a href="https://github.com/milvus-io/milvus/blob/master/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words.rs">stop_words</a> を参照してください。</p></li></ul></td>
   </tr>
</table>

`stop` filter は tokenizer によって生成された用語に対して動作するため、tokenizer と組み合わせて使用する必要があります。Zilliz Cloud で利用可能な tokenizer のリストについては、[Standard Tokenizer](./standard-tokenizer) とその関連ページを参照してください。

`analyzer_params` を定義したら、collection schema を定義する際にそれらを `VARCHAR` field に適用できます。これにより、Zilliz Cloud は効率的なトークン化とフィルタリングのために、指定された analyzer を使用してその field のテキストを処理できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

## 例\{#examples}

collection schema に analyzer 設定を適用する前に、`run_analyzer` method を使用してその動作を確認します。

### Analyzer 設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
// javascript
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
        {{"type", "stop"}, {"stop_words", {"of", "to", "_english_"}}}
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
texts := []string{"The stop filter allows control over common stop words for text processing."}
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

### 期待される出力\{#expected-output}

```python
['The', 'stop', 'filter', 'allows', 'control', 'over', 'common', 'stop', 'words', 'text', 'processing']
```
