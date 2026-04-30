---
title: "Boost Ranker | BYOC"
slug: /boost-ranker
sidebar_key: boost-ranker
sidebar_label: "Boost Ranker"
beta: FALSE
notebook: FALSE
description: "ベクトル距離に基づいて計算された意味的類似性のみに依存するのではなく、Boost Ranker を使用することで、検索結果に有意義な影響を与えることができます。これは、メタデータフィルタリングを使用して検索結果を迅速に調整する場合に最適です。| BYOC"
type: origin
token: Qa60w2vDuiqNk0kclKLcZ0uQnkg
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - 検索結果の再ランキング
  - 結果の再ランキング
  - boost
  - boost ranker

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Boost Ranker

ベクトル距離に基づいて計算された意味的類似性のみに依存するのではなく、Boost Ranker を使用することで、検索結果に有意義な影響を与えることができます。これは、メタデータフィルタリングを使用して検索結果を迅速に調整する場合に理想的です。

検索リクエストに Boost Ranker 関数が含まれている場合、Milvus は関数内のオプションのフィルタリング条件を使用して検索結果候補の中から一致するものを見つけ、指定された重みを適用してそれらのスコアを引き上げます。これにより、最終結果において一致したエンティティのランキングを促進または降格させることができます。

## Boost Ranker の使用時期\{#when-to-use-boost-ranker}

クロスエンコーダーモデルや融合アルゴリズムに依存する他のランカーとは異なり、Boost Ranker はランキングプロセスにオプションのメタデータ駆動型ルールを直接注入するため、以下のシナリオにより適しています。

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>Boost Ranker が効果的な理由</p></th>
   </tr>
   <tr>
     <td><p>ビジネス主導のコンテンツ優先順位付け</p></td>
     <td><ul><li><p>E コマースの検索結果でプレミアム製品を強調表示する</p></li><li><p>ユーザーエンゲージメント指標（閲覧数、いいね、シェアなど）が高いコンテンツの可視性を高める</p></li><li><p>時間制約のある検索アプリケーションで最新のコンテンツを上位に表示する</p></li><li><p>認証済みまたは信頼できるソースからのコンテンツを優先する</p></li><li><p>正確なフレーズや関連性の高いキーワードに一致する結果を促進する</p></li></ul></td>
     <td rowspan="2"><p>インデックスの再構築やベクトル埋め込みモデルの変更（これらは時間のかかる作業です）を行う必要なく、リアルタイムでオプションのメタデータフィルタを適用することにより、検索結果内の特定のアイテムを即座に促進または降格させることができます。この仕組みにより、変化するビジネス要件に容易に適応できる柔軟で動的な検索ランキングが可能になります。</p></td>
   </tr>
   <tr>
     <td><p>戦略的なコンテンツの降格</p></td>
     <td><ul><li><p>在庫が少ないアイテムの目立たせ方を減らす（ただし完全に削除はしない）</p></li><li><p>検閲を行わずに、問題のある用語を含む可能性のあるコンテンツのランクを下げる</p></li><li><p>技術検索ではアクセス可能にしたまま、古いドキュメントのランクを下げる</p></li><li><p>マーケットプレイス検索において競合他社の製品の可視性を微妙に下げる</p></li><li><p>品質が低いことを示す指標（フォーマットの問題、長さ不足など）を持つコンテンツの関連性を低下させる</p></li></ul></td>
   </tr>
</table>

また、複数の Boost Ranker を組み合わせて、より動的で堅牢な重みベースのランキング戦略を実装することもできます。

## Boost Ranker の仕組み\{#mechanism-of-boost-ranker}

以下の図は、Boost Ranker の主なワークフローを示しています。

