---
title: "ブーストレランカー | BYOC"
slug: /boost-ranker
sidebar_label: "ブーストレランカー"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル距離に基づくセマンティック類似度の計算に solely 依存する代わりに、ブーストレランカーを使用すると、検索結果に意味のある方法で影響を与えることができます。これは、メタデータフィルタリングを使用して検索結果を迅速に調整するのに理想的です。 | BYOC"
type: origin
token: Qa60w2vDuiqNk0kclKLcZ0uQnkg
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search result reranking
  - result reranking
  - boost
  - boost ranker
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ブーストレランカー

ベクトル距離に基づくセマンティック類似度の計算のみに依存する代わりに、ブーストレランカーを使用すると、検索結果に意味のある方法で影響を与えることができます。これは、メタデータフィルタリングを使用して検索結果を迅速に調整するのに理想的です。

検索要求にブーストレランカー関数が含まれている場合、Milvusはその関数内のオプションなフィルタリング条件を使用して検索結果の候補の中から一致を検索し、指定された重みを適用して一致したエンティティのスコアをブーストします。これにより、一致したエンティティのランキングを最終結果で昇格または降格できます。

## ブーストレランカーの使用タイミング\{#when-to-use-boost-ranker}

交差エンコーダーモデルまたはフュージョンアルゴリズムに依存する他のランカーとは異なり、ブーストレランカーはオプションのメタデータ駆動ルールを直接ランキングプロセスに注入するため、以下のシナリオで特に適しています。

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>なぜブーストレランカーが適しているのか</p></th>
   </tr>
   <tr>
     <td><p>ビジネス駆動型のコンテンツ優先順位付け</p></td>
     <td><ul><li><p>EC検索結果でプレミアム商品を強調表示</p></li><li><p>視聴数、いいね、シェアなどの高ユーザーエンゲージメント指標を持つコンテンツの可視性を高める</p></li><li><p>時間に敏感な検索アプリケーションで最近のコンテンツを優先</p></li><li><p>認証済みまたは信頼できるソースからのコンテンツを優先</p></li><li><p>完全一致のフレーズまたは高関連性キーワードに一致する結果をブースト</p></li></ul></td>
     <td><p>インデックスの再構築やベクトル埋め込みモデルの変更（時間のかかる操作）を必要とせず、リアルタイムでオプションのメタデータフィルターを適用することで検索結果の特定のアイテムをすぐに昇格または降格できます。このメカニズムにより、進化するビジネス要件に簡単に適応できる柔軟で動的な検索ランキングが可能になります。</p></td>
   </tr>
   <tr>
     <td><p>戦略的コンテンツの降格</p></td>
     <td><ul><li><p>完全に削除することなく在庫が少ないアイテムのプロミネンスを減らす</p></li><li><p>検閲せずに潜在的に問題のある用語を含むコンテンツのランクを下げる</p></li><li><p>技術的検索で引き続きアクセスできるように古いドキュメントを降格</p></li><li><p>マーケットプレース検索で競合他社の商品の可視性を控えめに減らす</p></li><li><p>品質の低い指標（フォーマット問題、短い長さなど）を持つコンテンツの関連性を下げること</p></li></ul></td>
   </tr>
</table>

複数のブーストレランカーを組み合わせて、より動的で堅牢な重みベースのランキング戦略を実装することもできます。

## ブーストレランカーの仕組み\{#mechanism-of-boost-ranker}

以下の図は、ブーストレランカーの主なワークフローを示しています。

![Hq0awfjC7h0Ty3bvsUEcasOHncb](/img/Hq0awfjC7h0Ty3bvsUEcasOHncb.png)

データを挿入する際、Zilliz Cloudはそれをセグメント間で分散します。検索中、各セグメントは候補セットを返し、Zilliz Cloudはこれらのすべてのセグメントからの候補をランキングして最終結果を生成します。検索要求にブーストレランカーが含まれている場合、Zilliz Cloudは各セグメントからの候補結果に適用して、潜在的な精度の損失を防止し、リコールを改善します。

結果を確定する前、Milvusはこれらの候補を以下のようにブーストレランカーで処理します：

1. ブーストレランカーで指定されたオプションのフィルタリング式を適用して、式に一致するエンティティを識別します。

1. ブーストレランカーで指定された重みを適用して、識別されたエンティティのスコアをブーストします。

<Admonition type="info" icon="📘" title="注釈">

