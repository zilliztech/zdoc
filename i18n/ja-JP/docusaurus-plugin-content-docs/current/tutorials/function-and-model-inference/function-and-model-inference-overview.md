---
title: "関数とモデル推論の概要 | Cloud"
slug: /function-and-model-inference-overview
sidebar_key: function-and-model-inference-overview
sidebar_label: "概要"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、セマンティック検索、語彙検索、ハイブリッド検索、インテリジェントな再ランキングを含む、現代的な検索システムを構築するための統一された検索アーキテクチャを提供します。これらの機能を個別の機能として公開するのではなく、Zilliz Cloud は「関数」という単一のコア抽象概念を中心にそれらを整理しています。| Cloud"
type: origin
token: BanBwAm53iaLimkfLm3cFh0Fncb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 関数
  - モデル
  - 推論
  - 概要

---

import Admonition from '@theme/Admonition';


# Function & Model Inference Overview

Zilliz Cloud は、セマンティック検索、レキシカル検索、ハイブリッド検索、インテリジェントなリランキングを含むモダンな検索システムを構築するための統合された検索アーキテクチャを提供します。これらの機能を個別の機能として公開するのではなく、Zilliz Cloud はそれらを単一のコア抽象化である **Function**（関数）を中心に整理しています。

## What is a Function?\{#what-is-a-function}

Zilliz Cloud において、**Function** とは検索ワークフローの特定の段階で特定の操作を適用する、設定可能な実行ユニットです。

Function は以下の3つの実用的な質問に答えます。

- **この操作はいつ実行されるか？** 検索前または検索後。

- **どのような入力に対して動作するか？** 生のテキスト、ベクトル表現、または取得された候補結果。

- **どのような出力を生成するか？** 検索に使用されるベクトル埋め込み、またはユーザーに返される並べ替え済みの結果。

ワークフローの観点から見ると、Function は検索において次の2つの異なる段階に参加します。

- **検索前**（検索前）: テキストをベクトル表現に変換するために検索前に実行されます。これらのベクトルがどの候補が取得されるかを決定します。

- **検索後**（検索後）: 候補取得後に実行され、候補セットを変更せずに結果の順序を洗練します。

以下の図は、検索ワークフローにおける Function の動作を抽象化したものです。

