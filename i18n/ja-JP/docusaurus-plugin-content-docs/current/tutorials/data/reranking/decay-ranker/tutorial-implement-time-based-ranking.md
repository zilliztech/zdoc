---
title: "チュートリアル：時間ベースのランク付けの実装 | Cloud"
slug: /tutorial-implement-time-based-ranking
sidebar_label: "チュートリアル：時間ベースのランク付けの実装"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "多くの検索アプリケーションでは、コンテンツの新鮮さが関連性と同様に重要です。ニュース記事、商品リスト、SNS投稿、研究論文はすべて、意味的な関連性と新鮮さをバランスさせるランク付けシステムの恩益を受けます。このチュートリアルでは、Zilliz Cloudで減衰ランカーを使用して時間ベースのランク付けを実装する方法を示します。| Cloud"
type: origin
token: Dj2NwrlqTiYlmDkwfAbcJNWSntd
sidebar_position: 5
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - 検索結果の再ランク付け
  - 結果の再ランク付け
  - 減衰
  - 減衰ランカー
  - チュートリアル
  - 時間ベースのランク付け
  - 情報検索
  - 次元削減
  - hnsw アルゴリズム
  - ベクトル類似度検索

---

import Admonition from '@theme/Admonition';


# チュートリアル：時間ベースのランク付けの実装

多くの検索アプリケーションでは、コンテンツの新鮮さが関連性と同様に重要です。ニュース記事、商品リスト、SNS投稿、研究論文はすべて、意味的な関連性と新鮮さをバランスさせるランク付けシステムの恩益を受けます。このチュートリアルでは、Zilliz Cloudで減衰ランカーを使用して時間ベースのランク付けを実装する方法を示します。

## 減衰ランカーの理解\{#understand-decay-rankers}

減衰ランカーを使用すると、参照点に対する数値（タイムスタンプなど）に基づいてドキュメントをブーストまたはペナルティできます。時間ベースのランク付けでは、意味的な関連性が似ている場合でも、新しいドキュメントが古いドキュメントより高スコアを獲得できます。

Zilliz Cloudは3種類の減衰ランカーをサポートしています：

- **ガウス** (`gauss`)：滑らかで徐々に減衰するベル型曲線

- **指数** (`exp`)：最近のコンテンツを強く強調するために鋭い初期ドロップオフを作成

- **線形** (`linear`)：予測可能で理解しやすい直線的な減衰

各ランカーには異なる特徴があり、さまざまな使用例に適しています。詳細については、[減衰ランカー概要](./decay-ranker-oveview)を参照してください。

## 時間認識検索システムの構築\{#build-a-time-aware-search-system}

関連性と時間の両方に基づいてコンテンツを効果的にランク付けする方法を示すニュース記事検索システムを作成します。実装から始めましょう：

```python
import datetime
import matplotlib.pyplot as plt
import numpy as np
from pymilvus import (
    MilvusClient,
    DataType,
    Function,
    FunctionType,
    AnnSearchRequest,
)

# Milvusへの接続を作成
milvus_client = MilvusClient("YOUR_CLUSTER_ENDPOINT")

# コレクション名を定義
collection_name = "news_articles_tutorial"

# 同じ名前の既存のコレクションをクリーンアップ
milvus_client.drop_collection(collection_name)
```

## ステップ1：スキーマの設計\{#step-1-design-the-schema}

時間ベースの検索では、コンテンツと一緒に公開タイムスタンプを保存する必要があります：

```python
# コンテンツと時間情報のフィールドを持つスキーマを作成
schema = milvus_client.create_schema(enable_dynamic_field=False, auto_id=True)
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("headline", DataType.VARCHAR, max_length=200, enable_analyzer=True)
schema.add_field("content", DataType.VARCHAR, max_length=2000, enable_analyzer=True)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1024)  # 密な埋め込み用
schema.add_field("sparse_vector", DataType.SPARSE_FLOAT_VECTOR)  # スパース（BM25）検索用
schema.add_field("publish_date", DataType.INT64)  # 減衰ランク付け用タイムスタンプ
```

## ステップ2：埋め込み関数の設定\{#step-2-set-up-embedding-functions}

密（セマンティック）とスパース（キーワード）の両方の埋め込み関数を設定します：

