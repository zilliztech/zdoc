---
title: "Jieba | Cloud"
slug: /jieba-tokenizer
sidebar_label: "Jieba"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`jieba` トークナイザーは、中国語テキストを構成単語に分割して処理します。 | Cloud"
type: origin
token: JGURwBQNOijp2DkspFFctbAGnLh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Jieba

`jieba` トークナイザーは、中国語テキストを構成単語に分割して処理します。

<Admonition type="info" icon="📘" title="Notes">

`jieba` トークナイザーは、句読点を個別のトークンとして出力に保持します。たとえば、`"你好！世界。"` は `["你好", "！", "世界", "。"]` となります。これらの単独の句読点トークンを除去するには、[`removepunct`](./remove-punct-filter) フィルターを使用してください。

</Admonition>

## 設定\{#configuration}

Milvus では、`jieba` トークナイザーの設定方法として、シンプル設定とカスタム設定の 2 つがサポートされています。

### シンプル設定\{#simple-configuration}

シンプル設定では、トークナイザーを `"jieba"` に指定するだけです。例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Simple configuration: only specifying the tokenizer name
analyzer_params = {
    "tokenizer": "jieba",  # Use the default settings: dict=["_default_"], mode="search", hmm=True
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": "jieba",
};
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"tokenizer": "jieba"}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
analyzerParams='{
  "tokenizer": "jieba"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"}
};
```

</TabItem>
</Tabs>

このシンプル設定は、以下のカスタム設定と同等です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Custom configuration equivalent to the simple configuration above
analyzer_params = {
    "type": "jieba",          # Tokenizer type, fixed as "jieba"
    "dict": ["_default_"],     # Use the default dictionary
    "mode": "search",          # Use search mode for improved recall (see mode details below)
    "hmm": True                # Enable HMM for probabilistic segmentation
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "jieba");
analyzerParams.put("dict", Collections.singletonList("_default_"));
analyzerParams.put("mode", "search");
analyzerParams.put("hmm", true);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams = map[string]any{"type": "jieba", "dict": []any{"_default_"}, "mode": "search", "hmm": true}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzer_params = {
    {"tokenizer", "jieba"},
    {"dict", {"_default_"}},
    {"mode", "search"},
    {"hmm", true}
};
```

</TabItem>
</Tabs>

パラメーターの詳細については、[カスタム設定](./jieba-tokenizer#custom-configuration) を参照してください。

### カスタム設定\{#custom-configuration}

より詳細な制御が必要な場合は、カスタム辞書の指定、セグメンテーションモードの選択、Hidden Markov Model (HMM) の有効化・無効化を行えるカスタム設定を利用できます。例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Custom configuration with user-defined settings
analyzer_params = {
    "tokenizer": {
        "type": "jieba",           # Fixed tokenizer type
        "dict": ["customDictionary"],  # Custom dictionary list; replace with your own terms
        "mode": "exact",           # Use exact mode (non-overlapping tokens)
        "hmm": False               # Disable HMM; unmatched text will be split into individual characters
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();                                                                          
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");                                                                                                      
  put("dict", Arrays.asList("customDictionary"));             
  put("mode", "exact");
  put("hmm", false);
}});
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
      "type": "jieba",
      "dict": []string{"customDictionary"},
      "mode": "exact",
      "hmm":  false,
  },
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzerParams = {                                                                                              
  {"tokenizer", {                          
      {"type", "jieba"},                                                                                                     
      {"dict", {"customDictionary"}},                         
      {"mode", "exact"},                                                                                                     
      {"hmm", false}                                          
  }}
};
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
     <th><p>デフォルト値</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>トークナイザーの種類です。<code>&quot;jieba&quot;</code> に固定されています。</p></td>
     <td><p><code>&quot;jieba&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>dict</code></p></td>
     <td><p>アナライザーが語彙ソースとして読み込む辞書のリストです。組み込みオプションは以下のとおりです。</p><ul><li><p><code>&quot;_default_&quot;</code>: エンジンに組み込まれた簡体字中国語辞書を読み込みます。詳細は <a href="https://github.com/messense/jieba-rs/blob/v0.6.8/src/data/dict.txt">dict.txt</a> を参照してください。</p></li><li><p><code>&quot;_extend_default_&quot;</code>: <code>&quot;_default_&quot;</code> に加え、繁体字中国語の補足辞書も読み込みます。詳細は <a href="https://github.com/milvus-io/milvus/blob/v2.5.11/internal/core/thirdparty/tantivy/tantivy-binding/src/analyzer/data/jieba/dict.txt.big">dict.txt.big</a> を参照してください。</p></li></ul><p>組み込み辞書と任意の数のカスタム辞書を組み合わせることも可能です。例: <code>[&quot;_default_&quot;, &quot;结巴分词器&quot;]</code>。</p></td>
     <td><p><code>[&quot;_default_&quot;]</code></p></td>
   </tr>
   <tr>
     <td><p><code>mode</code></p></td>
     <td><p>セグメンテーションモードです。指定可能な値は以下のとおりです。</p><ul><li><p><code>&quot;exact&quot;</code>: 文を最も正確に分割するため、テキスト分析に適しています。</p></li><li><p><code>&quot;search&quot;</code>: exact モードを基に長い単語をさらに分割して再現率を高めるため、検索エンジンのトークン化に適しています。</p></li></ul><p>詳細については、<a href="https://github.com/fxsjy/jieba">Jieba GitHub Project</a> を参照してください。</p></td>
     <td><p><code>&quot;search&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>hmm</code></p></td>
     <td><p>辞書に登録されていない単語に対して Hidden Markov Model (HMM) による確率的なセグメンテーションを有効にするかどうかを示すブール値フラグです。</p></td>
     <td><p><code>true</code></p></td>
   </tr>