<p>マルチベクトルハイブリッド検索のランカーとしてブーストレランカーを使用することはできません。ただし、サブリクエスト（<code>AnnSearchRequest</code>）のいずれかのランカーとしては使用できます。</p>

</Admonition>

## ブーストレランカーの例\{#examples-of-boost-ranker}

以下の例は、シングルベクトル検索でブーストレランカーを使用する方法を示しています。この検索では、上位5つの最も関連性の高いエンティティを返すと同時に、抽象ドックタイプを持つエンティティのスコアに重みを追加する必要があります。

1. **セグメント内の検索結果候補を集める。**

    以下の表では、Milvusがエンティティを2つのセグメント（**0001**および**0002**）に分散し、各セグメントが5つの候補を返すと仮定します。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>ドックタイプ</p></th>
         <th><p>スコア</p></th>
         <th><p>ランク</p></th>
         <th><p>セグメント</p></th>
       </tr>
       <tr>
         <td><p>117</p></td>
         <td><p>abstract</p></td>
         <td><p>0.344</p></td>
         <td><p>1</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>89</p></td>
         <td><p>abstract</p></td>
         <td><p>0.456</p></td>
         <td><p>2</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>257</p></td>
         <td><p>body</p></td>
         <td><p>0.578</p></td>
         <td><p>3</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>358</p></td>
         <td><p>title</p></td>
         <td><p>0.788</p></td>
         <td><p>4</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>168</p></td>
         <td><p>body</p></td>
         <td><p>0.899</p></td>
         <td><p>5</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>46</p></td>
         <td><p>body</p></td>
         <td><p>0.189</p></td>
         <td><p>1</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p>48</p></td>
         <td><p>body</p></td>
         <td><p>0265</p></td>
         <td><p>2</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p>561</p></td>
         <td><p>abstract</p></td>
         <td><p>0.366</p></td>
         <td><p>3</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p>344</p></td>
         <td><p>abstract</p></td>
         <td><p>0.444</p></td>
         <td><p>4</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p>276</p></td>
         <td><p>abstract</p></td>
         <td><p>0.845</p></td>
         <td><p>5</p></td>
         <td><p>0002</p></td>
       </tr>
    </table>

1. **ブーストレランカーで指定されたフィルター式を適用** (`doctype='abstract'`)。

    以下の表の`ドックタイプ`フィールドで示されるように、Milvusは`doctype`が`abstract`に設定されたすべてのエンティティを後続の処理のためにマークします。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>ドックタイプ</p></th>
         <th><p>スコア</p></th>
         <th><p>ランク</p></th>
         <th><p>セグメント</p></th>
       </tr>
       <tr>
         <td><p><strong>117</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.344</strong></p></td>
         <td><p><strong>1</strong></p></td>
         <td><p><strong>0001</strong></p></td>
       </tr>
       <tr>
         <td><p><strong>89</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.456</strong></p></td>
         <td><p><strong>2</strong></p></td>
         <td><p><strong>0001</strong></p></td>
       </tr>
       <tr>
         <td><p>257</p></td>
         <td><p>body</p></td>
         <td><p>0.578</p></td>
         <td><p>3</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>358</p></td>
         <td><p>title</p></td>
         <td><p>0.788</p></td>
         <td><p>4</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>168</p></td>
         <td><p>body</p></td>
         <td><p>0.899</p></td>
         <td><p>5</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>46</p></td>
         <td><p>body</p></td>
         <td><p>0.189</p></td>
         <td><p>1</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p>48</p></td>
         <td><p>body</p></td>
         <td><p>0265</p></td>
         <td><p>2</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p><strong>561</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.366</strong></p></td>
         <td><p><strong>3</strong></p></td>
         <td><p><strong>0002</strong></p></td>
       </tr>
       <tr>
         <td><p><strong>344</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.444</strong></p></td>
         <td><p><strong>4</strong></p></td>
         <td><p><strong>0002</strong></p></td>
       </tr>
       <tr>
         <td><p><strong>276</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.845</strong></p></td>
         <td><p><strong>5</strong></p></td>
         <td><p><strong>0002</strong></p></td>
       </tr>
    </table>

