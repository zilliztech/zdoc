---
title: "VectorDBBench によるパフォーマンスベンチマーク | Cloud"
slug: /perf-benchmark-vectordb
sidebar_label: "VectorDBBench によるパフォーマンスベンチマーク"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "VectorDBBench は、ベクトルデータベース向けに特別に設計されたオープンソースのベンチマークツールです。 | Cloud"
type: origin
token: Za3QwAcfjiSSvxk8UzUcTPmfnmb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# VectorDBBench によるパフォーマンスベンチマーク

[VectorDBBench](https://github.com/zilliztech/VectorDBBench) は、ベクトルデータベース向けに特別に設計されたオープンソースのベンチマークツールです。 

このトピックでは、VectorDBBench を使用して Zilliz Cloud のパフォーマンステスト結果を再現する方法を説明します。 

## 概要\{#overview}

VectorDBBench は、主流のベクトルデータベースおよびクラウドサービスのベンチマーク結果を提供するだけではなく、究極のパフォーマンスとコスト効率を比較するためのツールでもあります。 

VectorDBBench は直感的なビジュアルインターフェースを提供します。これにより、ユーザーは簡単にベンチマークを開始できるだけでなく、比較結果レポートを表示できるため、ベンチマーク結果を手間なく再現できます。 

VectorDBBench は、実際の本番環境を忠実に模倣し、挿入、検索、フィルタリング検索などの多様なテストシナリオを用意しています。信頼できる確かなデータを提供するため、VectorDBBench には、[SIFT](http://corpus-texmex.irisa.fr/)、[GIST](http://corpus-texmex.irisa.fr/)、[Cohere](https://huggingface.co/datasets/Cohere/wikipedia-22-12/tree/main/en) などの実際の本番シナリオの公開データセットや、OpenAI がオープンソースの [raw dataset](https://huggingface.co/datasets/allenai/c4) から生成したデータセットも含まれています。 

## ベンチマークメトリクス\{#benchmark-metrics}

| **メトリクス** | **説明** | **テストシナリオ** |
| --- | --- | --- |
| Max_load_count | ベクトルデータベースの容量です。VectorDBBench は、データベースで障害が発生するか、挿入リクエストを 10 回を超えて拒否するまで、ベクトルデータをベクトルデータベースに挿入し続け、挿入されたエンティティの最大数を記録します。<br/>Max_load_count の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | 挿入 |
| QPS | ベクトルデータベースが 1 秒あたりの同時クエリを処理する能力です。VectorDBBench は top-100 検索を複数回実行し、最も高い QPS 値を最終結果として選択します。<br/>QPS の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | 検索およびフィルタリング検索 |
| Recall | 検索結果をグラウンドトゥルースと比較することによる検索精度の尺度です。<br/>Recall の値が高いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | 検索およびフィルタリング検索 |
| Load_duration | Zilliz Cloud がエンティティの挿入とインデックスの構築を完了するまでにかかる時間です。<br/>Load_duration の値が低いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | 検索およびフィルタリング検索 |
| Serial_latancy_p99 | 99% のクエリが完了するまでにかかる時間です。VectorDBBench は各 top-100 検索の検索レイテンシを記録し、99 パーセンタイル平均を最終結果として使用します。<br/>Serial_latancy_p99 の値が低いほど、ベクトルデータベースのパフォーマンスが優れていることを示します。 | 検索およびフィルタリング検索 |

## 事前準備\{#prerequisites}

- [登録済みの Zilliz Cloud アカウント](/docs/register-with-zilliz-cloud) を持っていること。

- 少なくとも 1 つの[クラスター](/docs/create-cluster)を作成していること。Zilliz Cloud では、すぐに利用を開始して Zilliz Cloud ベクトルデータベースの探索を始められる[無料](./free-and-serverless-clusters)クラスターを提供しています。

- Python 3.11 以降がインストールされていること。

## 手順\{#procedures}

### テスト環境をセットアップする\{#set-up-testing-environment}

1. マシンをプロビジョニングします。

    Zilliz Cloud の究極のパフォーマンスをテストするには、複数のスレッドを確保するために 8 vCPU を超えるクライアントマシンをプロビジョニングすることをお勧めします。

1. ネットワークを構成します。

    ネットワーク通信は、特にクエリテストのシナリオにおいて、テスト結果に影響します。ネットワークレイテンシの影響を軽減するため、次のことをお勧めします。

    - Zilliz Cloud クラスターと同じクラウドプロバイダーおよびリージョンにクライアントをデプロイすること。

    - クライアントが Zilliz Cloud クラスターと同じ VPC を共有するように構成すること。パブリックインターネットと比較して、VPC はレイテンシを低くできます。詳細については、[PrivateLink（AWS）を設定する](./setup-a-private-link-aws) および関連ページを参照してください。

### VectorDBBench をインストールして起動する\{#install-and-start-vectordbbench}

```bash
# Install VectorDBBench
$ pip install vectordb-bench

# Start VectorDBBench
$ init_bench
```

以下は出力例です。出力にローカル URL が表示されます。その URL を使用して、VectorDBBench の Web ユーザーインターフェースを開きます。

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

ホームページでは、VectorDBBench が提供する定義済みのテストデータセットを確認し、それらを使用して簡単なパフォーマンスベンチマークを実行できます。

Web ページを一番下までスクロールし、**Run Your Test >** をクリックして、独自のベンチマークテストを設定します。

![AATGbLxqwo32yexKYzPcdYVTnph](https://zdoc-images.s3.us-west-2.amazonaws.com/aatgblxqwo32yexkyzpcdyvtnph.png "AATGbLxqwo32yexKYzPcdYVTnph")

### ベンチマークテストを設定する\{#configure-your-benchmarking-test}

### ベンチマーク結果を表示する\{#view-benchmarking-results}

**Results** をクリックして、ベンチマーク結果を表示および分析します。以下は結果の例です。

![LWa7bJGzOo9qKJx0ZNicjLXjnJh](https://zdoc-images.s3.us-west-2.amazonaws.com/lwa7bjgzoo9qkjx0znicjlxjnjh.png "LWa7bJGzOo9qKJx0ZNicjLXjnJh")

![DJBibk5puoOLxYxxnH3chlxcnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/djbibk5puoolxyxxnh3chlxcnad.png "DJBibk5puoOLxYxxnH3chlxcnAd")

必要に応じて、左側のナビゲーションペインで **DB Filter** と **Case Filter** を設定し、定義済みのベクトルデータベースおよびケースのベンチマーク結果を比較できます。

<Admonition type="info" title="Notes">

データベース名は [database_name]-[db_label] の形式です。 

</Admonition>

<Grid columnSize="2" widthRatios="53,46">

    <div>

        ![ZBqQb11SEoYbYyxxtAYcKzv9nSc](https://zdoc-images.s3.us-west-2.amazonaws.com/zbqqb11seoybyyxxtayckzv9nsc.png "ZBqQb11SEoYbYyxxtAYcKzv9nSc")

    </div>

    <div>

        ![Wg3eb5C1AoEcRUxqO0Vcc4hSntd](https://zdoc-images.s3.us-west-2.amazonaws.com/wg3eb5c1aoecruxqo0vcc4hsntd.png "Wg3eb5C1AoEcRUxqO0Vcc4hSntd")

    </div>

</Grid>