![HF6JwTJVfhXMmdb3qx3cm2YdnMe](https://zdoc-images.s3.us-west-2.amazonaws.com/HF6JwTJVfhXMmdb3qx3cm2YdnMe.png)

すべての検索リクエストは、同じ高レベルのフローに従います。

1. **検索前 Function** が入力テキストからベクトル表現を生成します。

1. 検索エンジンがこれらのベクトルに基づいて候補結果を取得します。

1. （オプション）**検索後 Function** が取得された候補をリランキングします。

## Function categories\{#function-categories}

Zilliz Cloud の Functions は、**検索ワークフローにおける実行タイミング**と**それらが果たす役割**に基づいて分類されます。高レベルでは、Functions は次の2つのグループに分かれます。

- **検索前 Functions**: テキストをベクトル埋め込みに変換し、候補取得を決定します。

- **検索後 Functions**: 取得された候補の順序を洗練します。

### 検索前 Functions: Convert text to vector embeddings\{#pre-search-functions-convert-text-to-vector-embeddings}

**検索前 Functions** は候補取得**前**に実行されます。その役割は、保存されたドキュメントおよび着信クエリの両方の生テキストを、検索エンジンが関連候補を特定するために使用するベクトル表現に変換することです。

異なる 検索前 Functions は異なるタイプの埋め込みを生成し、それが直接検索の実行方法に影響を与えます。

以下の表は、利用可能な 検索前 Functions をまとめたものです。

<table>
   <tr>
     <th><p>Function Type</p></th>
     <th><p>Vector Type</p></th>
     <th><p>Description</p></th>
     <th><p>Typical Scenarios</p></th>
   </tr>
   <tr>
     <td><p>BM25 Function</p></td>
     <td><p>Sparse embeddings</p></td>
     <td><p>Computes lexical relevance based on term matching, term frequency, and document length normalization.</p><p>Executes entirely within the database engine as a local mechanism; <strong>no <a href="./function-and-model-inference-overview#understand-model-inference">model inference</a> required</strong>.</p></td>
     <td><p>キーword-driven full text search, documentation and code search, and workloads where term matching, low latency, and deterministic behavior are critical.</p></td>
   </tr>
   <tr>
     <td><p>Model-based Embedding Functions</p></td>
     <td><p>Dense embeddings</p></td>
     <td><p>Encodes the semantic meaning of text using machine learning models, enabling similarity-based retrieval beyond exact keywords.</p><p><strong>Requires <a href="./function-and-model-inference-overview#understand-model-inference">model inference</a></strong> via hosted models or third-party model services.</p></td>
     <td><p>セマンティック検索, natural-language queries, Q&A and RAG pipelines, and use cases where conceptual similarity matters more than literal term overlap.</p></td>
   </tr>
</table>

すべての 検索前 Functions は、ドキュメントデータとクエリテキストの両方に一貫して適用され、検索が同じ表現空間内で実行されることを保証します。

### 検索後 Functions: Rerank candidate results\{#post-search-functions-rerank-candidate-results}

検索後 Functions は**候補取得後**に適用されます。その目的は、候補セットからアイテムを追加または削除せずに、**取得された候補のランキングを洗練すること**です。

これらの関数は検索ステージによって返された結果に対してのみ動作し、結果品質を向上させるために追加のランキングロジックや関連性シグナルを適用します。これらはインデックス作成、検索、フィルタリング動作には**影響せず**、結果の最終的な順序にのみ影響を与えます。

以下の表は、利用可能な 検索後 Functions をまとめたものです。

<table>
   <tr>
     <th><p>Function Type</p></th>
     <th><p>Operates On</p></th>
     <th><p>Description</p></th>
     <th><p>Typical Scenarios</p></th>
   </tr>
   <tr>
     <td><p>Hybrid Search Rankers</p></td>
     <td><p>Multiple result sets retrieved from hybrid search</p></td>
     <td><p>Combine and rebalance results retrieved from different retrieval strategies using methods such as <a href="./reranking-weighted-reranker">weighted ranking</a> or <a href="./reranking-rrf">reciprocal rank fusion</a> (RRF).</p></td>
     <td><p>Hybrid search scenarios that combine semantic and lexical retrieval and require balanced result fusion.</p></td>
   </tr>
   <tr>
     <td><p>Rule-based Rankers</p></td>
     <td><p>Candidate results from single-vector or hybrid search</p></td>
     <td><p>Adjust ranking based on predefined rules or numeric signals, such as <a href="./boost-ranker">boosting</a> or <a href="./decay-ranker-oveview">decay-based</a> scoring.</p></td>
     <td><p>Business-driven ranking logic, recency or popularity boosts, and scenarios requiring predictable, non-ML reranking.</p></td>
   </tr>
   <tr>
     <td><p>モデルベースのランカー</p></td>
     <td><p>Candidate results from single-vector or hybrid search</p></td>
     <td><p>Use machine learning models to evaluate relevance and reorder results based on learned or semantic signals.</p></td>
     <td><p>Intelligent reranking, relevance refinement using semantic understanding, and LLM-based relevance evaluation.</p></td>
   </tr>
</table>

検索後 Functions は取得された候補に対してのみ動作するため、これらは結果の順序に影響を与える洗練ステップであり、検索範囲には影響しません。

## Understand model inference\{#understand-model-inference}

Zilliz Cloud の Function ベースのアーキテクチャにおいて、**モデル推論（model inference）は独立した概念や実行ステージではありません**。代わりに、機械学習ベースのシグナルが必要な特定の Function タイプによって使用される実装上の詳細です。

### Where model inference fits in\{#where-model-inference-fits-in}

モデル推論とは、以下のようなセマンティックシグナルを生成するために機械学習モデルを実行時（runtime）に実行することを指します。

- テキストから導出された密なベクトル埋め込み（dense vector embeddings）

- 検索結果のリランキングに使用される関連性スコア

Zilliz Cloud 内では、モデル推論は**モデルベースの関数**によってのみ使用されます。これには以下が含まれます。

- [Model-based 検索前 Functions](./function-and-model-inference-overview#pre-search-functions-convert-text-to-vector-embeddings): 生テキストを密なベクトル埋め込みに変換します。

- [モデルベースのランカー](./function-and-model-inference-overview#post-search-functions-rerank-candidate-results): 関連性を評価し、取得された候補を並べ替えます。

BM25 Function やルールベースのランカーなどの他の Functions はデータベースエンジン内で完全に実行され、**モデル推論を必要としません**。

### Sources of model inference\{#sources-of-model-inference}

Zilliz Cloud はモデル推論のための2つのソースをサポートしています。どちらもモデルベースの機能を提供しますが、モデルのプロビジョニングおよび管理方法が異なります。

<table>
   <tr>
     <th><p>Aspect</p></th>
     <th><p>Hosted Models</p></th>
     <th><p>Third-Party Model Services</p></th>
   </tr>
   <tr>
     <td><p><strong>Where models run</strong></p></td>
     <td><p>Inside Zilliz Cloud</p></td>
     <td><p>External model provider (OpenAI, Voyage AI, etc.)</p></td>
   </tr>
   <tr>
     <td><p><strong>Who manages models</strong></p></td>
     <td><p>Zilliz Cloud</p></td>
     <td><p>External model provider</p></td>
   </tr>
   <tr>
     <td><p><strong>How access is set up</strong></p></td>
     <td><p>See <a href="./hosted-models">Hosted Models</a></p></td>
     <td><p>Through <a href="./integrate-with-model-providers">モデルプロバイダー連携</a> on your own</p></td>
   </tr>
   <tr>
     <td><p><strong>Credentials</strong></p></td>
     <td><p>Provided during onboarding with Zilliz Cloud support</p></td>
     <td><p>Provided by you (for example, API keys)</p></td>
   </tr>
   <tr>
     <td><p><strong>Typical use cases</strong></p></td>
     <td><p>Tightly integrated or customized deployments</p></td>
     <td><p>Using standard models from established providers</p></td>
   </tr>
   <tr>
     <td><p><strong>Setup complexity</strong></p></td>
     <td><p>Higher (requires onboarding)</p></td>
     <td><p>Lower (connect your existing API keys)</p></td>
   </tr>
</table>

**Hosted Models を選択すべき場合**:

- Zilliz Cloud との緊密な統合（単一ベンダー、統合サポート）

- カスタムモデルのファインチューニングや特殊なモデルが必要

- 予測可能なパフォーマンスとレイテンシーが必要

- 認証情報管理を簡素化したい

**Third-Party Model Services を選択すべき場合**:

- すでにモデルプロバイダーとの関係がある

- OpenAI などのプロバイダーが提供する最新のモデルを利用したい

- プロバイダーを柔軟に切り替えたい

### Supported model providers\{#supported-model-providers}

Zilliz Cloud は、さまざまな機能を提供する主要なモデルプロバイダーと連携しています。以下の表は、どのプロバイダーがテキスト埋め込みとリランキングをサポートしているかを示しています。

<Admonition type="info" icon="📘" title="Notes">

<p>Provider availability and supported capabilities may vary by region and release. Refer to provider-specific documentation for the most up-to-date information.</p>

</Admonition>

<table>
   <tr>
     <th><p>モデルプロバイダー</p></th>
     <th><p>Text Embedding</p></th>
     <th><p>Reranking</p></th>
   </tr>
   <tr>
     <td><p>OpenAI</p></td>
     <td><p><a href="https://platform.openai.com/docs/guides/embeddings#embedding-models">Yes</a></p></td>
     <td><p>No</p></td>
   </tr>
   <tr>
     <td><p>Voyage AI</p></td>
     <td><p><a href="https://docs.voyageai.com/docs/embeddings">Yes</a></p></td>
     <td><p><a href="https://docs.voyageai.com/docs/reranker">Yes</a></p></td>
   </tr>
   <tr>
     <td><p>Cohere</p></td>
     <td><p><a href="https://docs.cohere.com/docs/cohere-embed">Yes</a></p></td>
     <td><p><a href="https://docs.cohere.com/docs/rerank">Yes</a></p></td>
   </tr>
</table>