1. **ブーストレランカーで指定された重みを適用** (`weight=0.5`)。

    前のステップで識別されたすべてのエンティティは、ブーストレランカーで指定された重みで乗算され、ランクに変化が生じます。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>ドックタイプ</p></th>
         <th><p>スコア</p></th>
         <th><p>加重スコア </p><p>(= スコア × 重み)</p></th>
         <th><p>ランク</p></th>
         <th><p>セグメント</p></th>
       </tr>
       <tr>
         <td><p><strong>117</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.344</strong></p></td>
         <td><p><strong>0.172</strong></p></td>
         <td><p><strong>1</strong></p></td>
         <td><p><strong>0001</strong></p></td>
       </tr>
       <tr>
         <td><p><strong>89</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.456</strong></p></td>
         <td><p><strong>0.228</strong></p></td>
         <td><p><strong>2</strong></p></td>
         <td><p><strong>0001</strong></p></td>
       </tr>
       <tr>
         <td><p>257</p></td>
         <td><p>body</p></td>
         <td><p>0.578</p></td>
         <td><p>0.578</p></td>
         <td><p>3</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>358</p></td>
         <td><p>title</p></td>
         <td><p>0.788</p></td>
         <td><p>0.788</p></td>
         <td><p>4</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p>168</p></td>
         <td><p>body</p></td>
         <td><p>0.899</p></td>
         <td><p>0.899</p></td>
         <td><p>5</p></td>
         <td><p>0001</p></td>
       </tr>
       <tr>
         <td><p><strong>561</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.366</strong></p></td>
         <td><p><strong>0.183</strong></p></td>
         <td><p><strong>1</strong></p></td>
         <td><p><strong>0002</strong></p></td>
       </tr>
       <tr>
         <td><p>46</p></td>
         <td><p>body</p></td>
         <td><p>0.189</p></td>
         <td><p>0.189</p></td>
         <td><p>2</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p><strong>344</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.444</strong></p></td>
         <td><p><strong>0.222</strong></p></td>
         <td><p><strong>3</strong></p></td>
         <td><p><strong>0002</strong></p></td>
       </tr>
       <tr>
         <td><p>48</p></td>
         <td><p>body</p></td>
         <td><p>0.265</p></td>
         <td><p>0.265</p></td>
         <td><p>4</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p><strong>276</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.845</strong></p></td>
         <td><p><strong>0.423</strong></p></td>
         <td><p><strong>5</strong></p></td>
         <td><p><strong>0002</strong></p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="注釈">

    <p>重みは選択した浮動小数点数である必要があります。上記の例のように、スコアが小さいほど関連性が高いと判断される場合は、<strong>1</strong>より小さい重みを使用します。それ以外の場合は、<strong>1</strong>より大きい重みを使用します。</p>

    </Admonition>

1. **すべてのセグメントからの候補を集約し、加重スコアに基づいて結果を確定します。**

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>ドックタイプ</p></th>
         <th><p>スコア</p></th>
         <th><p>加重スコア</p></th>
         <th><p>ランク</p></th>
         <th><p>セグメント</p></th>
       </tr>
       <tr>
         <td><p><strong>117</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.344</strong></p></td>
         <td><p><strong>0.172</strong></p></td>
         <td><p><strong>1</strong></p></td>
         <td><p><strong>0001</strong></p></td>
       </tr>
       <tr>
         <td><p><strong>561</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.366</strong></p></td>
         <td><p><strong>0.183</strong></p></td>
         <td><p><strong>2</strong></p></td>
         <td><p><strong>0002</strong></p></td>
       </tr>
       <tr>
         <td><p>46</p></td>
         <td><p>body</p></td>
         <td><p>0.189</p></td>
         <td><p>0.189</p></td>
         <td><p>3</p></td>
         <td><p>0002</p></td>
       </tr>
       <tr>
         <td><p><strong>344</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.444</strong></p></td>
         <td><p><strong>0.222</strong></p></td>
         <td><p><strong>4</strong></p></td>
         <td><p><strong>0002</strong></p></td>
       </tr>
       <tr>
         <td><p><strong>89</strong></p></td>
         <td><p><strong>abstract</strong></p></td>
         <td><p><strong>0.456</strong></p></td>
         <td><p><strong>0.228</strong></p></td>
         <td><p><strong>5</strong></p></td>
         <td><p><strong>0001</strong></p></td>
       </tr>
    </table>

## ブーストレランカーの使用方法\{#usage-of-boost-ranker}

このセクションでは、シングルベクトル検索の結果に影響を与えるためにブーストレランカーを使用する方法の例を示します。

### ブーストレランカーの作成\{#create-a-boost-ranker}

検索要求の再ランカーとしてブーストレランカーを渡す前に、以下のように再ランキング関数として適切に定義する必要があります：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

