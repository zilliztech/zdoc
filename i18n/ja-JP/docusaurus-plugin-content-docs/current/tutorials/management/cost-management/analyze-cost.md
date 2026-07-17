---
title: "コスト分析 | Cloud"
slug: /analyze-cost
sidebar_label: "コスト分析"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、可視化されたコスト分析ツールが提供されており、複数の観点から Zilliz Cloud の使用状況と費用を表示・追跡できます。 | Cloud"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト分析

Zilliz Cloud の **Usage** ページでは、可視化されたコスト分析ツールが提供されており、複数の観点から Zilliz Cloud の使用状況と費用を表示・追跡できます。

マーケットプレイス経由で契約していて、マーケットプレイスアカウントごとに請求を分けたい場合は、[AWS Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-aws-marketplace) およびその関連ページを参照してください。

## 前提条件\{#prerequisites}

Zilliz Cloud の Usage ページからコストにアクセスして分析するには、**Organization Owner** または **Billing Admin** 権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析する方法は 2 つあります。 

- [Web UI 経由](./analyze-cost#via-web-ui): コストの傾向を可視化したい場合は、Web UI の使用を推奨します。Web UI 上の使用状況の詳細は **小数点以下 10 桁**に丸められます。

- [RESTful API 経由](./analyze-cost#via-restful-api): 日次の使用状況についてより詳細な分析情報が必要な場合は、RESTful API の使用を推奨します。RESTful API から取得される使用状況の詳細は **小数点以下 10 桁**の精度です。

### Web UI 経由\{#via-web-ui}

**Billing** ページで、**Usage** タブに切り替えます。さまざまな観点で使用状況とコストの傾向を監視できます。

<Admonition type="info" icon="📘" title="📘 注意">

Usage データは 1 時間ごとに更新されます。

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyze_cost.png "analyze_cost")

- **By Project**

    異なる業務や部門向けに複数のプロジェクトを作成している場合、特定のプロジェクトの使用状況とコストを絞り込んで表示できます。

    たとえば、Default Project（R&D 部門用）と Project_01（Marketing 部門用）の 2 つのプロジェクトを作成している場合、プロジェクトフィルターで Default Project を選択すると、過去 1 か月間の R&D 部門の使用状況とコストを分析できます。

    Usage Amount の棒グラフには日次の使用量の変化が視覚的に表示され、Usage Amount Details テーブルには表形式でデータが表示されます。

- **By Cluster**

    業務に応じて複数の異なるクラスターを作成している場合、クラスターに応じて特定のクラスターの使用状況とコストを絞り込んで表示できます。 

    たとえば、ユーザー情報用と注文情報用にそれぞれ 2 つの異なるクラスターを作成している場合、注文情報を保存しているクラスターの使用状況とコストを確認する必要があるときは、フィルターで対応するクラスターを選択できます。

&lt;include>

- **By Time Period**

    特定の期間における使用状況とコストの傾向を確認するには、フィルターで期間を選択できます。

    デフォルトの期間は 1 か月で、最大範囲は 2 か月です。

    たとえば、2024 年 8 月の日次の使用状況と費用を分析するには、日付フィルターで 2024 年 8 月 1 日から 2024 年 8 月 31 日を選択します。Usage Amount の棒グラフには、選択した期間の日次コスト傾向が表示されます。

- **By Cost Type**

    特定のコストタイプの使用状況とコスト傾向を確認するには、フィルターで目的の請求項目を選択できます。

    使用可能なコストタイプには、CU Costs、Write Costs、Read Costs、Storage Costs (Serverless)、Storage Costs (Dedicated)、Backup Costs、Pipelines Costs が含まれます。

    たとえば、過去 1 か月間のすべてのプロジェクトにおけるバックアップの総コストを分析するには、コストタイプフィルターで Backup Costs を選択します。Usage Amount の棒グラフには、選択した期間のバックアップの日次総コストが表示されます。

- **By Cloud Region**

    複数のクラウドリージョンにサービスをデプロイしている場合、クラウドリージョンで絞り込んで、リージョンごとの使用状況とコストを表示できます。

    たとえば、AWS us-east-1 (Virginia) と GCP europe-west3 (Frankfurt) の両方にクラスターをデプロイしている場合、AWS us-east-1 (Virginia) リージョンの使用状況とコストを絞り込んで表示できます。

分析ニーズに応じて複数のフィルターを組み合わせ、可視化された使用状況とコストデータを確認できます。たとえば、プロジェクト、期間、コストタイプ、リージョンでフィルターして、使用状況の傾向とコストを包括的に把握できます。

### RESTful API 経由\{#via-restful-api}

<Admonition type="info" icon="📘" title="📘 注意">

Query Daily Usage RESTful API は現在パブリックプレビューです。この API を使用するには、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API を使用して、組織の日次使用状況をクエリすることもできます。この RESTful API から取得する使用状況の詳細は小数点以下 8 桁の精度です。日次コストがどのように積み上げられ、小数点以下 2 桁に丸められるかを把握したい場合は、RESTful API の使用を推奨します。日次使用量を合計すると、小数点以下 8 桁の精度を持つ総使用量を取得できます。その後、この総使用量を小数点以下 2 桁に丸めます（例: &#36;60.56724390 は &#36;60.57 に丸められます）。最終的な総使用量は、請求書に表示される金額と一致するはずです。

次の例は、組織の日次使用状況をクエリする方法を示しています。

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

**Zilliz Cloud の使用状況の詳細に表示される金額はどの程度正確ですか？**

Zilliz Cloud は **小数点以下 10 桁**の精度で料金を計算しており、すべての請求はこの精度レベルで算出されます。日次料金はまず小数点以下 10 桁まで計算され、その後、請求処理中に合計されて小数点以下 10 桁に丸められます。

- **RESTful API**: すべての数値（例: Unit Price、Usage、Usage Amount）は、常にちょうど小数点以下 10 桁で返されます。値の小数桁数が 10 桁未満の場合は、末尾に 0 が補完されて 10 桁になります。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

- **Web Console UI**: 表示される金額は API の値と一致しますが、可読性のために末尾の 0 は省略されます。たとえば、`0.1234000000` は `0.1234` と表示されます i
