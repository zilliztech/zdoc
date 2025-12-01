---
title: "VectorDBBench によるパフォーマンスベンチマーキング | BYOC"
slug: /perf-benchmark-vectordb
sidebar_label: "VectorDBBench の使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "VectorDBBench は、ベクトルデータベース用に特別に設計されたオープンソースのベンチマーキングツールです。 | BYOC"
type: origin
token: Za3QwAcfjiSSvxk8UzUcTPmfnmb
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - milvus
  - performance
  - benchmark
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# VectorDBBench によるパフォーマンスベンチマーキング

[VectorDBBench](https://github.com/zilliztech/VectorDBBench) は、ベクトルデータベース用に特別に設計されたオープンソースのベンチマーキングツールです。

このトピックでは、VectorDBBench を使用して Zilliz Cloud のパフォーマンステスト結果を再現する方法を紹介します。

## 概要\{#overview}

VectorDBBench は、主流のベクトルデータベースおよびクラウドサービスのベンチマーク結果を提供するだけでなく、究極のパフォーマンスおよびコスト効率の比較のためのツールでもあります。

VectorDBBench は直感的な視覚インターフェースを提供します。これにより、ユーザーは簡単にベンチマークを開始でき、比較結果レポートを表示し、ベンチマーク結果を容易に再現できます。

実際の運用環境を模倣した VectorDBBench は、挿入、検索、フィルター検索を含む多様なテストシナリオを設定しています。信頼性のあるデータを提供するために、VectorDBBench には [SIFT](http://corpus-texmex.irisa.fr/)、[GIST](http://corpus-texmex.irisa.fr/)、[Cohere](https://huggingface.co/datasets/Cohere/wikipedia-22-12/tree/main/en) などの実際の運用シナリオからのパブリックデータセットや、オープンソースの[生データセット](https://huggingface.co/datasets/allenai/c4) から OpenAI が生成したデータセットも含まれています。

## ベンチマークメトリクス\{#benchmark-metrics}

<table>
   <tr>
     <th><p><strong>メトリック</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>テストシナリオ</strong></p></th>
   </tr>
   <tr>
     <td><p>Max_load_count</p></td>
     <td><p>ベクトルデータベースの容量。VectorDBBench は、データベースが失敗するか挿入要求を10回以上拒否するまでベクトルデータを挿入し続け、挿入されたエンティティの最大数を記録します。</p><p>Max_load_count の値が高いほど、ベクトルデータベースのパフォーマンスが高いことを示します。</p></td>
     <td><p>挿入</p></td>
   </tr>
   <tr>
     <td><p>QPS</p></td>
     <td><p>ベクトルデータベースが1秒間に処理できる同時クエリの能力。VectorDBBench は複数回のトップ100検索を使用し、最高の QPS 値を選択して最終結果とします。</p><p>QPS の値が高いほど、ベクトルデータベースのパフォーマンスが高いことを示します。</p></td>
     <td><p>検索およびフィルター検索</p></td>
   </tr>
   <tr>
     <td><p>Recall</p></td>
     <td><p>検索結果と真の値を比較した検索精度の測定。</p><p>Recall の値が高いほど、ベクトルデータベースのパフォーマンスが高いことを示します。</p></td>
     <td><p>検索およびフィルター検索</p></td>
   </tr>
   <tr>
     <td><p>Load_duration</p></td>
     <td><p>Zilliz Cloud がエンティティの挿入とインデックス作成のプロセスを完了するまでにかかる時間。</p><p>Load_duration の値が低いほど、ベクトルデータベースのパフォーマンスが高いことを示します。</p></td>
     <td><p>検索およびフィルター検索</p></td>
   </tr>
   <tr>
     <td><p>Serial_latancy_p99</p></td>
     <td><p>99% のクエリが完了するまでにかかる時間。VectorDBBench は各トップ100検索の検索遅延を記録し、99パーセンタイル平均を最終結果として使用します。</p><p>Serial_latancy_p99 の値が低いほど、ベクトルデータベースのパフォーマンスが高いことを示します。</p></td>
     <td><p>検索およびフィルター検索</p></td>
   </tr>
</table>

## 前提条件\{#prerequisites}

- [登録済みの Zilliz Cloud アカウント](/docs/register-with-zilliz-cloud) を持っている必要があります。

- [少なくとも1つのクラスターを作成](/docs/create-cluster) する必要があります。

- Python 3.11 以降がインストールされている必要があります。

## 手順\{#procedures}

### テスト環境の設定\{#set-up-testing-environment}

1. マシンをプロビジョニングします。

    Zilliz Cloud の究極のパフォーマンスをテストするには、複数のスレッドを確保するために8つ以上の vCPU を持つクライアントマシンをプロビジョニングすることを推奨します。

1. ネットワークを構成します。

    ネットワーク通信は特にクエリテストシナリオでテスト結果に影響を与える可能性があります。ネットワーク遅延の影響を軽減するために、以下を推奨します：

    - クライアントを Zilliz Cloud クラスターと同じクラウドプロバイダおよびリージョンに展開します。

### VectorDBBench のインストールと開始\{#install-and-start-vectordbbench}

```bash
# VectorDBBench をインストール
$ pip install vectordb-bench

# VectorDBBench を開始
$ init_bench
```

以下は出力例です。出力でローカル URL を取得します。これを使用して VectorDBBench の Web ユーザーインターフェースを開きます。

```python

      👋 Welcome to Streamlit!

      If you’d like to receive helpful onboarding emails, news, offers, promotions,
      and the occasional swag, please enter your email address below. Otherwise,
      leave this field blank.

      Email:
  You can find our privacy policy at https://streamlit.io/privacy-policy

  Summary:
  - This open source library collects usage statistics.
  - We cannot see and do not store information contained inside Streamlit apps,
    such as text, charts, images, etc.
  - Telemetry data is stored in servers in the United States.
  - If you'd like to opt out, add the following to ~/.streamlit/config.toml,
    creating that file if necessary:

    [browser]
    gatherUsageStats = false

  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://172.16.20.46:8501
```

ホームページでは、VectorDBBench が提供するいくつかの事前定義されたテストデータセットを確認し、クイックパフォーマンスベンチマーキングに使用できます。

Web ページを下にスクロールして一番下まで行き、**Run Your Test >** をクリックして独自のベンチマーキングテストを構成します。

![AATGbLxqwo32yexKYzPcdYVTnph](/img/AATGbLxqwo32yexKYzPcdYVTnph.png)

### ベンチマーキングテストの構成\{#configure-your-benchmarking-test}

### ベンチマーキング結果の表示\{#view-benchmarking-results}

**Results** をクリックしてベンチマーキング結果を表示および分析します。以下はいくつかの例です。

![LWa7bJGzOo9qKJx0ZNicjLXjnJh](/img/LWa7bJGzOo9qKJx0ZNicjLXjnJh.png)

![DJBibk5puoOLxYxxnH3chlxcnAd](/img/DJBibk5puoOLxYxxnH3chlxcnAd.png)

オプションとして、左側のナビゲーションペインで **DB Filter** および **Case Filter** を設定して、事前定義されたベクトルデータベースおよびケースのベンチマーキング結果を比較できます。

<Admonition type="info" icon="📘" title="Notes">

<p>データベース名は [database<em>name]-[db</em>label] の形式です。</p>

</Admonition>

<Grid columnSize="2" widthRatios="53,46">

    <div>

        ![ZBqQb11SEoYbYyxxtAYcKzv9nSc](/img/ZBqQb11SEoYbYyxxtAYcKzv9nSc.png)

    </div>

    <div>

        ![Wg3eb5C1AoEcRUxqO0Vcc4hSntd](/img/Wg3eb5C1AoEcRUxqO0Vcc4hSntd.png)

    </div>

</Grid>