ranker = Function(
    name="boost",
    input_field_names=[], # 空のリストでなければならない
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "filter": "doctype == 'abstract'",
        "random_score": {
            "seed": 126,
            "field": "id"
        },
        "weight": 0.5
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.BoostRanker;

BoostRanker ranker = BoostRanker.builder()
        .name("boost")
        .filter("doctype == \"abstract\"")
        .weight(5.0f)
        .randomScoreField("id")
        .randomScoreSeed(126)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
import {FunctionType} from '@zilliz/milvus2-sdk-node';

const ranker = {
  name: "boost",
  input_field_names: [],
  type: FunctionType.RERANK,
  params: {
    reranker: "boost",
    filter: "doctype == 'abstract'",
    random_score: {
      seed: 126,
      field: "id",
    },
    weight: 0.5,
  },
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
     <th><p>必須？</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>この関数の一意識別子</p></td>
     <td><p><code>"boost"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>関数を適用するベクトルフィールドのリスト（ブーストレランカーでは空のリストにする必要があります）</p></td>
     <td><p><code>[]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す関数のタイプ。再ランキング戦略を指定するには<code>RERANK</code>を使用</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>再ランカーのタイプを指定します。</p><p>ブーストレランカーを使用するには<code>boost</code>に設定する必要があります。</p></td>
     <td><p><code>"boost"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.weight</code></p></td>
     <td><p>はい</p></td>
     <td><p>生の検索結果で一致したエンティティのスコアに乗算される重みを指定します。</p><p>値は浮動小数点数である必要があります。</p><ul><li><p>一致したエンティティの重要度を強調するには、スコアをブーストする値を設定します。</p></li><li><p>一致したエンティティを降格するには、このパラメータにスコアを下げる値を設定します。</p></li></ul></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.filter</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>検索結果エンティティの中から一致するエンティティを見つけるために使用されるフィルター式を指定します。これは<a href="./filtering-overview">フィルタリングの説明</a>で述べられている有効な基本フィルター式のいずれかでも構いません。</p><p><strong>注釈</strong>: <code>==</code>、<code>&gt;</code>、<code>&lt;</code>などの基本演算子のみを使用してください。<code>text_match</code>や<code>phrase_match</code>などの高度な演算子を使用すると、検索パフォーマンスが低下します。</p></td>
     <td><p><code>"doctype == 'abstract'"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.random_score</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>0から1の間の値をランダムに生成する乱数関数を指定します。以下の2つのオプショナル引数があります：</p><ul><li><p><code>seed</code> (数値) 擬似乱数生成器(PRNG)を開始するために使用される初期値を指定します。</p></li><li><p><code>field</code> (文字列) 乱数生成の乱数要素として使用される値を持つフィールドの名前を指定します。一意の値を持つフィールドで十分です。</p><p>同じseedとfieldの値を使用して生成間で一貫性を確保するために、どちらの値も設定することをお勧めします。</p></li></ul></td>
     <td><p><code>\{"seed": 126, "field": "id"}</code></p></td>
   </tr>
</table>

### 単一のブーストレランカーでの検索\{#search-with-a-single-boost-ranker}

ブーストレランカー関数の準備ができたら、検索要求で参照できます。以下の例では、すでに以下のフィールドを持つコレクションを作成したと仮定しています：**id**、**vector**、および**doctype**。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Milvusサーバーに接続
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# コレクションがすでに設定されていると仮定

# 作成したランカーを使用して類似性検索を実行
client.search(
    collection_name="my_collection",
    data=[[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
    anns_field="vector",
    params={},
    output_field=["doctype"],
    ranker=ranker
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.FloatVec;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .functionScore(FunctionScore.builder()
                .addFunction(ranker)
                .build())
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// Milvusサーバーに接続
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

// コレクションがすでに設定されていると仮定

// 類似性検索を実行
const searchResults = await client.search({
  collection_name: 'my_collection',
  data: [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911],
  anns_field: 'vector',
  output_fields: ['doctype'],
  rerank: ranker,
});

console.log('検索結果:', searchResults);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### 複数のブーストレランカーでの検索\{#search-with-multiple-boost-rankers}

検索結果に影響を与えるために、単一の検索で複数のブーストレランカーを組み合わせることができます。これを行うには、複数のブーストレランカーを作成し、**FunctionScore**インスタンスで参照し、検索要求で**FunctionScore**インスタンスをランカーとして使用します。

以下の例は、識別されたすべてのエンティティのスコアを**0.8**から**1.2**の重みで修正する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, Function, FunctionType, FunctionScore

# 固定重みを持つブーストレランカーを作成
fix_weight_ranker = Function(
    name="boost",
    input_field_names=[], # 空のリストでなければならない
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "weight": 0.8
    }
)

# 0から0.4の間のランダム重みを持つブーストレランカーを作成
random_weight_ranker = Function(
    name="boost",
    input_field_names=[], # 空のリストでなければならない
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "random_score": {
            "seed": 126,
        },
        "weight": 0.4
    }
)

# FunctionScoreを作成
ranker = FunctionScore(
    functions=[
        fix_weight_ranker,
        random_weight_ranker
    ],
    params={
        "boost_mode": "Multiply",
        "function_mode": "Sum"
    }
)

# 作成したFunctionScoreを使用して類似性検索を実行
client.search(
    collection_name="my_collection",
    data=[[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
    anns_field="vector",
    params={},
    output_field=["doctype"],
    ranker=ranker
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.Function fixWeightRanker = CreateCollectionReq.Function.builder()
                 .functionType(FunctionType.RERANK)
                 .name("boost")
                 .param("reranker", "boost")
                 .param("weight", "0.8")
                 .build();

CreateCollectionReq.Function randomWeightRanker = CreateCollectionReq.Function.builder()
                 .functionType(FunctionType.RERANK)
                 .name("boost")
                 .param("reranker", "boost")
                 .param("weight", "0.4")
                 .param("random_score", "{\"seed\": 126}")
                 .build();

Map<String, String> params = new HashMap<>();
params.put("boost_mode","Multiply");
params.put("function_mode","Sum");
FunctionScore ranker = FunctionScore.builder()
                 .addFunction(fixWeightRanker)
                 .addFunction(randomWeightRanker)
                 .params(params)
                 .build();

SearchResp searchResp = client.search(SearchReq.builder()
                 .collectionName("my_collection")
                 .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
                 .annsField("vector")
                 .outputFields(Collections.singletonList("doctype"))
                 .functionScore(ranker)
                 .build());
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
import {FunctionType} from '@zilliz/milvus2-sdk-node';

const fix_weight_reranker = {
  name: "boost",
  input_field_names: [],
  type: FunctionType.RERANK,
  params: {
    reranker: "boost",
    weight: 0.8,
  },
};

const random_weight_reranker = {
  name: "boost",
  input_field_names: [],
  type: FunctionType.RERANK,
  params: {
    reranker: "boost",
    random_score: {
      seed: 126,
    },
    weight: 0.4,
  },
};

const ranker = {
  functions: [fix_weight_reranker, random_weight_reranker],
  params: {
    boost_mode: "Multiply",
    function_mode: "Sum",
  },
};

await client.search({
  collection_name: "my_collection",
  data: [[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
  anns_field: "vector",
  params: {},
  output_fields: ["doctype"],
  ranker: ranker
});

```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

具体的には、2つのブーストレランカーがあります：1つは見つかったすべてのエンティティに固定重みを適用し、もう1つはそれらにランダム重みを割り当てます。次に、これらの2つのランカーを**FunctionScore**で参照し、見つかったエンティティのスコアに重みがどのように影響するかを定義します。

以下の表は、**FunctionScore**インスタンスを作成するために必要なパラメータを示しています。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>必須？</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>functions</code></p></td>
     <td><p>はい</p></td>
     <td><p>リスト内のターゲットランカーの名前を指定します。</p></td>
     <td><p><code>["fix_weight_reranker", "random_weight_reranker"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.boost_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定された重みが一致したエンティティのスコアにどのような影響を与えるかを指定します。</p><p>可能な値は以下の通りです：</p><ul><li><p><code>Multiply</code></p><p>重み付き値が一致したエンティティの元のスコアに指定された重みを乗算したものと等しいことを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>重み付き値が一致したエンティティの元のスコアと指定された重みの和と等しいことを示します</p></li></ul></td>
     <td><p><code>"Sum"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>さまざまなブーストレランカーからの重み付き値がどのように処理されるかを指定します。</p><p>可能な値は以下の通りです：</p><ul><li><p><code>Multiply</code></p><p>一致したエンティティの最終スコアがすべてのブーストレランカーからの重み付き値の積と等しいことを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>一致したエンティティの最終スコアがすべてのブーストレランカーからの重み付き値の和と等しいことを示します。</p></li></ul></td>
     <td><p><code>"Sum"</code></p></td>
   </tr>
</table>