```python
# セマンティック検索用の埋め込み関数を作成
text_embedding_function = Function(
    name="siliconflow_embedding",
    function_type=FunctionType.TEXTEMBEDDING,
    input_field_names=["content"],
    output_field_names=["dense"],
    params={
        "provider": "siliconflow",
        "model_name": "BAAI/bge-large-en-v1.5",
        "credential": "your-api-key"
    }
)
schema.add_function(text_embedding_function)

# キーワード検索用のBM25関数を作成
bm25_function = Function(
    name="bm25",
    input_field_names=["content"],
    output_field_names=["sparse_vector"],
    function_type=FunctionType.BM25,
)
schema.add_function(bm25_function)
```

## ステップ3：インデックスパラメータの構成\{#step-3-configure-index-parameters}

高速ベクトル検索のための適切なインデックスパラメータを設定しましょう：

```python
# 高速検索のためのインデックスを設定
index_params = milvus_client.prepare_index_params()

# 密ベクトルインデックス
index_params.add_index(field_name="dense", index_type="AUTOINDEX", metric_type="L2")

# スパースベクトルインデックス
index_params.add_index(
    field_name="sparse_vector",
    index_name="sparse_inverted_index",
    index_type="AUTOINDEX",
    metric_type="BM25",
)

# スキーマとインデックスを持つコレクションを作成
milvus_client.create_collection(
    collection_name,
    schema=schema,
    index_params=index_params,
    consistency_level="Strong"
)
```

## ステップ4：サンプルデータの準備\{#step-4-prepare-sample-data}

このチュートリアルでは、異なる公開日を持つニュース記事セットを作成します。減衰ランク付け効果を明確に示すために、ほぼ同じ内容だが日付の異なる記事ペアを含めていることに注意してください：

```python
# 現在時刻を取得
current_time = int(datetime.datetime.now().timestamp())
current_date = datetime.datetime.fromtimestamp(current_time)
print(f"現在時刻: {current_date.strftime('%Y-%m-%d %H:%M:%S')}")

# 違う日付にわたるサンプルニュース記事
articles = [
    {
        "headline": "AIの画期的な進歩が医療診断の向上を可能に",
        "content": "研究者たちは、AIベースの医療診断で画期的な進歩を発表し、稀な病気のより迅速かつ正確な検出を可能にしました。",
        "publish_date": int((current_date - datetime.timedelta(days=120)).timestamp())  # 約4か月前
    },
    {
        "headline": "テック大手が新しいAI競争で競う",
        "content": "主要なテクノロジー企業は、最も高度な人工知能システムを開発するための新しい競争に何十億ドルも投資しています。",
        "publish_date": int((current_date - datetime.timedelta(days=60)).timestamp())  # 約2か月前
    },
    {
        "headline": "国際機関がAI倫理ガイドラインを発表",
        "content": "国際的な団体のコンソーシアムが、人工知能の開発と展開における倫理的懸念に対処する新しいガイドラインを発表しました。",
        "publish_date": int((current_date - datetime.timedelta(days=30)).timestamp())  # 1か月前
    },
    {
        "headline": "最新のディープラーニングモデルが顕著な進歩を示す",
        "content": "最新世代のディープラーニングモデルは、言語理解と生成において前例のない能力を示しています。",
        "publish_date": int((current_date - datetime.timedelta(days=15)).timestamp())  # 15日前
    },
    # 同じ内容だが異なる日付の記事
    {
        "headline": "1月に公開されたAI研究の進歩",
        "content": "人工知能の画期的な研究は、複数の分野で顕著な進歩を示しています。",
        "publish_date": int((current_date - datetime.timedelta(days=90)).timestamp())  # 約3か月前
    },
    {
        "headline": "今週公開された新しいAI研究結果",
        "content": "人工知能の画期的な研究は、複数の分野で顕著な進歩を示しています。",
        "publish_date": int((current_date - datetime.timedelta(days=5)).timestamp())  # 非常に最近 - 5日前
    },
    {
        "headline": "昨日公開されたAI開発の更新情報",
        "content": "人工知能研究の最近の発展は、さまざまなアプリケーションで有望な結果を示しています。",
        "publish_date": int((current_date - datetime.timedelta(days=1)).timestamp())  # たった1日前
    },
]

# 記事をコレクションに挿入
milvus_client.insert(collection_name, articles)
print(f"{len(articles)}件の記事をコレクションに挿入しました")
```

