---
title: "VectorDBBench によるパフォーマンスベンチマーク | Cloud"
slug: /perf-benchmark-vectordb
sidebar_key: perf-benchmark-vectordb
sidebar_label: "VectorDBBench の使用"
beta: FALSE
notebook: FALSE
description: "VectorDBBench は、ベクトルデータベース専用に設計されたオープンソースのベンチマークツールです。| Cloud"
type: origin
token: Za3QwAcfjiSSvxk8UzUcTPmfnmb
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - milvus
  - パフォーマンス
  - ベンチマーク

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# VectorDBBench によるパフォーマンスベンチマーク

[VectorDBBench](https://github.com/zilliztech/VectorDBBench) は、ベクトルデータベース専用に設計されたオープンソースのベンチマークツールです。

このトピックでは、VectorDBBench を使用して Zilliz Cloud のパフォーマンステスト結果を再現する方法を紹介します。

## 概要\{#overview}

VectorDBBench は、主流のベクトルデータベースおよびクラウドサービスのベンチマーク結果を提供するだけでなく、究極のパフォーマンスとコスト効率の比較を行うためのツールでもあります。

VectorDBBench は直感的なビジュアルインターフェースを提供しており、ユーザーが簡単にベンチマークを開始し、比較結果レポートを確認できるため、ベンチマーク結果を手軽に再現できます。

実際の本番環境を忠実に再現するため、VectorDBBench では挿入、検索、フィルター付き検索など多様なテストシナリオを設定しています。信頼性の高いデータを提供するために、[SIFT](http://corpus-texmex.irisa.fr/)、[GIST](http://corpus-texmex.irisa.fr/)、[Cohere](https://huggingface.co/datasets/Cohere/wikipedia-22-12/tree/main/en)、およびオープンソースの[生データセット](https://huggingface.co/datasets/allenai/c4)から OpenAI が生成したデータセットなど、実際の本番シナリオ由来の公開データセットも含まれています。

## ベンチマークメトリクス\{#benchmark-metrics}

<table>
   <tr>
     <th><p><strong>Metric</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Test Scenario</strong></p></th>
   </tr>
   <tr>
     <td><p>Max_load_count</p></td>
     <td><p>ベクトルデータベースの容量。VectorDBBench は、データベースが失敗するか、または10回以上挿入リクエストを拒否するまでベクトルデータを挿入し続け、挿入されたエンティティの最大数を記録します。</p><p>Max_load_count の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。</p></td>
     <td><p>Insertion</p></td>
   </tr>
   <tr>
     <td><p>QPS</p></td>
     <td><p>ベクトルデータベースが1秒あたりに処理できる同時クエリ数の能力。VectorDBBench は複数回の top-100 検索を実行し、最も高い QPS 値を最終結果として採用します。</p><p>QPS の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。</p></td>
     <td><p>Search & filtered search</p></td>
   </tr>
   <tr>
     <td><p>Recall</p></td>
     <td><p>検索結果と正解データ（ground truth）を比較することで、検索精度を測定します。</p><p>Recall の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。</p></td>
     <td><p>Search & filtered search</p></td>
   </tr>
   <tr>
     <td><p>Load_duration</p></td>
     <td><p>Zilliz Cloud がエンティティの挿入およびインデックス構築を完了するのに要する時間。</p><p>Load_duration の値が低いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。</p></td>
     <td><p>Search & filtered search</p></td>
   </tr>
   <tr>
     <td><p>Serial_latancy_p99</p></td>
     <td><p>クエリの99%が完了するまでにかかる時間。VectorDBBench は各 top-100 検索のレイテンシを記録し、99パーセンタイルの平均値を最終結果として使用します。</p><p>Serial_latancy_p99 の値が低いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。</p></td>
     <td><p>Search & filtered search</p></td>
   </tr>
</table>

## 前提条件\{#prerequisites}

- [Zilliz Cloud アカウントを登録済み](/docs/register-with-zilliz-cloud)である必要があります。

- [少なくとも1つのクラスターを作成](/docs/create-cluster)している必要があります。Zilliz Cloud では、すぐに Zilliz Cloud ベクトルデータベースの利用を開始できるよう、[無料](./free-trials)クラスターを提供しています。

- Python 3.11 以降がインストールされている必要があります。

## 手順\{#procedures}

### テスト環境のセットアップ\{#set-up-testing-environment}

1. マシンをプロビジョニングします。

    Zilliz Cloud の究極のパフォーマンスをテストするには、複数スレッドを確保するために、8 vCPU 以上のクライアントマシンをプロビジョニングすることを推奨します。

1. ネットワークを設定します。

    ネットワーク通信は、特にクエリテストシナリオにおいてテスト結果に影響を与えます。ネットワーク遅延の影響を低減するため、以下の設定を推奨します。

    - クライアントを、Zilliz Cloud クラスターと同じクラウドプロバイダーおよびリージョン内にデプロイ中します。

    - クライアントを設定して、Zilliz Cloud クラスターと同じ VPC を共有するようにします。パブリックインターネットと比較して、VPC はより低いレイテンシを実現できます。詳細については、[プライベートエンドポイントの設定](./setup-a-private-link)をご参照ください。

### VectorDBBench のインストールと起動\{#install-and-start-vectordbbench}

```bash
# Install VectorDBBench
$ pip install vectordb-bench

# Start VectorDBBench
$ init_bench
```

以下は出力例です。出力にはローカルURLが表示されますので、これを使用してVectorDBBenchのWebユーザーインターフェースを開いてください。

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

ホームページでは、VectorDBBenchが提供するいくつかの事前定義済みテストデータセットを確認し、それらを使って迅速にパフォーマンスベンチマークを実行できます。

ウェブページを下までスクロールし、**テストを実行 >** をクリックして、独自のベンチマークテストを設定します。

![AATGbLxqwo32yexKYzPcdYVTnph](https://zdoc-images.s3.us-west-2.amazonaws.com/aatgblxqwo32yexkyzpcdyvtnph.png "AATGbLxqwo32yexKYzPcdYVTnph")

### Configure your benchmarking test\{#configure-your-benchmarking-test}

### View benchmarking results\{#view-benchmarking-results}

**結果** をクリックして、ベンチマーク結果を表示・分析します。以下は結果の例です。

![LWa7bJGzOo9qKJx0ZNicjLXjnJh](https://zdoc-images.s3.us-west-2.amazonaws.com/lwa7bjgzoo9qkjx0znicjlxjnjh.png "LWa7bJGzOo9qKJx0ZNicjLXjnJh")

![DJBibk5puoOLxYxxnH3chlxcnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/djbibk5puoolxyxxnh3chlxcnad.png "DJBibk5puoOLxYxxnH3chlxcnAd")

必要に応じて、左側のナビゲーションペインで **DBフィルター** および **ケースフィルター** を設定し、事前定義されたベクトルデータベースおよびケースのベンチマーク結果を比較できます。

<Admonition type="info" icon="📘" title="Notes">

<p>データベースは [database<em>name]-[db</em>label] の形式で命名されています。</p>

</Admonition>

<Grid columnSize="2" widthRatios="53,46">

    <div>

        ![ZBqQb11SEoYbYyxxtAYcKzv9nSc](https://zdoc-images.s3.us-west-2.amazonaws.com/zbqqb11seoybyyxxtayckzv9nsc.png "ZBqQb11SEoYbYyxxtAYcKzv9nSc")

    </div>

    <div>

        ![Wg3eb5C1AoEcRUxqO0Vcc4hSntd](https://zdoc-images.s3.us-west-2.amazonaws.com/wg3eb5c1aoecruxqo0vcc4hsntd.png "Wg3eb5C1AoEcRUxqO0Vcc4hSntd")

    </div>

</Grid>
