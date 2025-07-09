---
title: "VectorDBBenchによるパフォーマンスベンチマーク | BYOC"
slug: /perf-benchmark-vectordb
sidebar_label: "Use VectorDBBench"
beta: FALSE
notebook: FALSE
description: "VectorDBBenchは、ベクトルデータベースに特化したオープンソースのベンチマークツールです。 | BYOC"
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
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example

---

import Admonition from '@theme/Admonition';


# VectorDBBenchによるパフォーマンスベンチマーク

[VectorDBBench](https://github.com/zilliztech/VectorDBBench)は、ベクトルデータベースに特化したオープンソースのベンチマークツールです。 

このトピックでは、VectorDBBenchを使用してZilliz Cloudのパフォーマンステスト結果を再現する方法を紹介します。 

## 概要について{#overview}

VectorDBBenchは、主流のベクトルデータベースやクラウドサービスのベンチマーク結果の提供だけでなく、究極のパフォーマンスとコスト効率の比較のためのツールでもあります。 

VectorDBBenchは直感的なビジュアルインターフェースを提供します。これにより、ユーザーは簡単にベンチマークを開始できるだけでなく、比較結果レポートを表示してベンチマーク結果を簡単に再現できます。 

VectorDBBenchは、実世界の本番環境を忠実に模倣し、挿入、検索、フィルター検索を含む多様なテストシナリオを設定しています。信頼性の高いデータを提供するために、VectorDBBenchは、[SIFT](http://corpus-texmex.irisa.fr/)、[GIST](http://corpus-texmex.irisa.fr/)、[コヒア](https://huggingface.co/datasets/Cohere/wikipedia-22-12/tree/main/en)などの実際の本番シナリオからの公開データセット、およびオープンソースの[RAWデータセット](https://huggingface.co/datasets/allenai/c4)からOpen AIによって生成されたデータセットも含めています。 

## ベンチマーク指標{#benchmark-metrics}

<table>
   <tr>
     <th><p><strong>メトリック</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
     <th><p><strong>テストシナリオ</strong></p></th>
   </tr>
   <tr>
     <td><p>最大ロード数</p></td>
     <td><p>ベクトルデータベースの容量です。VectorDBBenchは、10回以上の挿入要求が失敗または拒否されるまで、ベクトルデータをベクトルデータベースに挿入し続け、挿入されたエンティティの最大数を記録します。</p><p>Max_load_countの値が大きいほど、ベクトルデータベースのパフォーマンスが向上します。</p></td>
     <td><p>挿入する</p></td>
   </tr>
   <tr>
     <td><p>QPS</p></td>
     <td><p>ベクトルデータベースが1秒あたりの同時クエリを処理する能力。VectorDBBenchは、複数回にわたってトップ100の検索を使用し、最も高いQPS値を最終結果として選択します。</p><p>QPS値が高いほど、ベクトルデータベースのパフォーマンスが良いことを示します。</p></td>
     <td><p>検索&amp;フィルター検索</p></td>
   </tr>
   <tr>
     <td><p>リコール</p></td>
     <td><p>グラウンドトゥルースと検索結果を比較することによる検索精度の測定。</p><p>リコール値が高いほど、ベクトルデータベースのパフォーマンスが良いことを示します。</p></td>
     <td><p>検索&amp;フィルター検索</p></td>
   </tr>
   <tr>
     <td><p>ロード時間</p></td>
     <td><p>Zilliz Cloudがエンティティの挿入とインデックスの構築の過程を完了するのにかかる時間。</p><p>Load_durationの値が低いほど、ベクトルデータベースのパフォーマンスが向上します。</p></td>
     <td><p>検索&amp;フィルター検索</p></td>
   </tr>
   <tr>
     <td><p>シリアルラタンシーp 99</p></td>
     <td><p>クエリの99%が完了するまでの時間。VectorDBBenchは、各トップ100検索の検索レイテンシを記録し、最終結果として99パーセンタイル平均を使用します。</p><p>Serial_latancy_p 99の値が低いほど、ベクトルデータベースのパフォーマンスが向上します。</p></td>
     <td><p>検索&amp;フィルター検索</p></td>
   </tr>
</table>

## 前提条件{#prerequisites}

- [Zilliz Cloudアカウントの登録](/docs/register-with-zilliz-cloud)が必要です。

- リンク_PLACEHOLDER_0.

- Python 3.11以降がインストールされている必要があります。

## 手続き{#procedures}

### テスト環境の設定{#set-up-testing-environment}

1. マシンを提供する。

    Zilliz Cloudの究極のパフォーマンスをテストするには、複数のスレッドを確保するために、クライアントマシンに8つ以上のv CPUをプロビジョニングすることをお勧めします。

1. ネットワークの設定

    ネットワーク通信は、特にクエリテストシナリオでテスト結果に影響を与えます。ネットワークレイテンシの影響を軽減するために、次のことをお勧めします。

    - クライアントをZilliz Cloudクラスターと同じクラウドプロバイダーとリージョンに展開します。

    - クライアントを設定して、Zilliz Cloudクラスターと同じVPCを共有するようにします。パブリックインターネットと比較して、VPCのレイテンシーは低くなります。詳しくは[プライベートエンドポイントを設定する](./setup-a-private-link)をご覧ください。

    </include>

### VectorDBBenchのインストールと起動{#install-and-start-vectordbbench}

```bash
# Install VectorDBBench
$ pip install vectordb-bench

# Start VectorDBBench
$ init_bench
```

以下は出力例です。出力でローカルURLを取得します。これを使用して、VectorDBBenchのWebユーザーインターフェイスを開きます。

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

ホームページでは、VectorDBBenchが提供するいくつかの事前定義されたテストデータセットを見ることができ、それらを使用して迅速なパフォーマンスベンチマークを行うことができます。

ウェブページを一番下までスクロールし、**テストの実行>**をクリックして、独自のベンチマークテストを設定してください。

![AATGbLxqwo32yexKYzPcdYVTnph](/img/AATGbLxqwo32yexKYzPcdYVTnph.png)

### ベンチマークテストを設定する{#configure-your-benchmarking-test}

### ベンチマーク結果を見る{#view-benchmarking-results}

ベンチマークの結果を表示および分析するには、**結果**をクリックしてください。以下はいくつかの例の結果です。

![LWa7bJGzOo9qKJx0ZNicjLXjnJh](/img/LWa7bJGzOo9qKJx0ZNicjLXjnJh.png)

![DJBibk5puoOLxYxxnH3chlxcnAd](/img/DJBibk5puoOLxYxxnH3chlxcnAd.png)

オプションで、左のナビゲーションペインで**DBフィルター**と**ケースフィルター**を設定して、事前に定義されたベクトルデータベースとケースのベンチマーク結果を比較することができます。

<Admonition type="info" icon="📘" title="ノート">

<p>データベースは[database<em>name]-[db</em>label]の形式で名前が付けられます。 </p>

</Admonition>