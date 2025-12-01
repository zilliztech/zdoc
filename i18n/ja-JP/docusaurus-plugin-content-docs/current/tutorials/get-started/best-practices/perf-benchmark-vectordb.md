---
title: "VectorDBBenchによるパフォーマンスベンチマーキング | Cloud"
slug: /perf-benchmark-vectordb
sidebar_label: "VectorDBBenchの使用"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "VectorDBBenchは、ベクターデータベース専用に設計されたオープンソースのベンチマーキングツールです。 | Cloud"
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
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# VectorDBBenchによるパフォーマンスベンチマーキング

[VectorDBBench](https://github.com/zilliztech/VectorDBBench)は、ベクターデータベース専用に設計されたオープンソースのベンチマーキングツールです。

このトピックでは、VectorDBBenchを使用してZilliz Cloudのパフォーマンステスト結果を再現する方法を紹介します。

## 概要\{#overview}

VectorDBBenchは、主流のベクターデータベースおよびクラウドサービス向けのベンチマーク結果の提供にとどまらず、究極のパフォーマンスとコストパフォーマンス比較のためのツールでもあります。

VectorDBBenchは直感的な視覚インターフェースを提供します。これにより、ユーザーが簡単にベンチマークを開始できるだけでなく、比較結果レポートを表示して、ベンチマーク結果を容易に再現できます。

実際の運用環境を模倣したVectorDBBenchは、挿入、検索、およびフィルター検索を含む多様なテストシナリオを設定しています。信頼性の高いデータを提供するために、VectorDBBenchには[SIFT](http://corpus-texmex.irisa.fr/)、[GIST](http://corpus-texmex.irisa.fr/)、[Cohere](https://huggingface.co/datasets/Cohere/wikipedia-22-12/tree/main/en)などの実際の運用シナリオから得られたパブリックデータセットや、[Raw dataset](https://huggingface.co/datasets/allenai/c4)からOpenAIが生成したデータセットも含まれています。

## ベンチマーク指標\{#benchmark-metrics}

<table>
   <tr>
     <th><p><strong>指標</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>テストシナリオ</strong></p></th>
   </tr>
   <tr>
     <td><p>Max_load_count</p></td>
     <td><p>ベクターデータベースの容量。VectorDBBenchは、データベースが失敗するか挿入要求を10回以上拒否するまでベクターデータを挿入し続け、挿入されたエンティティ数の最大記録を保持します。</p><p>高いMax_load_count値は、より良いベクターデータベースのパフォーマンスを示します。</p></td>
     <td><p>挿入</p></td>
   </tr>
   <tr>
     <td><p>QPS</p></td>
     <td><p>ベクターデータベースが1秒間に処理できる同時クエリ数。VectorDBBenchは複数回のtop-100検索を使用し、最高のQPS値を最終結果として選択します。</p><p>高いQPS値は、より良いベクターデータベースのパフォーマンスを示します。</p></td>
     <td><p>検索 & フィルター検索</p></td>
   </tr>
   <tr>
     <td><p>Recall</p></td>
     <td><p>検索結果と真実を比較した検索精度の測定。</p><p>高い再現率の値は、より良いベクターデータベースのパフォーマンスを示します。</p></td>
     <td><p>検索 & フィルター検索</p></td>
   </tr>
   <tr>
     <td><p>Load_duration</p></td>
     <td><p>Zilliz Cloudがエンティティの挿入とインデックス構築プロセスを完了するのにかかる時間。</p><p>低いLoad_duration値は、より良いベクターデータベースのパフォーマンスを示します。</p></td>
     <td><p>検索 & フィルター検索</p></td>
   </tr>
   <tr>
     <td><p>Serial_latancy_p99</p></td>
     <td><p>99%のクエリが完了するのにかかる時間。VectorDBBenchは各top-100検索の検索遅延を記録し、99パーセンタイル平均を最終結果として使用します。</p><p>低いSerial_latancy_p99値は、より良いベクターデータベースのパフォーマンスを示します。</p></td>
     <td><p>検索 & フィルター検索</p></td>
   </tr>
</table>

## 前提条件\{#prerequisites}

- [登録済みのZilliz Cloudアカウント](/docs/register-with-zilliz-cloud)が必要です。

- [少なくとも1つのクラスターを作成](/docs/create-cluster)してください。Zilliz Cloudは、Zilliz Cloudベクターデータベースを迅速に使い始め、探索できるように[無料](./free-trials)クラスターを提供しています。

- Python 3.11以降がインストールされている必要があります。

## 手順\{#procedures}

### テスト環境の設定\{#set-up-testing-environment}

1. マシンをプロビジョニングします。

    Zilliz Cloudの究極のパフォーマンスをテストするには、8つ以上のvCPUを持つクライアントマシンをプロビジョニングして、複数のスレッドを確保することを推奨します。

1. ネットワークの設定。

    ネットワーク通信は、特にクエリテストシナリオでテスト結果に影響します。ネットワーク遅延の影響を軽減するため、以下を推奨します：

    - Zilliz Cloudクラスターと同じクラウドプロバイダーおよびリージョンにクライアントをデプロイしてください。

    - Zilliz Cloudクラスターと同じVPCをクライアントが共有するように設定してください。パブリックインターネットと比較して、VPCは遅延が低くなります。詳しくは、[プライベートエンドポイントの設定](./setup-a-private-link)を参照してください。

### VectorDBBenchのインストールと開始\{#install-and-start-vectordbbench}

```bash
# VectorDBBenchをインストール
$ pip install vectordb-bench

# VectorDBBenchを開始
$ init_bench
```

以下は例の出力です。出力でローカルURLを取得できます。これを使用して、VectorDBBenchのWebユーザーインターフェースを開いてください。

```python

      👋 Streamlitへようこそ！

      役立つオンボーディングメール、ニュース、オファー、プロモーション、
      偶然のスワッグを受け取りたい場合は、以下にメールアドレスを入力してください。それ以外の場合は、
      このフィールドを空白のままにしてください。

      メールアドレス:
  プライバシーポリシーは https://streamlit.io/privacy-policy で確認できます

  概要:
  - このオープンソースライブラリは使用統計情報を収集します。
  - Streamlitアプリ内のテキスト、チャート、画像などの情報を表示したり、
    ストリームリットアプリに保存したりすることはできません。
  - テレメトリデータは米国のサーバーに保存されます。
  - オプトアウトを希望する場合は、必要に応じて ~/.streamlit/config.toml に以下を追加してください：

    [browser]
    gatherUsageStats = false

  これで、ブラウザでStreamlitアプリを表示できるようになりました。

  ローカルURL: http://localhost:8501
  ネットワークURL: http://172.16.20.46:8501
```

ホームページでは、VectorDBBenchが提供する事前定義されたテストデータセットを確認し、迅速なパフォーマンスベンチマーキングに使用できます。

Webページを下にスクロールして一番下まで行き、**テストを実行>** をクリックして、独自のベンチマーキングテストを設定してください。

![AATGbLxqwo32yexKYzPcdYVTnph](/img/AATGbLxqwo32yexKYzPcdYVTnph.png)

### ベンチマーキングテストの設定\{#configure-your-benchmarking-test}

### ベンチマーキング結果の表示\{#view-benchmarking-results}

**結果**をクリックして、ベンチマーキング結果を表示および分析します。以下はいくつかの例の結果です。

![LWa7bJGzOo9qKJx0ZNicjLXjnJh](/img/LWa7bJGzOo9qKJx0ZNicjLXjnJh.png)

![DJBibk5puoOLxYxxnH3chlxcnAd](/img/DJBibk5puoOLxYxxnH3chlxcnAd.png)

オプションで、左側のナビゲーションペインで**DBフィルター**と**ケースフィルター**を設定して、事前定義されたベクターデータベースとケースのベンチマーキング結果を比較できます。

<Admonition type="info" icon="📘" title="注釈">

<p>データベースは[database<em>name]-[db</em>label]の形式で名前が付けられています。</p>

</Admonition>

<Grid columnSize="2" widthRatios="53,46">

    <div>

        ![ZBqQb11SEoYbYyxxtAYcKzv9nSc](/img/ZBqQb11SEoYbYyxxtAYcKzv9nSc.png)

    </div>

    <div>

        ![Wg3eb5C1AoEcRUxqO0Vcc4hSntd](/img/Wg3eb5C1AoEcRUxqO0Vcc4hSntd.png)

    </div>

</Grid>