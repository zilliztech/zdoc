---
title: "コストを分析 | Cloud"
slug: /analyze-cost
sidebar_label: "コストを分析"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、可視化されたコスト分析ツールが提供されており、複数の観点から Zilliz Cloud の使用状況と支出を表示および追跡できます。 | Cloud"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コストを分析

Zilliz Cloud の **Usage** ページでは、可視化されたコスト分析ツールが提供されており、複数の観点から Zilliz Cloud の使用状況と支出を表示および追跡できます。

マーケットプレイス経由でサブスクライブしていて、マーケットプレイスアカウントごとに請求を分けたい場合は、[AWS Marketplace で Zilliz Cloud の請求を分離する](./separate-zilliz-cloud-billing-on-aws-marketplace) および関連ページを参照してください。

## 前提条件\{#prerequisites}

Zilliz Cloud の Usage ページからコストにアクセスして分析するには、**Organization Owner** または **Billing Admin** 権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析する方法は 2 つあります。 

- [Web UI 経由](./analyze-cost#via-web-ui): コストの傾向を可視化したい場合は、Web UI の使用をお勧めします。Web UI 上の使用状況の詳細は **小数点以下 10 桁** に丸められます。

- [RESTful API 経由](./analyze-cost#via-restful-api): 日次使用状況についてより詳細な分析情報が必要な場合は、RESTful API の使用をお勧めします。RESTful API から取得される使用状況の詳細は **小数点以下 10 桁** の精度です。

### Web UI 経由\{#via-web-ui}

**Billing** ページで、**Usage** タブに切り替えます。さまざまな観点で使用状況とコストの傾向を監視できます。

<Admonition type="info" icon="📘" title="📘 Notes">

Usage データは 1 時間ごとに更新されます。

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyze_cost.png "analyze_cost")

- **プロジェクト別**

    異なる事業や部門ごとに複数のプロジェクトを作成している場合、特定のプロジェクトの使用状況とコストをフィルタして表示できます。

    たとえば、Default Project（R&D 部門向け）と Project_01（Marketing 部門向け）の 2 つのプロジェクトを作成している場合、プロジェクトフィルタで Default Project を選択すると、過去 1 か月間の R&D 部門の使用状況とコストを分析できます。

    Usage Amount の棒グラフは日々の使用状況の変化を視覚的に表し、Usage Amount Details テーブルはデータを表形式で提供します。

- **クラスター別**

    ビジネスに応じて複数の異なるクラスターを作成している場合、クラスターに応じて特定のクラスターの使用状況とコストをフィルタして表示できます。 

    たとえば、ユーザー情報用と注文情報用にそれぞれ 2 つの異なるクラスターを作成している場合、注文情報を保存しているクラスターの使用状況とコストを確認したいときは、フィルタで対応するクラスターを選択できます。

- **期間別**

    特定の期間における使用状況とコストの傾向を確認するには、フィルタで期間を選択できます。

    デフォルトの期間は 1 か月で、最大で 2 か月まで指定できます。

    たとえば、2024 年 8 月の日次使用状況と支出を分析するには、日付フィルタで 2024 年 8 月 1 日から 2024 年 8 月 31 日を選択します。Usage Amount の棒グラフには、選択した期間の日次コスト傾向が表示されます。

- **コストタイプ別**

    特定のコストタイプの使用状況とコスト傾向を確認するには、フィルタで目的の請求項目を選択できます。

    利用可能なコストタイプには、CU Costs、Write Costs、Read Costs、Storage Costs (Serverless)、Storage Costs (Dedicated)、Backup Costs、Pipelines Costs が含まれます。

    たとえば、過去 1 か月間における全プロジェクトのバックアップコスト総額を分析するには、コストタイプフィルタで Backup Costs を選択します。Usage Amount の棒グラフには、選択した期間の日次バックアップコスト総額が表示されます。

- **クラウドリージョン別**

    複数のクラウドリージョンにサービスをデプロイしている場合、クラウドリージョンでフィルタして、リージョン固有の使用状況とコストを表示できます。

    たとえば、AWS us-east-1 (Virginia) と GCP europe-west3 (Frankfurt) の両方にクラスターをデプロイしている場合、AWS us-east-1 (Virginia) リージョンの使用状況とコストをフィルタして表示できます。

分析ニーズに応じて複数のフィルタを組み合わせ、可視化された使用状況とコストデータを表示できます。たとえば、プロジェクト、期間、コストタイプ、リージョンでフィルタすることで、使用状況の傾向とコストを包括的に把握できます。

### RESTful API 経由\{#via-restful-api}

<Admonition type="info" icon="📘" title="📘 Notes">

現在、Query Daily Usage RESTful API はパブリックプレビュー中です。この API を使用するには、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API を使用して、組織の日次使用状況を照会することもできます。この RESTful API から取得する使用状況の詳細は、小数点以下 8 桁の精度です。日次コストがどのように積み上げられ、小数点以下 2 桁に丸められるかを把握したい場合は、RESTful API の使用をお勧めします。日次使用量を合計すると、小数点以下 8 桁の総使用金額が得られます。次に、この総使用金額を小数点以下 2 桁に丸めます（例: &#36;60.56724390 は &#36;60.57 に丸められます）。最終的な総使用金額は、請求書に表示される金額と一致するはずです。

以下の例は、組織の日次使用状況を照会する方法を示しています。

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

- `start`: 照会期間の開始時刻。形式は `YYYY-MM-DD` です。

- `end`: 照会期間の終了時刻。形式は `YYYY-MM-DD` です。

## FAQ\{#faq}

**Zilliz Cloud の使用状況の詳細に表示される金額の精度はどの程度ですか？**

Zilliz Cloud は **小数点以下 10 桁** の精度で料金を計算しており、すべての請求はこの精度レベルで計算されます。日次料金はまず小数点以下 10 桁で計算され、その後、請求プロセス中に合計されて小数点以下 10 桁に丸められます。

- **RESTful API**: すべての数値（例: Unit Price、Usage、Usage Amount）は常にちょうど小数点以下 10 桁で返されます。値の小数部が 10 桁未満の場合、不足分は末尾に 0 が補われて 10 桁になります。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

- **Web Console UI**: 表示される金額は API の値と一致していますが、可読性のために末尾の 0 は省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。

