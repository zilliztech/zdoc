---
title: "ブーストレランカー | Cloud"
slug: /boost-ranker
sidebar_label: "ブーストレランカー"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル距離に基づく意味的類似性の計算に頼る代わりに、ブーストレランカーを使用して検索結果を意味のある方法で影響させることができます。メタデータフィルタリングを使用して検索結果を迅速に調整するのに理想的です。| Cloud"
type: origin
token: Qa60w2vDuiqNk0kclKLcZ0uQnkg
sidebar_position: 3
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - 検索結果の再ランク付け
  - 結果の再ランク付け
  - ブースト
  - ブーストレランカー
  - 異常検知
  - センテンストランスフォーマー
  - レコメンデーションシステム
  - 情報検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ブーストレランカー

ベクトル距離に基づく意味的類似性の計算のみに依存する代わりに、ブーストレランカーを使用して、検索結果に意味のある方法で影響を与えることができます。これは、メタデータフィルタリングを使用して検索結果を迅速に調整するのに理想的です。

検索リクエストにブーストレランカー関数が含まれている場合、Milvusは関数内のオプションのフィルタリング条件を使用して検索結果候補の中から一致を検索し、指定された重みを適用してそれらの一致のスコアをブーストし、最終結果で一致したエンティティのランクを促進または抑制するのに役立ちます。

## ブーストレランカーの使用場面\{#when-to-use-boost-ranker}

クロスエンコーダーモデルや融合アルゴリズムに依存する他のランカーとは異なり、ブーストレランカーはオプションのメタデータ駆動ルールを直接ランキングプロセスに注入するため、以下のようなシナリオでより適しています。

<table>
   <tr>
     <th><p>使用例</p></th>
     <th><p>例</p></th>
     <th><p>ブーストレランカーがうまく機能する理由</p></th>
   </tr>
   <tr>
     <td><p>ビジネス駆動型のコンテンツ優先順位付け</p></td>
     <td><ul><li><p>EC検索結果でプレミアム商品を強調表示</p></li><li><p>高ユーザーエンゲージメント指標（閲覧数、いいね、共有など）を持つコンテンツの可視性を向上</p></li><li><p>時間に敏感な検索アプリケーションで最近のコンテンツを優先</p></li><li><p>認証済みまたは信頼できるソースからのコンテンツを優先</p></li><li><p>正確なフレーズまたは高関連性キーワードに一致する結果をブースト</p></li></ul></td>
     <td rowspan="2"><p>インデックスの再構築やベクトル埋め込みモデルの変更（時間のかかる作業）をする必要がなく、実時間でオプションのメタデータフィルターを適用して検索結果の特定のアイテムを即座に促進または抑制できます。このメカニズムにより、進化するビジネス要件に簡単に適応できる柔軟で動的な検索ランキングが可能になります。</p></td>
   </tr>
   <tr>
     <td><p>戦略的内容のランク下げ</p></td>
     <td><ul><li><p>在庫が少ないアイテムの目立たなさを減らしつつ完全に削除しない</p></li><li><p>潜在的に問題のある用語を含むコンテンツのランクを検閲せずに下げる</p></li><li><p>古いドキュメントを技術検索でアクセス可能にしつつランクを下げておく</p></li><li><p>マーケットプレース検索で競合他社の製品の目立たなさを微妙に減らす</p></li><li><p>品質が低いと示唆されるコンテンツの関連性を下げる（フォーマットの問題、文章が短いなど）</p></li></ul></td>
   </tr>
</table>

複数のブーストレランカーを組み合わせて、より動的で堅牢な重みベースのランキング戦略を実装することもできます。

## ブーストレランカーの仕組み\{#mechanism-of-boost-ranker}

以下の図は、ブーストレランカーの主なワークフローを示しています。

![Hq0awfjC7h0Ty3bvsUEcasOHncb](/img/Hq0awfjC7h0Ty3bvsUEcasOHncb.png)

データを挿入する際、Zilliz Cloudはデータをセグメントに分散配置します。検索中、各セグメントは候補のセットを返し、Zilliz Cloudはこれらのすべてのセグメントの候補をランキングして最終結果を生成します。検索リクエストにブーストレランカーが含まれている場合、Zilliz Cloudは潜在的な精度損失を防ぎ、再現率を向上させるために各セグメントからの候補結果にそれを適用します。

結果を確定する前に、Milvusは以下の通りブーストレランカーでこれらの候補を処理します：