## ステップ5：異なる減衰ランカーの構成\{#step-5-configure-different-decay-rankers}

それでは、異なるパラメータを持つ3つの異なる減衰ランカーを作成し、それらの違いを強調しましょう：

```python
# 現在時刻を参照点として使用
print(f"現在時刻を参照点として使用します")

# ガウス減衰ランカーを作成
gaussian_ranker = Function(
    name="time_decay_gaussian",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "gauss",           # ガウス/ベル曲線減衰
        "origin": current_time,        # 参照点として現在時刻
        "offset": 7 * 24 * 60 * 60,    # 1週間（完全な関連性）
        "decay": 0.5,                  # 2週間前の記事は関連性が半分
        "scale": 14 * 24 * 60 * 60     # 2週間のスケールパラメータ
    }
)

# 異なるパラメータを持つ指数減衰ランカーを作成
exponential_ranker = Function(
    name="time_decay_exponential",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "exp",             # 指数減衰
        "origin": current_time,        # 参照点として現在時刻
        "offset": 3 * 24 * 60 * 60,    # 短いオフセット（7日vs3日）
        "decay": 0.3,                  # より急な減衰（0.5vs0.3）
        "scale": 10 * 24 * 60 * 60     # 異なるスケール（14日vs10日）
    }
)

# 線形減衰ランカーを作成
linear_ranker = Function(
    name="time_decay_linear",
    input_field_names=["publish_date"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "decay",
        "function": "linear",          # 線形減衰
        "origin": current_time,        # 参照点として現在時刻
        "offset": 7 * 24 * 60 * 60,    # 1週間（完全な関連性）
        "decay": 0.5,                  # 2週間前の記事は関連性が半分
        "scale": 14 * 24 * 60 * 60     # 2週間のスケールパラメータ
    }
)
```

前述のコードでは：

- `reranker`: 時間ベースの減衰関数の場合、`decay`に設定

- `function`: 減衰関数のタイプ（gauss、exp、linear）

- `origin`: 参照点（通常は現在時刻）

- `offset`: ドキュメントが完全な関連性を維持する期間

- `scale`: オフセットを超えて関連性がどれだけ速く減少するかを制御

- `decay`: オフセット+スケールでの減衰係数（例：0.5は関連性が半分）

これらの異なるパラメータで指数ランカーを構成して、これらの関数を異なる動作のために調整できることを示していることに注意してください。

## ステップ6：減衰ランカーの可視化\{#step-6-visualize-the-decay-rankers}

検索を実行する前に、これらの異なる構成の減衰ランカーがどのように動作するかを視覚的な比較を作成しましょう：

```python
# 異なるパラメータを持つ減衰関数を可視化
days = np.linspace(0, 90, 100)
# ガウス: offset=7, scale=14, decay=0.5
gaussian_values = [1.0 if d <= 7 else (0.5 ** ((d - 7) / 14)) for d in days]
# 指数: offset=3, scale=10, decay=0.3
exponential_values = [1.0 if d <= 3 else (0.3 ** ((d - 3) / 10)) for d in days]
# 線形: offset=7, scale=14, decay=0.5
linear_values = [1.0 if d <= 7 else max(0, 1.0 - ((d - 7) / 14) * 0.5) for d in days]

plt.figure(figsize=(10, 6))
plt.plot(days, gaussian_values, label='ガウス (offset=7, scale=14, decay=0.5)')
plt.plot(days, exponential_values, label='指数 (offset=3, scale=10, decay=0.3)')
plt.plot(days, linear_values, label='線形 (offset=7, scale=14, decay=0.5)')
plt.axhline(y=0.5, color='gray', linestyle='--', alpha=0.5, label='半分の関連性')
plt.xlabel('何日前')
plt.ylabel('関連性係数')
plt.title('減衰関数の比較')
plt.legend()
plt.grid(True)
plt.savefig('decay_functions.png')
plt.close()

# 数値表現を印刷
print("\n=== 時間減衰効果の可視化 ===")
print("何日前 | ガウス | 指数 | 線形")
print("-----------------------------------------")
for days in [0, 3, 7, 10, 14, 21, 30, 60, 90]:
    # 我々のランカーのパラメータに基づいて減衰係数を計算
    gaussian_decay = 1.0 if days <= 7 else (0.5 ** ((days - 7) / 14))
    exponential_decay = 1.0 if days <= 3 else (0.3 ** ((days - 3) / 10))
    linear_decay = 1.0 if days <= 7 else max(0, 1.0 - ((days - 7) / 14) * 0.5)

    print(f"{days:2d}日 | {gaussian_decay:.4f}   | {exponential_decay:.4f}     | {linear_decay:.4f}")
```

