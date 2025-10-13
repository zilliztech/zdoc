---
title: "VectorDBBenchによるパフォーマンスベンチマーク | BYOC"
slug: /perf-benchmark-vectordb
sidebar_label: "VectorDBBenchによるパフォーマンスベンチマーク"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "VectorDBBenchは、ベクトルデータベースに特化したオープンソースのベンチマークツールです。 | BYOC"
type: origin
token: Ge7uwHtZUi2MS0klHO4cE3n8nKd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - performance
  - benchmark
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# VectorDBBenchによるパフォーマンスベンチマーク

[VectorDBBench](https://github.com/zilliztech/VectorDBBench)は、ベクトルデータベースに特化したオープンソースのベンチマークツールです。

このトピックでは、VectorDBBenchを使用してZilliz Cloudのパフォーマンステスト結果を再現する方法を紹介します。

## 概要について{#overview}

VectorDBBenchは、主流のベクトルデータベースやクラウドサービスのベンチマーク結果の提供だけでなく、究極のパフォーマンスとコスト効率の比較のためのツールでもあります。

VectorDBBenchは直感的なビジュアルインターフェースを提供します。これにより、ユーザーは簡単にベンチマークを開始できるだけでなく、比較結果レポートを表示してベンチマーク結果を簡単に再現できます。

VectorDBBenchは、実世界の本番環境を忠実に模倣し、挿入、検索、フィルタリングされた検索を含む多様なテストシナリオを設定しています。信頼性の高いデータを提供するために、VectorDBBenchは、[SIFT](http://corpus-texmex.irisa.fr/)、[GIST](http://corpus-texmex.irisa.fr/)、[Cohere](https://huggingface.co/datasets/Cohere/wikipedia-22-12/tree/main/en)などの実際の本番シナリオからの公開データセット、およびオープンソースの[生データセット](https://huggingface.co/datasets/allenai/c4)から生成されたOpen AIによるデータセットも含めています。

## ベンチマーク指標{#benchmark-metrics}

<table>
   <tr>
     <th><p><strong>メートル法</strong></p></th>
     <th><p><strong>説明する</strong></p></th>
     <th><p><strong>テストシナリオ</strong></p></th>
   </tr>
   <tr>
     <td><p>最大ロード数</p></td>
     <td><p>ベクトルデータベースの容量です。VectorDBBenchは、10回以上の挿入要求が失敗または拒否されるまで、ベクトルデータをベクトルデータベースに挿入し続け、挿入されたエンティティの最大数を記録します。</p><p>Max_load_countの値が大きいほど、ベクトルデータベースのパフォーマンスが向上します。</p></td>
     <td><p>挿入する</p></td>
   </tr>
   <tr>
     <td><p>QPS</p></td>
     <td><p>ベクトルデータベースが1秒あたりの同時クエリを処理する能力。VectorDBBenchは、複数回にわたってトップ100の検索を使用し、最も高いQPS値を最終結果として選択します。</p><p>高いQPS値はベクトルデータベースのパフォーマンスが良いことを示します。</p></td>
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

- [Zilliz Cloudアカウント登録](/docs/register-with-zilliz-cloud)が必要です。

- [少なくとも1つのクラスタを作成](/docs/create-cluster)してください。

- Python 3.11以降がインストールされている必要があります。

## 手続き{#procedures}

### テスト環境の設定{#set-up-testing-environment}

1. マシンを提供する。

    Zilliz Cloudの究極のパフォーマンスをテストするために、複数のスレッドを確保するために、クライアントマシンに8つ以上のv CPUをプロビジョニングすることをお勧めします。

1. ネットワークの設定

    ネットワーク通信は、特にクエリテストシナリオでは、テスト結果に影響します。ネットワークレイテンシの影響を軽減するには、次のことをお勧めします。

    - クライアントをZilliz Cloudクラスターと同じクラウドプロバイダーとリージョンに展開します。

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

ウェブページを一番下までスクロールし、**テストを実行&gt;**をクリックして独自のベンチマークテストを設定してください。

![HwQqbOpK7o6dXexeNZycsMT1ngb](/img/HwQqbOpK7o6dXexeNZycsMT1ngb.png)

### ベンチマークテストを設定する{#configure-your-benchmarking-test}

### ベンチマーク結果を見る{#view-benchmarking-results}

ベンチマークの**結果**を表示して分析するには、&#91;結果&#93;をクリックします。以下はいくつかの例です。

![OxxEbJtxGoRiAbx8Sbmc7X7onHc](/img/OxxEbJtxGoRiAbx8Sbmc7X7onHc.png)

![SFhebhjEqoRaenxYbfMc6quGnxZ](/img/SFhebhjEqoRaenxYbfMc6quGnxZ.png)

オプションで、左ナビゲーションウィンドウで**DBフィルター**と**ケースフィルター**を設定して、定義済みのベクトルデータベースとケースのベンチマーク結果を比較することができます。

<Admonition type="info" icon="📘" title="ノート">

<p>データベースは、&#91;database<em>name&#93;-&#91;db</em>label&#93;の形式で命名されます。 </p>

</Admonition>

<Grid columnSize="2" widthRatios="53,46">

    <div>

        ![HGHpbgsPLoBt82xBetvc8ibynVe](/img/HGHpbgsPLoBt82xBetvc8ibynVe.png)

    </div>

    <div>

        ![JOtgbR8adoORHUxw5Zmc8wGlnHc](/img/JOtgbR8adoORHUxw5Zmc8wGlnHc.png)

    </div>

</Grid>
