---
title: "VectorDBBench を使用したパフォーマンスベンチマーク | BYOC"
slug: /perf-benchmark-vectordb
sidebar_label: "VectorDBBench を使用したパフォーマンスベンチマーク"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "VectorDBBench は、ベクトルデータベース向けに特化して設計されたオープンソースのベンチマークツールです。 | BYOC"
type: origin
token: Za3QwAcfjiSSvxk8UzUcTPmfnmb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# VectorDBBench を使用したパフォーマンスベンチマーク

[VectorDBBench](https://github.com/zilliztech/VectorDBBench) は、ベクトルデータベース向けに特化して設計されたオープンソースのベンチマークツールです。 

このトピックでは、VectorDBBench を使用して Zilliz Cloud のパフォーマンステスト結果を再現する方法を紹介します。 

## 概要\{#overview}

VectorDBBench は、主要なベクトルデータベースおよびクラウドサービスのベンチマーク結果を提供するだけでなく、究極のパフォーマンスとコスト効率を比較するためのツールでもあります。 

VectorDBBench は直感的なビジュアルインターフェースを提供します。これにより、ユーザーは簡単にベンチマークを開始できるだけでなく、比較結果レポートを確認することもでき、ベンチマーク結果を容易に再現できます。 

実際の本番環境を綿密に模倣し、VectorDBBench では挿入、検索、フィルタ付き検索などの多様なテストシナリオを用意しています。信頼性の高いデータを提供するために、VectorDBBench には [SIFT](http://corpus-texmex.irisa.fr/)、[GIST](http://corpus-texmex.irisa.fr/)、[Cohere](https://huggingface.co/datasets/Cohere/wikipedia-22-12/tree/main/en)、およびオープンソースの[生データセット](https://huggingface.co/datasets/allenai/c4)から OpenAI が生成したデータセットなど、実際の本番シナリオにおける公開データセットも含まれています。 

## ベンチマーク指標\{#benchmark-metrics}

| **Metric** | **Description** | **Test Scenario** |
| --- | --- | --- |
| Max_load_count | ベクトルデータベースの容量。VectorDBBench は、データベースが失敗するか、挿入リクエストを 10 回を超えて拒否するまでベクトルデータの挿入を継続し、挿入されたエンティティの最大数を記録します。<br/>Max_load_count の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | Insertion |
| QPS | ベクトルデータベースが 1 秒あたりに処理できる同時クエリ数の能力。VectorDBBench は top-100 検索を複数回実行し、最も高い QPS 値を最終結果として採用します。<br/>QPS の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | Search & filtered search |
| Recall | 検索結果を ground truth と比較して検索精度を測定する指標です。<br/>Recall の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | Search & filtered search |
| Load_duration | Zilliz Cloud がエンティティの挿入とインデックスの構築プロセスを完了するまでにかかる時間です。<br/>Load_duration の値が低いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | Search & filtered search |
| Serial_latancy_p99 | クエリの 99% が完了するまでにかかる時間です。VectorDBBench は各 top-100 検索の検索レイテンシを記録し、99 パーセンタイルの平均値を最終結果として使用します。<br/>Serial_latancy_p99 の値が低いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | Search & filtered search |

## 前提条件\{#prerequisites}

- [Zilliz Cloud アカウントを登録](/docs/register-with-zilliz-cloud)している必要があります。

- [少なくとも 1 つのクラスターを作成](/docs/create-cluster)します。 

- Python 3.11 以降がインストールされている必要があります。

## 手順\{#procedures}

### テスト環境をセットアップする\{#set-up-testing-environment}

1. マシンを用意します。

    Zilliz Cloud の究極のパフォーマンスをテストするには、複数スレッドを確保するために 8 vCPU を超えるクライアントマシンを用意することを推奨します。

1. ネットワークを設定します。

    ネットワーク通信は、特にクエリテストのシナリオでテスト結果に影響します。ネットワークレイテンシの影響を軽減するため、以下を推奨します。

    - クライアントを Zilliz Cloud クラスターと同じクラウドプロバイダーおよびリージョンにデプロイします。

### VectorDBBench をインストールして起動する\{#install-and-start-vectordbbench}

```bash
# Install VectorDBBench
$ pip install vectordb-bench

# Start VectorDBBench
$ init_bench
```

以下は出力例です。出力内にローカル URL が表示されます。これを使用して VectorDBBench の Web ユーザーインターフェースを開きます。

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

ホームページでは、VectorDBBench が提供するいくつかの事前定義済みテストデータセットを確認でき、それらを使用して迅速にパフォーマンスベンチマークを実行できます。

Web ページを一番下までスクロールし、**Run Your Test >** をクリックして独自のベンチマークテストを設定します。

![AATGbLxqwo32yexKYzPcdYVTnph](https://zdoc-images.s3.us-west-2.amazonaws.com/aatgblxqwo32yexkyzpcdyvtnph.png "AATGbLxqwo32yexKYzPcdYVTnph")

### ベンチマークテストを設定する\{#configure-your-benchmarking-test}

### ベンチマーク結果を表示する\{#view-benchmarking-results}

**Results** をクリックして、ベンチマーク結果を表示および分析します。以下は結果の例です。

![LWa7bJGzOo9qKJx0ZNicjLXjnJh](https://zdoc-images.s3.us-west-2.amazonaws.com/lwa7bjgzoo9qkjx0znicjlxjnjh.png "LWa7bJGzOo9qKJx0ZNicjLXjnJh")

![DJBibk5puoOLxYxxnH3chlxcnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/djbibk5puoolxyxxnh3chlxcnad.png "DJBibk5puoOLxYxxnH3chlxcnAd")

必要に応じて、左側のナビゲーションペインで **DB Filter** と **Case Filter** を設定し、事前定義済みのベクトルデータベースおよびケースのベンチマーク結果を比較できます。

<Admonition type="info" icon="📘" title="📘 注">

データベースは [database_name]-[db_label] の形式で命名されています。 

</Admonition>

<Grid columnSize="2" widthRatios="53,46">

    <div>

        ![ZBqQb11SEoYbYyxxtAYcKzv9nSc](https://zdoc-images.s3.us-west-2.amazonaws.com/zbqqb11seoybyyxxtayckzv9nsc.png "ZBqQb11SEoYbYyxxtAYcKzv9nSc")

    </div>

    <div>

        ![Wg3eb5C1AoEcRUxqO0Vcc4hSntd](https://zdoc-images.s3.us-west-2.amazonaws.com/wg3eb5c1aoecruxqo0vcc4hsntd.png "Wg3eb5C1AoEcRUxqO0Vcc4hSntd")

    </div>

</Grid>