期待される出力：

```python
=== 時間減衰効果の可視化 ===
何日前 | ガウス | 指数 | 線形
-----------------------------------------
 0日 | 1.0000   | 1.0000     | 1.0000
 3日 | 1.0000   | 1.0000     | 1.0000
 7日 | 1.0000   | 0.6178     | 1.0000
10日 | 0.8620   | 0.4305     | 0.8929
14日 | 0.7071   | 0.2660     | 0.7500
21日 | 0.5000   | 0.1145     | 0.5000
30日 | 0.3202   | 0.0387     | 0.1786
60日 | 0.0725   | 0.0010     | 0.0000
90日 | 0.0164   | 0.0000     | 0.0000
```

## ステップ7：結果表示用ヘルパー関数\{#step-7-helper-function-for-results-display}

```python
# 日付とスコアで検索結果をフォーマットするヘルパー関数
def print_search_results(results, title):
    print(f"\n=== {title} ===")
    for i, hit in enumerate(results[0]):
        publish_date = datetime.datetime.fromtimestamp(hit.get('publish_date'))
        days_from_now = (current_time - hit.get('publish_date')) / (24 * 60 * 60)

        print(f"{i+1}. {hit.get('headline')}")
        print(f"   公開日: {publish_date.strftime('%Y-%m-%d')} ({int(days_from_now)}日前)")
        print(f"   スコア: {hit.score:.4f}")
        print()
```

## ステップ8：標準 vs 減衰ベースの検索の比較\{#step-8-compare-standard-vs-decay-based-search}

では、検索クエリを実行して、減衰ランク付けありとなしの結果を比較しましょう：

```python
# 検索クエリを定義
query = "artificial intelligence advancements"

# 1. 減衰ランク付けなしで検索（純粋にセマンティック関連性に基づく）
standard_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,  # 記事をすべて取得
    output_fields=["headline", "content", "publish_date"],
    consistency_level="Strong"
)
print_search_results(standard_results, "減衰ランク付けなしの検索結果")

# 後の比較のために元のスコアを保存
original_scores = {}
for hit in standard_results[0]:
    original_scores[hit.get('headline')] = hit.score

# 2. 各減衰関数で検索
# ガウス減衰
gaussian_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=gaussian_ranker,
    consistency_level="Strong"
)
print_search_results(gaussian_results, "ガウス減衰ランク付け付きの検索結果")

# 指数減衰
exponential_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=exponential_ranker,
    consistency_level="Strong"
)
print_search_results(exponential_results, "指数減衰ランク付け付きの検索結果")

# 線形減衰
linear_results = milvus_client.search(
    collection_name,
    data=[query],
    anns_field="dense",
    limit=7,
    output_fields=["headline", "content", "publish_date"],
    ranker=linear_ranker,
    consistency_level="Strong"
)
print_search_results(linear_results, "線形減衰ランク付け付きの検索結果")
```

期待される出力：

```python
=== 減衰ランク付けなしの検索結果 ===
1. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.3670

2. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.4315

3. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.4316

4. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.6671

5. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.6674

6. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.7279

7. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.7661

=== ガウス減衰ランク付け付きの検索結果 ===
1. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.5322

2. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.4316

3. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.3670

4. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.1180

5. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.0000

6. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0000

7. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.0000

=== 指数減衰ランク付け付きの検索結果 ===
1. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.3670

2. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.3392

3. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.1574

4. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.0297

5. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.0007

6. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0000

7. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.0000

=== 線形減衰ランク付け付きの検索結果 ===
1. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.4767

2. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.4316

3. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.3831

4. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.3670

5. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.3640

6. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.3335

7. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.2158
```

## ステップ9：スコア計算の理解\{#step-9-understand-score-calculation}

元の関連性と減衰係数を組み合わせて最終スコアがどのように計算されるかを分解しましょう：

