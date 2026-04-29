---
title: "Stop | Cloud"
slug: /stop-filter
sidebar_key: stop-filter
sidebar_label: "Stop"
beta: FALSE
notebook: FALSE
description: "`stop` フィルターは、トークン化されたテキストから指定されたストップワードを削除し、一般的で意味の薄い単語を取り除くのに役立ちます。`stopwords` パラメーターを使用してストップワードのリストを設定できます。 | Cloud"
type: origin
token: ScncwBnDBiVoLjksXAwcUgrgnod
sidebar_position: 7
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - analyzer
  - built-in filters
  - stop

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Stop

`stop` フィルターは、トークン化されたテキストから指定されたストップワードを削除し、一般的で意味の少ない単語を除去するのに役立ちます。ストップワードのリストは、`stop_words` パラメーターを使用して設定できます。

## 設定\{#configuration}

`stop` フィルターは、ストップワードリストを `stop_words` パラメーターを通じてインラインで指定するか、`stop_words_file` パラメーターを通じて登録済みファイルリソースから読み込むことができます。

### Inline stop-words list\{#inline-stop-words-list}

インラインリストを使用して `stop` フィルターを利用するには、フィルター設定で `"type": "stop"` を指定し、ストップワードのリストを提供する `stop_words` パラメーターを設定します。

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

<TabItem value='java'>

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

<TabItem value='java'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "stop",
        "stop_words": []string{"of", "to", "_english_"},
    }}}
```

</TabItem>

<TabItem value='java'>

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

`stop` フィルターは、以下の設定可能なパラメーターを受け入れます。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>stop_words</code></p></td>
     <td><p>トークン化から除外する単語のリストです。デフォルトでは、フィルターは組み込みの <code>_english_</code> 辞書を使用します。これを以下の 3 つの方法でオーバーライドまたは拡張できます：</p><ul><li><p><strong>組み込み辞書</strong> – 事前定義された辞書を使用するために、これらの言語エイリアスのいずれかを指定します：</p><p><code>"_english_"</code>, <code>"_danish_"</code>, <code>"_dutch_"</code>, <code>"_finnish_"</code>, <code>"_french_"</code>, <code>"_german_"</code>, <code>"_hungarian_"</code>, <code>"_italian_"</code>, <code>"_norwegian_"</code>, <code>"_portuguese_"</code>, <code>"_russian_"</code>, <code>"_spanish_"</code>, <code>"_swedish_"</code></p></li><li><p><strong>カスタムリスト</strong> – 独自の用語の配列を渡します（例：<code>["foo", "bar", "baz"]</code>）。</p></li><li><p><strong>混合リスト</strong> – エイリアスとカスタム用語を組み合わせて使用します（例：<code>["of", "to", "_english_"]</code>）。</p><p>各事前定義辞書の正確な内容については、<a href="https://github.com/milvus-io/milvus/blob/master/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/filter/stop_words.rs">stop_words</a> を参照してください。</p></li></ul></td>
   </tr>
</table>

`stop` フィルターは トークナイザー によって生成された項に対して動作するため、トークナイザー と組み合わせて使用する必要があります。Zilliz Cloud で利用可能な トークナイザー の一覧については、[トークナイザー リファレンス](./analyzer-tokenizers) を参照してください。

`analyzer_params` を定義した後、コレクションスキーマを定義する際に `VARCHAR` フィールドにこれらを適用できます。これにより、Zilliz Cloud は指定された Analyzer を使用してそのフィールド内のテキストを処理し、効率的なトークン化とフィルタリングを実行できます。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

### ファイルリソースからストップワードを読み込む | プライベートプレビュー\{#load-stop-words-from-a-file-resource}

大規模なカスタムストップワードリスト（言語固有のリスト、ドメイン語彙、あるいは多くのコレクション間で共有したいリストなど）の場合、単語をファイルに保存し、そのファイルをリモートファイルリソースとして登録してから、`stop_words_file` パラメーターを通じてフィルターから参照します。`stop_words_file` を単独で使用することも、インラインの `stop_words` と併用することも可能です。両方が設定されている場合、フィルターはこれら 2 つのソースをマージして単一のストップワードリストを作成します。

ファイルは UTF‑8 のプレーンテキストであり、**1 行に 1 つのストップワード**を記述します。例：

```plaintext
the
of
for
```

ファイルを Milvus クラスターが使用するように構成されているオブジェクトストアにアップロードし、その後登録します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Register the uploaded file under a name you'll reference from analyzer configs.
client.add_file_resource(
    name="en_stop_words",
    path="file/stop_words.txt",    # full S3 object key, including the rootPath prefix
)
```

`stop_words_file` を使用して、フィルター内で登録済みリソースを参照します：

```python
analyzer_params = {
    "tokenizer": "standard",
    "filter": [{
        "type": "stop",
        "stop_words_file": {
            "type": "remote",
            "resource_name": "en_stop_words",
            "file_name": "stop_words.txt",
        },
    }],
}
```

`stop_words_file` パラメータは、以下のフィールドを持つオブジェクトを受け入れます。

<table>
   <tr>
     <th><p><strong>Field</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>The resource type. Use <code>"remote"</code> for a file registered via <code>add_file_resource</code>. For the <code>"local"</code> variant used in self-hosted deployments, refer to <a href="./undefined">Manage File リソース</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>resource_name</code></p></td>
     <td><p>The name used when the file was registered with <code>add_file_resource</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>file_name</code></p></td>
     <td><p>The filename portion of the registered resource's object-store path (for example, <code>"stop_words.txt"</code> if the resource was registered with <code>path="file/stop_words.txt"</code>).</p></td>
   </tr>
</table>

## Examples\{#examples}

アナライザー設定をコレクションスキーマに適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### Analyzer configuration\{#analyzer-configuration}

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

<TabItem value='java'>

```javascript
// javascript
```

</TabItem>

<TabItem value='java'>

```go
analyzerParams = map[string]any{"tokenizer": "standard",
    "filter": []any{map[string]any{
        "type":       "stop",
        "stop_words": []string{"of", "to", "_english_"},
    }}}
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

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

<TabItem value='java'>

```javascript
// javascript
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

### 期待される出力\{#expected-output}

```python
['The', 'stop', 'filter', 'allows', 'control', 'over', 'common', 'stop', 'words', 'text', 'processing']
```

