---
title: "コストを分析する | Cloud"
slug: /analyze-cost
sidebar_label: "コストを分析する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、視覚化されたコスト分析ツールが提供されており、複数の観点から Zilliz Cloud の使用量と費用を表示・追跡できます。 | Cloud"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コストを分析する

Zilliz Cloud の **Usage** ページでは、視覚化されたコスト分析ツールが提供されており、複数の観点から Zilliz Cloud の使用量と費用を表示・追跡できます。

マーケットプレイスを通じてサブスクライブしており、マーケットプレイスのアカウントごとに請求を分離したい場合は、[AWS Marketplace での Zilliz Cloud 請求の分離](./separate-zilliz-cloud-billing-on-aws-marketplace) およびその関連ページを参照してください。

## 事前準備\{#prerequisites}

Zilliz Cloud の使用量ページからコストにアクセスして分析するには、**Organization Owner** または **Billing Admin** の権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析する方法は 2 つあります。 

- [Web UI を使用する場合](./analyze-cost#via-web-ui): コストの傾向を視覚化する必要がある場合は、Web UI の使用をお勧めします。Web UI の使用量詳細は**小数点以下 10 桁**に丸められます。

- [RESTful API を使用する場合](./analyze-cost#via-restful-api): 日次の使用量についてより詳細な分析情報が必要な場合は、RESTful API の使用をお勧めします。RESTful API から取得した使用量詳細は**小数点以下 10 桁**の精度です。

### Web UI を使用する場合\{#via-web-ui}

**Billing** ページで **Usage** タブに切り替えます。さまざまな観点から使用量とコストの傾向を監視できます。

<Admonition type="info" title="Notes">

使用量データは 1 時間ごとに更新されます。

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyzecost.png "analyze_cost")

- **プロジェクト別**

    異なる事業や部門のために複数のプロジェクトを作成している場合は、特定のプロジェクトの使用量とコストを絞り込んで表示できます。

    たとえば、Default Project（研究開発部門用）と Project_01（マーケティング部門用）という 2 つのプロジェクトを作成している場合、プロジェクトフィルターで Default Project を選択すると、研究開発部門の過去 1 か月間の使用量とコストを分析できます。

    使用量の棒グラフは日次の使用量の変化を視覚的に表し、使用量詳細テーブルはデータを表形式で提供します。

- **クラスター別**

    事業に応じて複数の異なるクラスターを作成している場合は、クラスターごとに、特定のクラスターの使用量とコストを絞り込んで表示できます。

    たとえば、ユーザー情報用と注文情報用にそれぞれ異なる 2 つのクラスターを作成している場合、注文情報を保存しているクラスターの使用量とコストを確認する必要があるときは、フィルターで該当するクラスターを選択できます。

- **期間別**

    特定の期間における使用量とコストの傾向を確認するには、フィルターで期間を選択できます。

    デフォルトの期間は 1 か月で、最大で 2 か月まで指定できます。

    たとえば、2024 年 8 月の日次の使用量と費用を分析するには、日付フィルターで 2024 年 8 月 1 日から 2024 年 8 月 31 日までを選択します。使用量の棒グラフには、選択した期間の日次のコスト傾向が表示されます。

- **コストタイプ別**

    特定のコストタイプの使用量とコストの傾向を調べるには、フィルターで目的の請求項目を選択できます。

    利用可能なコストタイプには、CU Costs、Write Costs、Read Costs、Storage Costs（Serverless）、Storage Costs（Dedicated）、Backup Costs、Pipelines Costs があります。

    たとえば、過去 1 か月間の全プロジェクトのバックアップコストの合計を分析するには、コストタイプフィルターで Backup Costs を選択します。使用量の棒グラフには、選択した期間の日次のバックアップコストの合計が表示されます。

- **クラウドリージョン別**

    複数のクラウドリージョンにサービスをデプロイしている場合は、クラウドリージョンで絞り込んで、リージョンごとの使用量とコストを表示できます。

    たとえば、AWS us-east-1（バージニア）と GCP europe-west3（フランクフルト）の両方にクラスターをデプロイしている場合、AWS us-east-1（バージニア）リージョンの使用量とコストを絞り込んで表示できます。

分析のニーズに応じて複数のフィルターを組み合わせて、視覚化された使用量とコストのデータを表示できます。たとえば、プロジェクト、期間、コストタイプ、リージョンで絞り込むことで、使用量の傾向とコストを包括的に把握できます。

### RESTful API を使用する場合\{#via-restful-api}

<Admonition type="info" title="Notes">

Query Daily Usage RESTful API は現在パブリックプレビューです。この API を使用するには、[お問い合わせ](http://support.zilliz.com) ください。

</Admonition>

[Query Daily Usage](/reference/restful/query-daily-usage-v2) API を使用して、組織の日次の使用量をクエリすることもできます。この RESTful API から取得する使用量詳細は小数点以下 8 桁の精度です。日次のコストがどのように累積され、小数点以下 2 桁に丸められるのかを理解する必要がある場合は、RESTful API の使用をお勧めします。日次の使用量を合計すると、小数点以下 8 桁の精度の合計使用量が得られます。次に、この合計使用量を小数点以下 2 桁に丸めます（例：&#36;60.56724390 は &#36;60.57 に丸められます）。最終的な合計使用量は、請求書に表示される数値と一致するはずです。

次の例では、組織の日次の使用量をクエリする方法を示します。

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

- `start`: クエリ期間の開始時刻で、形式は `YYYY-MM-DD` です。

- `end`: クエリ期間の終了時刻で、形式は `YYYY-MM-DD` です。

## FAQ\{#faq}

**Zilliz Cloud の使用量詳細に表示される金額はどの程度正確ですか？**

Zilliz Cloud は**小数点以下 10 桁**の精度で料金を計算し、すべての請求はこの精度レベルで計算されます。日次の料金はまず小数点以下 10 桁で計算され、その後、請求プロセスで合計され、小数点以下 10 桁に丸められます。

- **RESTful API**: すべての数値（Unit Price、Usage、Usage Amount など）は常に小数点以下ちょうど 10 桁で返されます。値の小数点以下の桁数が 10 桁未満の場合は、10 桁に達するまで末尾にゼロが埋め込まれます。RESTful API の使用方法の詳細については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

- **Web Console UI**: 表示される金額は API の値と一致しますが、読みやすさのために末尾のゼロは省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。