</table>

`dict` でインライン指定する代わりに、外部ファイルから大規模なカスタム語彙を読み込む場合は、後述の [辞書ファイルを使用したカスタム設定](./jieba-tokenizer#custom-configuration-with-a-dictionary-file) を参照してください。

`analyzer_params` を定義した後、コレクションスキーマの定義時にそれらを `VARCHAR` フィールドに適用できます。これにより、Zilliz Cloud が指定されたアナライザーを使用して該当フィールドのテキストを処理し、効率的なトークン化とフィルタリングを実行できるようになります。詳細については、[使用例](./analyzer-overview#example-use) を参照してください。

### 辞書ファイルによるカスタム設定 | PRIVATE\{#custom-configuration-with-a-dictionary-file}

ドメイン用語集、製品用語、固有名詞リストなど大規模なカスタム語彙がある場合は、単語をファイルに保存してリモートファイルリソースとして登録し、トークナイザーから `extra_dict_file` パラメーターで参照します。アナライザーは組み込み辞書に加えて、これらの単語を語彙として読み込みます。

ファイルは1行に1つの用語を記述したプレーンテキスト（UTF-8）です。例:

```plaintext
结巴分词器
向量数据库
```

Milvus クラスターで使用するように設定されているオブジェクトストアにファイルをアップロードし、登録します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Register the uploaded file under a name you'll reference from analyzer configs.
client.add_file_resource(
    name="zh_terms",
    path="file/zh_terms.txt",    # full S3 object key, including the rootPath prefix
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

登録したリソースを、トークナイザーの `extra_dict_file` で参照します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["_default_"],             # keep the built-in dictionary
        "mode": "exact",
        "hmm": False,
        "extra_dict_file": {
            "type": "remote",
            "resource_name": "zh_terms",
            "file_name": "zh_terms.txt",
        },
    },
}

client.run_analyzer(["milvus结巴分词器中文测试"], analyzer_params)
# → [['milvus', '结巴', '分词器', '中文', '测试']]
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

`extra_dict_file` パラメーターには、以下のフィールドを持つオブジェクトを指定します。

| フィールド | 説明 |
| --- | --- |
| `type` | リソースの種類です。`add_file_resource` で登録したファイルの場合は `"remote"` を指定します。セルフホスト環境で使用する `"local"` バリアントについては、「[ファイルリソースの管理](./manage-file-resources)」を参照してください。 |
| `resource_name` | `add_file_resource` でファイルを登録する際に指定した名前です。 |
| `file_name` | 登録済みリソースのオブジェクトストアパスのうち、ファイル名部分です（例: リソースを `path="file/zh_terms.txt"` で登録した場合の `"zh_terms.txt"`）。 |

`extra_dict_file` で追加された単語は組み込み辞書とマージされ、jieba のセグメンテーションアルゴリズムによって既存のエントリと同様に処理されます。特定の用語が単独のトークンとして抽出されるかどうかは、jieba の確率重み付き DAG 選択に依存します。例えば `向量数据库` のような長いカスタム用語でも、組み込み辞書内の短いエントリの頻度が高い場合には、`向量` + `数据库` に分割される可能性があります。

## 例\{#examples}

コレクションスキーマにアナライザー設定を適用する前に、`run_analyzer` メソッドを使って動作を確認してください。

### アナライザーの設定\{#analyzer-configuration}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["结巴分词器"],
        "mode": "exact",
        "hmm": False
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();                                                                          
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "jieba");                                                                                                      
  put("dict", Arrays.asList("结巴分词器"));                   
  put("mode", "exact");
  put("hmm", false);
}});
```

</TabItem>

<TabItem value='javascript'>

```javascript
// javascript
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
      "type": "jieba",
      "dict": []string{"结巴分词器"},
      "mode": "exact",
      "hmm":  false,
  },
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json analyzerParams = {
  {"tokenizer", {
      {"type", "jieba"},
      {"dict", {"结巴分词器"}},
      {"mode", "exact"},
      {"hmm", false}
  }}
};
```

</TabItem>
</Tabs>

### `run_analyzer` を使った検証\{#verification-using-runanalyzer}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
sample_text = "milvus结巴分词器中文测试"

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
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

List<String> texts = new ArrayList<>();
texts.add("milvus结巴分词器中文测试");

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
texts := []string{"milvus结巴分词器中文测试"}
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

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string text = "milvus结巴分词器中文测试";
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

### 期待される出力\{#expected-output}

```python
['milvus', '结巴分词器', '中', '文', '测', '试']
```

