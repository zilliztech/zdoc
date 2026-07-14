---
title: "Datadog との統合 | Cloud"
slug: /integrate-with-datadog
sidebar_label: "Datadog"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Datadog は、アプリケーションのパフォーマンス、インフラストラクチャ、ログ管理に関するリアルタイムのインサイトを提供するクラウド監視および分析プラットフォームです。Zilliz Cloud を Datadog と統合することで、Zilliz Cloud クラスターに関するメトリクスデータを Datadog ダッシュボードに送信できます。 | Cloud"
type: origin
token: JGFQwMcVmiikeOkhepGcQ8Ken0e
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Datadog との統合

[Datadog](https://www.datadoghq.com/) は、アプリケーションのパフォーマンス、インフラストラクチャ、ログ管理に関するリアルタイムのインサイトを提供するクラウド監視および分析プラットフォームです。Zilliz Cloud を Datadog と統合することで、Zilliz Cloud クラスターに関するメトリクスデータを Datadog ダッシュボードに送信できます。

<Admonition type="info" icon="📘" title="注意">

この機能は、**Enterprise** プロジェクト内の **Dedicated** クラスターでのみ利用できます。

</Admonition>

## 始める前に\{#before-you-start}

- Datadog と統合するには、プロジェクトに対する **Organization Owner** または **Project Admin** のアクセス権が必要です。必要な権限がない場合は、Zilliz Cloud 管理者にお問い合わせください。

- Datadog アカウントと Datadog API キーが必要です。API キーへのアクセス方法については、[API and Application Keys](https://docs.datadoghq.com/account_management/api-app-keys/#application-keys) を参照してください。

## 手順\{#procedure}

![integrate-with-datadog-1](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-datadog-1.png "integrate-with-datadog-1")

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページの左側ナビゲーションペインで、**Integrations** をクリックします。

1. **Datadog** セクションを見つけて、その横の **+ Configuration** をクリックします。

1. 表示されるダイアログボックスで、Datadog をプロジェクトにリンクし、メトリクスデータを収集するクラスターを割り当てます。

    1. **Configure Datadog Integration** ステップで、Datadog の設定を構成します。

        1. **Configuration Name** に、統合の名前を入力します（例: `DG_configuration`）。

        1. **Datadog API Key** に、Datadog API キーを入力します。

        1. **Datadog Site** で、Datadog サイトを選択します。Zilliz Cloud は以下の Datadog サイトをサポートしています。

            | Site | Site URL | Site Parameter | Location |
            | --- | --- | --- | --- |
            | `US1` | `https://app.datadoghq.com` | `datadoghq.com` | US |
            | `US3` | `https://us3.datadoghq.com` | `us3.datadoghq.com` | US |
            | `US5` | `https://us5.datadoghq.com` | `us5.datadoghq.com` | US |
            | `EU1` | `https://app.datadoghq.eu` | `datadoghq.eu` | EU (Germany) |
            | `AP1` | `https://ap1.datadoghq.com` | `ap1.datadoghq.com` | Japan |

            Datadog サイトの詳細については、[Access Datadog Sites](https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site) を参照してください。 

        1. **Test Integration** をクリックして、Zilliz Cloud と Datadog 間の接続を確認します。テストが成功したら、クラスターの割り当てに進みます。

    1. **Assign Configuration to Zilliz Cloud Cluster(s)** ステップで、メトリクスデータを Datadog に送信する 1 つ以上のクラスターを選択します。

        <Admonition type="info" icon="📘" title="注意">

        選択できるのは **Dedicated-Enterprise** プラン階層のクラスターのみです。

        </Admonition>

    1. **Create** をクリックします。

</Procedures>

## 統合の進行状況を監視する\{#monitor-integration-progress}

セットアップ後、**Integrations** ページに戻り、Datadog 統合が指定した設定の詳細とともに一覧表示されていることを確認します。ステータスが **Active** に変われば、統合は成功です。Zilliz Cloud は 1 分単位の頻度で Datadog にデータを送信し、ほぼリアルタイムの更新を実現します。

統合の横にある外部リンクアイコンをクリックすると、関連付けられた Datadog ダッシュボードを開き、選択した Zilliz Cloud クラスターから送信されたクラスターメトリクスを確認できます。

![integrate-with-datadog-2](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-datadog-2.png "integrate-with-datadog-2")

## 統合を管理する\{#manage-integrations}

Datadog 統合を管理するには、**Actions** 列を使用します。

- **Edit**: 監視対象のクラスターを更新するか、必要に応じて統合設定を変更します。

- **Remove**: 不要になった場合は統合を削除します。

![integrate-with-datadog-3](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-datadog-3.png "integrate-with-datadog-3")

## Datadog で利用可能なパフォーマンスメトリクス\{#performance-metrics-available-to-datadog}

[Datadog](https://www.datadoghq.com/) は、Zilliz Cloud クラスターについて以下のメトリクスデータを追跡します。括弧内のメトリクス名は Datadog UI で使用される名前です。

### リソース\{#resource}

| Metric Name | Metric Type | Description |
| --- | --- | --- |
| CU Computation<br/>(`zilliz.cluster.cu.computation.current`) | Gauge | CU の総容量に対する使用済み容量の割合を示します。範囲は 0 から 1 です。 |
| CU Capacity<br/>(`zilliz.cluster.cu.capacity.current`) | Gauge | CU の総計算容量に対する使用中の計算能力の割合を示します。範囲は 0 から 1 です。 |
| Storage<br/>(`zilliz.cluster.storage.bytes.current`) | Gauge | データとインデックスによって消費される永続ストレージの総量です。 |

### パフォーマンス\{#performance}

| Metric Name | Metric Type | Description |
| --- | --- | --- |
| Cluster Write Performance Capacity<br/>(`zilliz.cluster.write.performance.capacity.current`) | Gauge | 書き込みレート制限に対する現在の書き込み操作レートの割合を示します。範囲は 0 から 1 です。 |
| Slow Query Count<br/>(`zilliz.request.slow.queries.total`) | Count | 低速なクエリリクエストの総数です。 |
| QPS, Request Failure Rate, Number of Flush Operations<br/>(`zilliz.requests.total`) | Count | 処理されたリクエストの総数です。 |
| VPS<br/>(`zilliz.request.vectors.total`) | Count | すべてのリクエストで操作されたベクトルの総数です。 |
| Latency<br/>(`zilliz.request.latency.milliseconds.average`, `zilliz.request.latency.milliseconds.p99`) | Gauge | 処理されたリクエストの平均/P99 レイテンシです。 |

### データ\{#data}

| Metric Name | Metric Type | Description |
| --- | --- | --- |
| Entity Count<br/>(`zilliz.entities.current`) | Gauge | エンティティの数です。 |
| Loaded Entities<br/>(`zilliz.loaded.entities.current`) | Gauge | ロード済みエンティティの数です。 |
| Collection Count<br/>(`zilliz.collections.current`) | Gauge | コレクションの数です。 |
| Number of Unloaded Collections<br/>(`zilliz.unloaded.collections.current`) | Gauge | アンロードされたコレクションの数です。 |

## Datadog で利用可能なタグ\{#tags-available-to-datadog}

Datadog は、一部のメトリクスに以下のタグを送信し、リソースの理解、整理、識別をしやすくします。

| Tag Name | Description |
| --- | --- |
| `org_id` | メトリクスに関連付けられた Zilliz Cloud 組織の ID。 |
| `project_id` | メトリクスに関連付けられた Zilliz Cloud プロジェクトの ID。 |
| `cluster_id` | メトリクスに関連付けられた Zilliz Cloud クラスターの ID。 |
| `request_type` | 監視対象の操作の種類。指定可能な値: `insert`, `upsert`, `delete`, `bulk_insert`, `flush`, `search`, `query` |
| `status` | 操作の結果。指定可能な値: `success`, `fail` |
