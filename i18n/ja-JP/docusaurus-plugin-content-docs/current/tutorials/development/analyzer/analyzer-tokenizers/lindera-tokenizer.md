---
title: "Lindera | Cloud"
slug: /lindera-tokenizer
sidebar_label: "Lindera"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`lindera` tokenizer は辞書ベースの形態素解析を実行します。これは、日本語や韓国語のように、単語がスペースで区切られず、文法標識（助詞）が単語に直接付く言語向けに設計されています。 | Cloud"
type: origin
token: PvwZwtu3FiBQNqkPa5VcqH6qnmg
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lindera

`lindera` tokenizer は辞書ベースの形態素解析を実行します。これは、日本語や韓国語のように、単語がスペースで区切られず、文法標識（助詞）が単語に直接付く言語向けに設計されています。

<Admonition type="info" icon="📘" title="注意">

**中国語テキストについて**: `lindera` は `cc-cedict` 辞書を通じて中国語をサポートしていますが、代わりに [`jieba`](./jieba-tokenizer) tokenizer を使用することを推奨します。Jieba は中国語の単語分割向けに特別に設計されており、より良い結果を提供します。

</Admonition>

## Overview\{#overview}

日本語と韓国語は膠着語です。助詞と呼ばれる文法標識が名詞に直接付くため、多数の組み合わせが生まれます。例えば次のようになります。

<table>
   <tr>
     <th><p>言語</p></th>
     <th><p>語幹</p></th>
     <th><ul><li>助詞</li></ul></th>
     <th><p>= 結合形</p></th>
     <th><p>意味</p></th>
   </tr>
   <tr>
     <td><p>韓国語</p></td>
     <td><p>서울 (Seoul)</p></td>
     <td><p>에서</p></td>
     <td><p>서울에서</p></td>
     <td><p>ソウルで</p></td>
   </tr>
   <tr>
     <td><p>日本語</p></td>
     <td><p>東京 (Tokyo)</p></td>
     <td><p>に</p></td>
     <td><p>東京に</p></td>
     <td><p>東京へ</p></td>
   </tr>
</table>

`lindera` tokenizer は次のことを行います。

1. **テキストを分割**して個々の形態素（単語と助詞）にする

1. **各 token にタグ付け**して辞書由来の品詞（POS）情報を付与する

1. **フィルターを適用**して不要な token（例: 助詞、句読点）を除去する

この2段階のプロセス、つまり分割の後に POS ベースのフィルタリングを行うことで、検索用にどの token を index 化するかを正確に制御できます。

## Configuration\{#configuration}

`lindera` tokenizer を使用する analyzer を設定するには、`tokenizer.type` を `lindera` に設定し、`dict_kind` で辞書を選択し、必要に応じてフィルターを適用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();                                 
  analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
      put("type", "lindera");                                                           
      put("dict_kind", "ko-dic");                                 
      put("filter", Arrays.asList(
          new HashMap<String, Object>() {{
              put("kind", "korean_stop_tags");
              put("tags", Arrays.asList(
                  "SP", "SSC", "SSO", "SC", "SE", "SF",
                  "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                  "JX", "JC", "UNK", "EP", "ETM"
              ));
          }}
      ));
  }});
```

</TabItem>

<TabItem value='go'>

```go
analyzerParams := map[string]interface{}{                                             
      "tokenizer": map[string]interface{}{     
          "type":      "lindera",                                                       
          "dict_kind": "ko-dic",                                  
          "filter": []interface{}{                                                      
              map[string]interface{}{                             
                  "kind": "korean_stop_tags",
                  "tags": []string{
                      "SP", "SSC", "SSO", "SC", "SE", "SF",
                      "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                      "JX", "JC", "UNK", "EP", "ETM",
                  },
              },
          },
      },
  }
```

</TabItem>

<TabItem value='javascript'>

```javascript
const analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>tokenizer のタイプです。これは <code>"lindera"</code> に固定されています。</p></td>
   </tr>
   <tr>
     <td><p><code>dict_kind</code></p></td>
     <td><p>語彙を定義するために使用される辞書です。指定可能な値:</p><ul><li><p><code>ko-dic</code>: 韓国語 - 韓国語形態素辞書 (<a href="https://bitbucket.org/eunjeon/mecab-ko-dic">MeCab Ko-dic</a>)</p></li><li><p><code>ipadic</code>: 日本語 - 標準形態素辞書 (<a href="https://taku910.github.io/mecab/">MeCab IPADIC</a>)</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>filter</code></p></td>
     <td><p>分割後に適用する tokenizer レベルのフィルターのリストです。各フィルターは次を持つオブジェクトです:</p><ul><li><p><code>kind</code>: フィルターの種類。サポートされる値:</p><ul><li><p><code>korean_stop_tags</code>: 指定された韓国語 POS タグに一致する token を削除します。</p></li><li><p><code>japanese_stop_tags</code>: 指定された日本語 POS タグに一致する token を削除します。</p></li></ul></li><li><p><code>tags</code>: フィルタリング対象の POS タグのリストです。使用可能なタグは <code>kind</code> に依存します:</p><ul><li><p><code>korean_stop_tags</code> の場合: 完全一致するタグコード（例: <code>JKS</code>, <code>JKO</code>, <code>SF</code>）を使用します。韓国語タグは完全一致が必要です。世宗 tagset に基づく完全なリストについては、<a href="https://docs.rs/lindera/latest/src/lindera/token_filter/korean_stop_tags.rs.html">Lindera Korean stop tags source</a> を参照してください。</p></li><li><p><code>japanese_stop_tags</code> の場合: 完全一致するタグコード（例: <code>助詞,格助詞</code>, <code>助詞,係助詞</code>, <code>助動詞</code>）を使用します。日本語タグは完全一致が必要です。完全なリスト（IPADIC）については、<a href="https://github.com/taku910/mecab/blob/master/mecab-ipadic/pos-id.def">Japanese POS tags reference</a> を参照してください。</p></li></ul></li></ul></td>
   </tr>