1. ブーストレランカーで指定されたオプションのフィルタリング式を適用して、式に一致するエンティティを識別します。

1. ブーストレランカーで指定された重みを適用して、識別されたエンティティのスコアをブーストします。

<Admonition type="info" icon="📘" title="注意">

<p>マルチベクトルハイブリッド検索のランカーとしてブーストレランカーを使用することはできません。ただし、そのサブリクエスト（<code>AnnSearchRequest</code>）のいずれかのランカーとして使用することはできます。</p>

</Admonition>

## ブーストレランカーの例\{#examples-of-boost-ranker}

以下の例は、上位5つの最も関連性の高いエンティティを返す必要がある単一ベクトル検索でブーストレランカーを使用する方法を示しています。また、abstract doc typeのエンティティのスコアに重みを追加します。

1. **セグメントで検索結果候補を収集します。**

    以下の表は、Milvusがエンティティを2つのセグメント（**0001**と**0002**）に分散配置し、各セグメントが5つの候補を返すことを想定しています。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>DocType</p></th>
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
         <td><p>0.265</p></td>
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

1. **ブーストレランカーで指定されたフィルタリング式** (`doctype='abstract'`) **を適用します。**

    以下の表の`DocType`フィールドで示されているように、Milvusは`doctype`が`abstract`に設定されたすべてのエンティティを後続処理のためにマークします。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>DocType</p></th>
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
         <td><p>0.265</p></td>
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

1. **ブーストレランカーで指定された重み** (`weight=0.5`) **を適用します。**

    前のステップで識別されたすべてのエンティティは、ブーストレランカーで指定された重みで乗算され、そのランクが変化します。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>DocType</p></th>
         <th><p>スコア</p></th>
         <th><p>加重スコア</p><p>(= スコア x 重み)</p></th>
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

    <Admonition type="info" icon="📘" title="注意">

    <p>重みは選択した浮動小数点数でなければなりません。上記の例のような場合、スコアが小さいほど関連性が高いことを示す場合は、<strong>1</strong>未満の重みを使用してください。それ以外の場合は、<strong>1</strong>より大きい重みを使用してください。</p>

    </Admonition>

1. **すべてのセグメントから重み付きスコアに基づいて候補をアグリゲートし、結果を確定します。**

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>DocType</p></th>
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

## ブーストレランカーの使用法\{#usage-of-boost-ranker}

このセクションでは、単一ベクトル検索の結果に影響を与えるためにブーストレランカーを使用する方法の例を見ていきます。

### ブーストレランカーの作成\{#create-a-boost-ranker}

ブーストレランカーを検索リクエストの再ランカーとして渡す前に、以下のように再ランク付け関数として適切に定義する必要があります：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

ranker = Function(
    name="boost",
    input_field_names=[], # 空のリストでなければなりません
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
     <td><p>この関数の一意の識別子</p></td>
     <td><p><code>"boost"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>関数を適用するベクトルフィールドのリスト（ブーストレランカーの場合は空のリストでなければなりません）</p></td>
     <td><p><code>[]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す関数のタイプ；再ランク付け戦略を指定するには <code>RERANK</code> を使用</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>再ランカーのタイプを指定します。<p>ブーストレランカーを使用するには <code>boost</code> に設定する必要があります。</p></p></td>
     <td><p><code>"boost"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.weight</code></p></td>
     <td><p>はい</p></td>
     <td><p>元の検索結果で一致したエンティティのスコアにかけられる重みを指定します。</p><p>値は浮動小数点数である必要があります。</p><ul><li><p>一致したエンティティの重要性を強調するには、スコアをブーストする値に設定します。</p></li><li><p>一致したエンティティを低くするには、このパラメータにスコアを下げさせる値を割り当てます。</p></li></ul></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.filter</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>検索結果エンティティの中からエンティティを一致させるために使用されるフィルター式を指定します。 <a href="./filtering-overview">フィルタリングの説明</a>で言及されている有効な基本フィルター式を使用できます。<p><strong>注意</strong>: <code>==</code>、<code>&gt;</code>、または<code>&lt;</code>などの基本演算子のみを使用してください。<code>text_match</code>や<code>phrase_match</code>などの高度な演算子を使用すると検索パフォーマンスが低下します。</p></p></td>
     <td><p><code>"doctype == 'abstract'"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.random_score</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>0から1の間の値をランダムに生成するランダム関数を指定します。以下の2つのオプション引数があります：</p><ul><li><p><code>seed</code> (数値) 擬似乱数生成器（PRNG）を開始するために使用される初期値を指定します。</p></li><li><p><code>field</code> (文字列) 乱数生成において乱数のランダム要素として使用される値のフィールド名を指定します。一意の値を持つフィールドで十分です。</p><p>同じシード値とフィールド値を使用することにより、生成間での一貫性を確保するには、<code>seed</code> と <code>field</code> の両方を設定することをお勧めします。</p></li></ul></td>
     <td><p><code>\{"seed": 126, "field": "id"}</code></p></td>
   </tr>
</table>

### 単一ブーストレランカーによる検索\{#search-with-a-single-boost-ranker}

ブーストレランカー関数が準備できたら、検索リクエストで参照できます。以下の例では、すでに以下のフィールドを持つコレクションが作成されていると想定しています：**id**、**vector**、および**doctype**。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Milvusサーバーに接続
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# コレクションが設定されていると想定

# 作成されたランカーを使用した類似性検索を実行
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
        .token("YOUR_CLUSTER_TOKEN")
        .build());