```python
# ガウス減衰の最初の3つの結果の詳細な内訳を追加
print("\n=== スコア計算の内訳（ガウス減衰） ===")
for item in gaussian_results[0][:3]:
    headline = item.get('headline')
    publish_date = datetime.datetime.fromtimestamp(item.get('publish_date'))
    days_ago = (current_time - item.get('publish_date')) / (24 * 60 * 60)

    # 元のスコアを取得
    original_score = original_scores.get(headline, 0)

    # 減衰係数を計算
    decay_factor = 1.0 if days_ago <= 7 else (0.5 ** ((days_ago - 7) / 14))

    # 内訳を表示
    print(f"アイテム: {headline}")
    print(f"  公開日: {publish_date.strftime('%Y-%m-%d')} ({int(days_ago)}日前)")
    print(f"  元の関連性スコア: {original_score:.4f}")
    print(f"  減衰係数（ガウス）: {decay_factor:.4f}")
    print(f"  予想最終スコア = 元 × 減衰: {original_score * decay_factor:.4f}")
    print(f"  実際の最終スコア: {item.score:.4f}")
    print()
```

期待される出力：

```python
=== スコア計算の内訳（ガウス減衰） ===
アイテム: 最新のディープラーニングモデルが顕著な進歩を示す
  公開日: 2025-04-30 (15日前)
  元の関連性スコア: 0.6674
  減衰係数（ガウス）: 0.6730
  予想最終スコア = 元 × 減衰: 0.4491
  実際の最終スコア: 0.5322

アイテム: 今週公開された新しいAI研究結果
  公開日: 2025-05-10 (5日前)
  元の関連性スコア: 0.4316
  減衰係数（ガウス）: 1.0000
  予想最終スコア = 元 × 減衰: 0.4316
  実際の最終スコア: 0.4316

アイテム: 昨日公開されたAI開発の更新情報
  公開日: 2025-05-14 (1日前)
  元の関連性スコア: 0.3670
  減衰係数（ガウス）: 1.0000
  予想最終スコア = 元 × 減衰: 0.3670
  実際の最終スコア: 0.3670
```

## ステップ10：時間減衰付きハイブリッド検索\{#step-10-hybrid-search-with-time-decay}

より複雑なシナリオでは、ハイブリッド検索を使用して密（セマンティック）とスパース（キーワード）のベクトルを組み合わせることができます：

```python
# ハイブリッド検索の設定（密とスパースのベクトルを組み合わせる）
dense_search = AnnSearchRequest(
    data=[query],
    anns_field="dense",  # 密ベクトルを検索
    param={},
    limit=7
)

sparse_search = AnnSearchRequest(
    data=[query],
    anns_field="sparse_vector",  # スパースベクトル（BM25）を検索
    param={},
    limit=7
)

# 各減衰関数でハイブリッド検索を実行
# ガウス減衰
hybrid_gaussian_results = milvus_client.hybrid_search(
    collection_name,
    [dense_search, sparse_search],
    ranker=gaussian_ranker,
    limit=7,
    output_fields=["headline", "content", "publish_date"]
)
print_search_results(hybrid_gaussian_results, "ガウス減衰ランク付け付きのハイブリッド検索結果")

# 指数減衰
hybrid_exponential_results = milvus_client.hybrid_search(
    collection_name,
    [dense_search, sparse_search],
    ranker=exponential_ranker,
    limit=7,
    output_fields=["headline", "content", "publish_date"]
)
print_search_results(hybrid_exponential_results, "指数減衰ランク付け付きのハイブリッド検索結果")
```

期待される出力：

```python
=== ガウス減衰ランク付け付きのハイブリッド検索結果 ===
1. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 2.1467

2. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.7926

3. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.5322

4. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.1180

5. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.0000

6. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0000

7. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.0000

=== 指数減衰ランク付け付きのハイブリッド検索結果 ===
1. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 1.6873

2. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.7926

3. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.1574

4. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.0297

5. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.0007

6. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0001

7. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.0000
```

## ステップ11：異なるパラメータ値の実験\{#step-11-experiment-with-different-parameter-values}

スケールパラメータを調整するとガウス減衰関数にどう影響するかを見てみましょう：