</table>

`analyzer_params` を定義した後、collection schema を定義する際にそれらを `VARCHAR` field に適用できます。これにより、Zilliz Cloud は効率的な tokenization とフィルタリングのために、その field 内のテキストを指定された analyzer で処理できます。詳細は [使用例](./analyzer-overview#example-use) を参照してください。

## Examples\{#examples}

analyzer の設定を collection schema に適用する前に、`run_analyzer` メソッドを使用してその動作を確認してください。

### Korean example\{#korean-example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ko-dic",
        "filter": [
            {
                "kind": "korean_stop_tags",
                "tags": ["SP", "SSC", "SSO", "SC", "SE", "SF", "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ", "JX", "JC", "UNK", "EP", "ETM"]
            }
        ]
    }
}

# Sample Korean text: "서울에서 맛있는 음식을 먹었습니다" (I ate delicious food in Seoul)
sample_text = "서울에서 맛있는 음식을 먹었습니다"

result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
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

Map<String, Object> analyzerParams = new HashMap<>();                                                                          
analyzerParams.put("tokenizer", new HashMap<String, Object>() {{
  put("type", "lindera");                                                                                                    
  put("dict_kind", "ko-dic");                                 
  put("filter", Arrays.asList(
      new HashMap<String, Object>() {{
          put("kind", "korean_stop_tags");
          put("tags", Arrays.asList(
              "SP", "SSC", "SSO", "SC", "SE", "SF",
              "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
              "JX", "JC", "UNK", "EP", "ETM"
          ));
      }}
  ));
}});

List<String> texts = new ArrayList<>();
texts.add("서울에서 맛있는 음식을 먹었습니다");

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

analyzerParams := map[string]interface{}{
  "tokenizer": map[string]interface{}{
      "type":      "lindera",
      "dict_kind": "ko-dic",
      "filter": []interface{}{
          map[string]interface{}{
              "kind": "korean_stop_tags",
              "tags": []string{
                  "SP", "SSC", "SSO", "SC", "SE", "SF",
                  "JKS", "JKC", "JKG", "JKO", "JKB", "JKV", "JKQ",
                  "JX", "JC", "UNK", "EP", "ETM",
              },
          },
      },
  },
}

bs, _ := json.Marshal(analyzerParams)
texts := []string{"서울에서 맛있는 음식을 먹었습니다"}
option := milvusclient.NewRunAnalyzerOption(texts).
    WithAnalyzerParams(string(bs))

result, err := client.RunAnalyzer(ctx, option)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  uri: "YOUR_CLUSTER_ENDPOINT",
});

const analyzer_params = {
  tokenizer: {
    type: "lindera",
    dict_kind: "ko-dic",
    filter: [
      {
        kind: "korean_stop_tags",
        tags: [
          "SP",
          "SSC",
          "SSO",
          "SC",
          "SE",
          "SF",
          "JKS",
          "JKC",
          "JKG",
          "JKO",
          "JKB",
          "JKV",
          "JKQ",
          "JX",
          "JC",
          "UNK",
          "EP",
          "ETM",
        ],
      },
    ],
  },
};

const sample_text = "서울에서 맛있는 음식을 먹었습니다";

const result = await client.run_analyzer(sample_text, analyzer_params);
console.log("Analyzer output:", result);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

**期待される出力**:

```plaintext
['서울', '맛있', '음식', '먹', '습니다']
```

`korean_stop_tags` がない場合、出力には `에서`（〜で）、`는`（主題標識）、`을`（目的格標識）のような助詞も含まれますが、これらは通常検索にはあまり有用ではありません。

### Japanese example\{#japanese-example}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic",
        "filter": [
            {
                "kind": "japanese_stop_tags",
                "tags": ["接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"]
            }
        ]
    }
}

# Sample Japanese text: "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"
sample_text = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"

result = client.run_analyzer(sample_text, analyzer_params)
print("Analyzer output:", result)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  uri: "YOUR_CLUSTER_ENDPOINT",
});

const analyzer_params = {
    "tokenizer": {
        "type": "lindera",
        "dict_kind": "ipadic",
        "filter": [
            {
                "kind": "japanese_stop_tags",
                "tags": ["接続詞", "助詞,格助詞", "助詞,格助詞,一般", "助詞,格助詞,引用", "助詞,格助詞,連語", "助詞,係助詞", "助詞,終助詞", "助詞,接続助詞", "助詞,特殊", "助詞,副助詞", "助詞,副助詞／並立助詞／終助詞", "助詞,連体化", "助詞,副詞化", "助詞,並立助詞", "助動詞", "記号,一般", "記号,読点", "記号,句点", "記号,空白", "記号,括弧閉", "記号,括弧開", "その他,間投", "フィラー", "非言語音"]
            }
        ]
    }
}

// Sample Japanese text: "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"
const sample_text = "東京スカイツリーの最寄り駅はとうきょうスカイツリー駅です"

const result = await client.run_analyzer(sample_text, analyzer_params);
console.log("Analyzer output:", result);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

**期待される出力:**

```plaintext
['東京', 'スカイ', 'ツリー', '最寄り駅', 'とう', 'きょう', 'スカイ', 'ツリー', '駅']
```

`japanese_stop_tags` がない場合、出力には `の`（連体助詞）、`は`（主題標識）、`です`（コピュラ）のような要素も含まれます。