SearchResp searchReq = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .functionScore(FunctionScore.builder()
                .addFunction(ranker)
                .build())
        .build());
SearchResp searchResp = client.search(searchReq);
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

// コレクションが設定されていると想定

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

### 複数ブーストレランカーによる検索\{#search-with-multiple-boost-rankers}

単一の検索で複数のブーストレランカーを組み合わせて検索結果に影響を与えることができます。これを行うには、複数のブーストレランカーを作成し、それらを**FunctionScore**インスタンスで参照し、検索リクエストのランカーとして**FunctionScore**インスタンスを使用します。

以下の例では、**0.8**から**1.2**の間の重みを適用することによりすべての識別されたエンティティのスコアを修正する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, Function, FunctionType, FunctionScore

# 固定重みのブーストレランカーを作成
fix_weight_ranker = Function(
    name="boost",
    input_field_names=[], # 空のリストでなければなりません
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "weight": 0.8
    }
)

# 0と0.4の間でランダムに生成された重みのブーストレランカーを作成
random_weight_ranker = Function(
    name="boost",
    input_field_names=[], # 空のリストでなければなりません
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "random_score": {
            "seed": 126,
        },
        "weight": 0.4
    }
)

# 関数スコアを作成
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

# 作成された関数スコアを使用した類似性検索を実行
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

SearchResp searchReq = client.search(SearchReq.builder()
                 .collectionName("my_collection")
                 .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
                 .annsField("vector")
                 .outputFields(Collections.singletonList("doctype"))
                 .addFunction(ranker)
                 .build());
SearchResp searchResp = client.search(searchReq);
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

const fix_weight_ranker = {
  name: "boost",
  input_field_names: [],
  type: FunctionType.RERANK,
  params: {
    reranker: "boost",
    weight: 0.8,
  },
};

const random_weight_ranker = {
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
  functions: [fix_weight_ranker, random_weight_ranker],
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
  output_field: ["doctype"],
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

具体的には、2つのブーストレランカーがあります：1つはすべての見つかったエンティティに固定重みを適用し、もう1つはそれらにランダムな重みを割り当てます。次に、これらの2つのランカーを**FunctionScore**で参照し、見つかったエンティティのスコアに重みがどのように影響するかを定義します。

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
     <td><p>ターゲットランカーの名前をリストで指定します。</p></td>
     <td><p><code>["fix_weight_ranker", "random_weight_ranker"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.boost_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定された重みが一致したエンティティのスコアにどのように影響するかを指定します。</p><p>可能な値は以下の通りです：</p><ul><li><p><code>Multiply</code></p><p>加重値が一致したエンティティの元のスコアに指定された重みをかけた値に等しいことを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>加重値が一致したエンティティの元のスコアと指定された重みの合計に等しいことを示します</p></li></ul></td>
     <td><p><code>"Sum"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>さまざまなブーストレランカーから得られた加重値がどのように処理されるかを指定します。</p><p>可能な値は以下の通りです：</p><ul><li><p><code>Multiply</code></p><p>一致したエンティティの最終スコアがすべてのブーストレランカーからの加重値の積に等しいことを示します。<p>これがデフォルト値です。</p></p></li><li><p><code>Sum</code></p><p>一致したエンティティの最終スコアがすべてのブーストレランカーからの加重値の合計に等しいことを示します。</p></li></ul></td>
     <td><p><code>"Sum"</code></p></td>
   </tr>
</table>