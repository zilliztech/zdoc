---
title: "コストの分析 | Cloud"
slug: /analyze-cost
sidebar_key: analyze-cost
sidebar_label: "コストを分析"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、視覚化されたコスト分析ツールを提供しており、Zilliz Cloud の使用状況と費用を複数の観点から確認・追跡できます。 | Cloud"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - invoice
  - view

---

import Admonition from '@theme/Admonition';


# コストの分析

Zilliz Cloud の **Usage** ページでは、視覚化されたコスト分析ツールを提供しており、複数の観点から Zilliz Cloud の使用状況と費用を確認・追跡できます。

## 前提条件\{#prerequisites}

Zilliz Cloud の Usage ページにアクセスしてコストを分析するには、**組織オーナー** または **請求管理者** の権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析する方法は 2 つあります。

- [Web UI 経由](./analyze-cost#via-web-ui): コストのトレンドを視覚化する必要がある場合は、Web UI の使用を推奨します。Web UI 上の使用状況の詳細は、**小数点以下 10 桁** で丸められています。

- [RESTful API 経由](./analyze-cost#via-restful-api): 日次の使用状況をより詳細に把握する必要がある場合は、RESTful API の使用を推奨します。RESTful API から取得した使用状況の詳細は、**小数点以下 10 桁** の精度です。

### Web UI 経由\{#via-web-ui}

**請求** ページで、**Usage** タブに切り替えます。様々な観点から使用状況とコストのトレンドを監視できます。

<Admonition type="info" icon="📘" title="Notes">

<p>使用状況データは 1 時間ごとに更新されます。</p>

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyze_cost.png "analyze_cost")

- **プロジェクト別**

    異なる業務や部門向けに複数のプロジェクトを作成している場合、特定のプロジェクトの使用状況とコストをフィルタリングして表示できます。

    例えば、2 つのプロジェクト、Default Project（R&D 部門用）と Project_01（マーケティング部門用）を作成している場合、プロジェクトフィルターで Default Project を選択することで、過去 1 か月間の R&D 部門の使用状況とコストを分析できます。

    Usage Amount 棒グラフは日次の使用状況の変化を視覚的に表現し、Usage Amount Details テーブルは表形式でデータを提供します。

- **クラスター別**

    業務に応じて複数の異なるクラスターを作成している場合、クラスター別に特定のクラスターの使用状況とコストをフィルタリングして表示できます。

    例えば、ユーザー情報と注文情報のためにそれぞれ 2 つの異なるクラスターを作成している場合、注文情報を保存しているクラスターの使用状況とコストを確認する必要があるときは、フィルターで該当するクラスターを選択できます。

- **期間別**

    特定の期間の使用状況とコストのトレンドを確認するには、フィルターで期間を選択できます。

    デフォルトの期間は 1 か月で、最大で 2 か月の期間を指定できます。

    例えば、2024 年 8 月の日次の使用状況と費用を分析するには、日付フィルターで 2024 年 8 月 1 日から 2024 年 8 月 31 日を選択します。Usage Amount 棒グラフは、選択した期間の日次コストトレンドを表示します。

- **コストタイプ別**

    特定のコストタイプの使用状況とコストのトレンドを確認するには、フィルターで希望する請求項目を選択できます。

    利用可能なコストタイプには、CU Costs、Write Costs、Read Costs、Storage Costs (Serverless)、Storage Costs (Dedicated)、Backup Costs、Pipelines Costs が含まれます。

    例えば、過去 1 か月間のすべてのプロジェクトのバックアップコストの合計を分析するには、コストタイプフィルターで Backup Costs を選択します。Usage Amount 棒グラフは、選択した期間の日次バックアップコストの合計を表示します。

- **クラウドリージョン別**

    複数のクラウドリージョンにサービスをデプロイしている場合、クラウドリージョンでフィルタリングして、リージョンごとの使用状況とコストを表示できます。

    例えば、AWS us-east-1 (Virginia) と GCP europe-west3 (Frankfurt) の両方にクラスターをデプロイしている場合、AWS us-east-1 (Virginia) リージョンの使用状況とコストをフィルタリングして表示できます。

分析のニーズに応じて、複数のフィルターを組み合わせて、視覚化された使用状況とコストデータを表示できます。例えば、プロジェクト、期間、コストタイプ、リージョンでフィルタリングすることで、使用状況のトレンドとコストを包括的に把握できます。

### RESTful API 経由\{#via-restful-api}

<Admonition type="info" icon="📘" title="Notes">

<p>Query Daily Usage RESTful API は現在パブリックプレビュー中です。この API を使用するには、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</p>

</Admonition>

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API を使用して、組織の日次使用状況をクエリすることもできます。この RESTful API から取得した使用状況の詳細は、小数点以下 8 桁の精度です。日次コストがどのように累積され、小数点以下 2 桁に丸められるかを理解する必要がある場合は、RESTful API の使用を推奨します。日次使用状況を合計することで、小数点以下 8 桁の精度で総使用金額を取得できます。次に、この総使用金額を小数点以下 2 桁に丸めます（例: &#36;60.56724390 は &#36;60.57 に丸められます）。最終的な総使用金額は、請求書に表示される金額と一致するはずです。

以下の例は、組織の日次使用状況をクエリする方法を示しています。

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com/v2/usage/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "start": "2024-01-01",
    "end": "2024-02-01"
}'
```

上記のコマンドでは、

- `start`: クエリ期間の開始時刻。形式は `YYYY-MM-DD` です。

- `end`: クエリ期間の終了時刻。形式は `YYYY-MM-DD` です。

## FAQ\{#faq}

**Zilliz Cloud の使用詳細に表示される金額の精度はどの程度ですか？**

Zilliz Cloud は、**小数点以下10桁**の精度で料金を計算しており、すべての課金はこの精度で計算されます。日次の料金はまず小数点以下10桁で計算され、その後、請求処理の際に合計して小数点以下10桁に丸められます。

- **RESTful API**: すべての数値（例: 単価、使用量、使用金額）は、常に小数点以下10桁で返されます。値の小数点以下の桁数が10桁未満の場合、末尾にゼロを追加して10桁にします。RESTful API の使用方法の詳細については、[日次使用状況のクエリ](/reference/restful/query-daily-usage-v2) を参照してください。

- **WebコンソールUI**: 表示される金額は API の値と一致しますが、可読性のため末尾のゼロは省略されます。例えば、`0.1234000000` は UI 上では `0.1234` と表示されます。