```python
# 異なるスケールパラメータを持つガウス減衰関数の変形を作成
print("\n=== パラメータ変形実験: スケール ===")
for scale_days in [7, 14, 30]:
    scaled_ranker = Function(
        name=f"time_decay_gaussian_{scale_days}",
        input_field_names=["publish_date"],
        function_type=FunctionType.RERANK,
        params={
            "reranker": "decay",
            "function": "gauss",
            "origin": current_time,
            "offset": 7 * 24 * 60 * 60,  # 7日間の固定オフセット
            "decay": 0.5,                # 0.5の固定減衰
            "scale": scale_days * 24 * 60 * 60  # 可変スケール
        }
    )

    # 結果を取得
    scale_results = milvus_client.search(
        collection_name,
        data=[query],
        anns_field="dense",
        limit=7,
        output_fields=["headline", "content", "publish_date"],
        ranker=scaled_ranker,
        consistency_level="Strong"
    )

    print_search_results(scale_results, f"スケール = {scale_days} 日でのガウス減衰検索")
```

期待される出力：

```python
=== パラメータ変形実験: スケール ===

=== スケール = 7 日でのガウス減衰検索 ===
1. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.4316

2. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.3670

3. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.2699

4. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.0004

5. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.0000

6. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0000

7. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.0000

=== スケール = 14 日でのガウス減衰検索 ===
1. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.5322

2. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.4316

3. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.3670

4. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.1180

5. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.0000

6. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0000

7. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.0000

=== スケール = 30 日でのガウス減衰検索 ===
1. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.6353

2. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.5097

3. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.4316

4. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.3670

5. テック大手が新しいAI競争で競う
   公開日: 2025-03-16 (60日前)
   スコア: 0.0767

6. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0021

7. AIの画期的な進歩が医療診断の向上を可能に
   公開日: 2025-01-15 (120日前)
   スコア: 0.0000
```

## ステップ12：異なるクエリでのテスト\{#step-12-testing-with-different-queries}

減衰ランク付けが異なる検索クエリでどのように動作するかを見てみましょう：

```python
# ガウス減衰で異なるクエリを試す
for test_query in ["machine learning", "neural networks", "ethics in AI"]:
    print(f"\n=== ガウス減衰でのクエリテスト: '{test_query}' ===")
    test_results = milvus_client.search(
        collection_name,
        data=[test_query],
        anns_field="dense",
        limit=4,
        output_fields=["headline", "content", "publish_date"],
        ranker=gaussian_ranker,
        consistency_level="Strong"
    )
    print_search_results(test_results, f"'{test_query}'の上位4件の結果")
```

期待される出力：

```python
=== ガウス減衰でのクエリテスト: 'machine learning' ===

=== 'machine learning'の上位4件の結果 ===
1. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.8208

2. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.7287

3. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.6633

4. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0000

=== ガウス減衰でのクエリテスト: 'neural networks' ===

=== 'neural networks'の上位4件の結果 ===
1. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.8509

2. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.7574

3. 最新のディープラーニングモデルが顕著な進歩を示す
   公開日: 2025-04-30 (15日前)
   スコア: 0.6364

4. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0000

=== ガウス減衰でのクエリテスト: 'ethics in AI' ===

=== 'ethics in AI'の上位4件の結果 ===
1. 今週公開された新しいAI研究結果
   公開日: 2025-05-10 (5日前)
   スコア: 0.7977

2. 昨日公開されたAI開発の更新情報
   公開日: 2025-05-14 (1日前)
   スコア: 0.7322

3. 国際機関がAI倫理ガイドラインを発表
   公開日: 2025-04-15 (30日前)
   スコア: 0.0814

4. 1月に公開されたAI研究の進歩
   公開日: 2025-02-14 (90日前)
   スコア: 0.0000
```

## 結論\{#conclusion}

Milvusでの減衰関数を使用した時間ベースのランク付けは、セマンティック関連性と新鮮さをバランスさせる強力な方法を提供します。適切な減衰関数とパラメータを構成することにより、新鮮なコンテンツを強調しつつセマンティック関連性を尊重する検索体験を作成できます。

このアプローチは特に以下に価値があります：

- ニュースおよびメディアプラットフォーム

- Eコマース商品リスト

- SNSのコンテンツフィード

- 知識ベースおよびドキュメントシステム

- 研究論文リポジトリ

減衰関数の背後にある数学を理解し、異なるパラメータで実験することにより、特定の使用例に対して関連性と新鮮さの最適なバランスを提供するように検索システムを微調整できます。