![Hq0awfjC7h0Ty3bvsUEcasOHncb](https://zdoc-images.s3.us-west-2.amazonaws.com/Hq0awfjC7h0Ty3bvsUEcasOHncb.png)

データを挿入すると、Zilliz Cloud はそれをセグメントに分散します。検索時には、各セグメントが一連の候補を返し、Zilliz Cloud はすべてのセグメントからこれらの候補をランキングして最終結果を生成します。検索リクエストに Boost Ranker が含まれている場合、Zilliz Cloud は精度の低下を防ぎ、再現率を向上させるために、各セグメントからの候補結果にそれを適用します。

結果を確定する前に、Milvus は Boost Ranker を使用してこれらの候補を以下のように処理します。

1. Boost Ranker で指定されたオプションのフィルタリング式を適用して、式に一致するエンティティを特定します。

1. Boost Ranker で指定された重みを適用して、特定されたエンティティのスコアを引き上げます。

<Admonition type="info" icon="📘" title="Notes">

<p>Boost Ranker はマルチベクトルハイブリッド検索では使用できません。</p>

</Admonition>

## Boost Ranker の例\{#examples-of-boost-ranker}

以下の例は、最も関連性の高い 5 つのエンティティを返す必要があり、abstract ドキュメントタイプのエンティティのスコアに重みを追加する単一ベクトル検索における Boost Ranker の使用を示しています。

1. **セグメント内で検索結果候補を収集します。** 

    以下の表は、Milvus がエンティティを 2 つのセグメント（**0001** および **0002**）に分散し、各セグメントが 5 つの候補を返すと仮定しています。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>DocType</p></th>
         <th><p>Score</p></th>
         <th><p>Rank</p></th>
         <th><p>segment</p></th>
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

1. **Boost Ranker で指定されたフィルタリング式を適用します** (`doctype='abstract'`)。

    以下の表の `DocType` フィールドに示されているように、Milvus は `doctype` が `abstract` に設定されているすべてのエンティティをマークし、さらなる処理を行います。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>DocType</p></th>
         <th><p>Score</p></th>
         <th><p>Rank</p></th>
         <th><p>segment</p></th>
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

1. **Boost Ranker で指定された重みを適用します** (`weight=0.5`)。

    前のステップで特定されたすべてのエンティティは、Boost Ranker で指定された重数を乗算され、その結果としてランクが変更されます。

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>DocType</p></th>
         <th><p>Score</p></th>
         <th><p>Weighted Score </p><p>(= score x weight)</p></th>
         <th><p>Rank</p></th>
         <th><p>segment</p></th>
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

    <Admonition type="info" icon="📘" title="Notes">

    <p>重みは任意に選択する浮動小数点数である必要があります。上記の例のように、スコアが小さいほど関連性が高い場合は、**1** より小さい重みを使用してください。それ以外の場合は、**1** より大きい重みを使用してください。</p>

    </Admonition>

1. **重み付きスコアに基づいて、すべてのセグメントからの候補を集約し、結果を確定します。**

    <table>
       <tr>
         <th><p>ID</p></th>
         <th><p>DocType</p></th>
         <th><p>Score</p></th>
         <th><p>Weighted Score</p></th>
         <th><p>Rank</p></th>
         <th><p>segment</p></th>
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

## Boost Ranker の使用方法\{#usage-of-boost-ranker}

このセクションでは、Boost Ranker を使用して単一ベクトル検索の結果に影響を与える方法の例を示します。

### Boost Ranker の作成\{#create-a-boost-ranker}

検索リクエストの reranker として Boost Ranker を渡す前に、以下のように Boost Ranker をランキング関数として適切に定義する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

rerank = Function(
    name="boost",
    input_field_names=[], # Must be an empty list
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

BoostRanker rerank = BoostRanker.builder()
        .name("boost")
        .filter("doctype == \"abstract\"")
        .weight(5.0f)
        .randomScoreField("id")
        .randomScoreSeed(126)
        .build();
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```javascript
import {FunctionType} from '@zilliz/milvus2-sdk-node';

const rerank = {
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

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>必須ですか？</p></th>
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
     <td><p>関数を適用するベクトルフィールドのリスト（Boost Ranker の場合は空である必要があります）</p></td>
     <td><p><code>[]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す関数のタイプ。再ランキング戦略を指定するには <code>RERANK</code> を使用します</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>再ランカーのタイプを指定します。</p><p>Boost Ranker を使用するには、<code>boost</code> に設定する必要があります。</p></td>
     <td><p><code>"boost"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.weight</code></p></td>
     <td><p>はい</p></td>
     <td><p>生の検索結果内の一致するエンティティのスコアに掛けられる重みを指定します。</p><p>値は浮動小数点数である必要があります。</p><ul><li><p>一致するエンティティの重要性を強調するには、スコアをブーストする値に設定します。</p></li><li><p>一致するエンティティを降格させるには、このパラメータにスコアを下げる値を割り当てます。</p></li></ul></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.filter</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>検索結果のエンティティの中からエンティティをマッチさせるために使用されるフィルター式を指定します。<a href="./filtering-overview">フィルタリングの説明</a>に記載されている任意の有効な基本フィルター式を使用できます。</p><p><strong>注</strong>：<code>==</code>、<code>&gt;</code>、または <code>&lt;</code> などの基本演算子のみを使用してください。<code>text_match</code> や <code>phrase_match</code> などの高度な演算子を使用すると、検索パフォーマンスが低下します。</p></td>
     <td><p><code>"doctype == 'abstract'"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.random_score</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>0</code> から <code>1</code> の間の値をランダムに生成するランダム関数を指定します。次の 2 つのオプション引数があります：</p><ul><li><p><code>seed</code> (数値) 擬似乱数生成器 (PRNG) を開始するために使用される初期値を指定します。</p></li><li><p><code>field</code> (文字列) 乱数生成におけるランダム因子として使用されるフィールドの名前を指定します。一意の値を持つフィールドで十分です。</p><p>同じシード値とフィールド値を使用して世代間の一貫性を確保するため、<code>seed</code> と <code>field</code> の両方を設定することをお勧めします。</p></li></ul></td>
     <td><p><code>\{"seed": 126, "field": "id"\}</code></p></td>
   </tr>
</table>

### 単一の Boost Ranker を使用した検索\{#search-with-a-single-boost-ranker}

Boost Ranker 関数の準備が整ったら、検索リクエストでそれを参照できます。以下の例では、**id**、**vector**、および **doctype** というフィールドを持つコレクションがすでに作成されていることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Connect to the Milvus server
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Assume you have a collection set up

# Conduct a similarity search using the created ranker
client.search(
    collection_name="my_collection",
    data=[[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
    anns_field="vector",
    params={},
    output_field=["doctype"],
    ranker=rerank
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
                .addFunction(rerank)
                .build())
        .build());
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// Connect to the Milvus server
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

// Assume you have a collection set up

// Conduct a similarity search
const searchResults = await client.search({
  collection_name: 'my_collection',
  data: [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911],
  anns_field: 'vector',
  output_fields: ['doctype'],
  rerank: rerank,
});

console.log('Search results:', searchResults);
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

### Search with multiple Boost Rankers\{#search-with-multiple-boost-rankers}

単一の検索で複数の Boost Ranker を組み合わせて、検索結果に影響を与えることができます。これを行うには、複数の Boost Ranker を作成し、**FunctionScore** インスタンスでそれらを参照して、検索リクエストのランカーとして **FunctionScore** インスタンスを使用します。

以下の例では、**0.8** から **1.2** の間の重みを適用することで、特定されたすべてのエンティティのスコアを変更する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, Function, FunctionType, FunctionScore

# Create a Boost Ranker with a fixed weight
fix_weight_ranker = Function(
    name="boost",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "weight": 0.8
    }
)

# Create a Boost Ranker with a randomly generated weight between 0 and 0.4
random_weight_ranker = Function(
    name="boost",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "random_score": {
            "seed": 126,
        },
        "weight": 0.4
    }
)

# Create a Function Score
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

# Conduct a similarity search using the created Function Score
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
                 .build()

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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

具体的には、2 つの Boost Ranker があります。一方は検出されたすべてのエンティティに固定の重みを適用し、もう一方はランダムな重みを割り当てます。その後、これらの 2 つのランカーを **FunctionScore** で参照し、重みが検出されたエンティティのスコアにどのように影響するかを定義します。

以下の表は、**FunctionScore** インスタンスを作成するために必要なパラメータの一覧です。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>必須ですか？</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>functions</code></p></td>
     <td><p>はい</p></td>
     <td><p>対象となるランカーの名前をリストで指定します。</p></td>
     <td><p><code>["fix_weight_ranker", "random_weight_ranker"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.boost_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定された重みが一致するエンティティのスコアにどのように影響するかを指定します。</p><p>可能な値は次のとおりです。</p><ul><li><p><code>Multiply</code></p><p>重み付きの値が、一致するエンティティの元のスコアに指定された重みを掛けたものに等しいことを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>重み付きの値が、一致するエンティティの元のスコアと指定された重みの和に等しいことを示します。</p></li></ul></td>
     <td><p><code>"Sum"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>さまざまな Boost Ranker からの重み付き値をどのように処理するかを指定します。</p><p>可能な値は次のとおりです。</p><ul><li><p><code>Multiply</code></p><p>一致するエンティティの最終スコアが、すべての Boost Ranker からの重み付き値の積に等しいことを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>一致するエンティティの最終スコアが、すべての Boost Ranker からの重み付き値の和に等しいことを示します。</p></li></ul></td>
     <td><p><code>"Sum"</code></p></td>
   </tr>
</table>

