---
title: "コスト分析 | Cloud"
slug: /analyze-cost
sidebar_label: "コスト分析"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Usage ページでは、視覚化されたコスト分析ツールを利用でき、Zilliz Cloud の使用量と費用を複数の観点から表示・追跡できます。 | Cloud"
type: origin
token: LJplw7Q9Gi09GMkiy8PcbYp6nrg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# コスト分析

Zilliz Cloud の **Usage** ページでは、視覚化されたコスト分析ツールを利用でき、Zilliz Cloud の使用量と費用をさまざまな観点から表示・追跡できます。

マーケットプレイス経由でサブスクリプションを契約していて、マーケットプレイスのアカウントごとに請求を分けたい場合は、[Separate Zilliz Cloud Billing on AWS Marketplace](./separate-zilliz-cloud-billing-on-aws-marketplace) とその関連ページを参照してください。

## 事前準備\{#prerequisites}

Zilliz Cloud の Usage ページでコストにアクセスして分析するには、**Organization Owner** または **Billing Admin** の権限が必要です。

## 手順\{#procedures}

Zilliz Cloud でコストを分析する方法は 2 つあります。

- [Web UI を使用する](./analyze-cost#via-web-ui): コストの傾向を視覚化する必要がある場合は、Web UI の使用をお勧めします。Web UI の使用量の詳細は、**小数点以下 10 桁**に丸められます。

- [RESTful API を使用する](./analyze-cost#via-restful-api): 日々の使用量についてより詳細な分析情報が必要な場合は、RESTful API の使用をお勧めします。RESTful API から取得した使用量の詳細は、**小数点以下 10 桁**まで正確です。

### Web UI を使用する\{#via-web-ui}

**Billing** ページで **Usage** タブに切り替えます。さまざまな観点から使用量とコストの傾向を監視できます。

<Admonition type="info" title="Notes">

使用量データは 1 時間ごとに更新されます。

</Admonition>

![analyze_cost](https://zdoc-images.s3.us-west-2.amazonaws.com/analyzecost.png "analyze_cost")

- **プロジェクト別**

    異なる事業や部門向けに複数のプロジェクトを作成している場合は、特定のプロジェクトの使用量とコストを絞り込んで表示できます。

    たとえば、Default Project（研究開発部門向け）と Project_01（マーケティング部門向け）の 2 つのプロジェクトを作成している場合、プロジェクトフィルターで Default Project を選択すると、研究開発部門の過去 1 か月間の使用量とコストを分析できます。

    Usage Amount の棒グラフは日々の使用量の変化を視覚的に表し、Usage Amount Details テーブルはデータを表形式で提供します。

- **クラスター別**

    事業に応じて複数の異なるクラスターを作成している場合は、クラスターに応じて特定のクラスターの使用量とコストを絞り込んで表示できます。

    たとえば、ユーザー情報用と注文情報用にそれぞれ異なる 2 つのクラスターを作成している場合、注文情報を保存するクラスターの使用量とコストを確認するときは、フィルターで該当するクラスターを選択します。

- **期間別**

    特定期間の使用量とコストの傾向を確認するには、フィルターで期間を選択できます。

    デフォルトの期間は 1 か月で、最大範囲は 2 か月です。

    たとえば、2024 年 8 月の日々の使用量と費用を分析するには、日付フィルターで 2024 年 8 月 1 日から 2024 年 8 月 31 日を選択します。Usage Amount の棒グラフには、選択した期間の日々のコスト傾向が表示されます。

- **コストタイプ別**

    特定のコストタイプの使用量とコスト傾向を調べるには、フィルターで目的の請求項目を選択できます。

    利用可能なコストタイプには、CU Costs、Write Costs、Read Costs、Storage Costs (Serverless)、Storage Costs (Dedicated)、Backup Costs、Pipelines Costs があります。

    たとえば、過去 1 か月間の全プロジェクトのバックアップコストの合計を分析するには、コストタイプフィルターで Backup Costs を選択します。Usage Amount の棒グラフには、選択した期間の 1 日あたりのバックアップコストの合計が表示されます。

- **クラウドリージョン別**

    複数のクラウドリージョンにサービスをデプロイしている場合は、クラウドリージョンで絞り込むことで、リージョン別の使用量とコストを表示できます。

    たとえば、AWS us-east-1（バージニア）と GCP europe-west3（フランクフルト）の両方にクラスターをデプロイしている場合は、AWS us-east-1（バージニア）リージョンの使用量とコストを絞り込んで表示できます。

分析のニーズに応じて複数のフィルターを組み合わせ、視覚化された使用量とコストのデータを表示できます。たとえば、プロジェクト、期間、コストタイプ、リージョンで絞り込むことで、使用量の傾向とコストを総合的に把握できます。

### RESTful API を使用する\{#via-restful-api}

<Admonition type="info" title="Notes">

Query Daily Usage RESTful API は現在パブリックプレビューです。この API を使用するには、[お問い合わせください](http://support.zilliz.com)。

</Admonition>

また、[Query Daily Usage](/reference/restful/query-daily-usage-v2) API を使用して、組織の日々の使用量を照会できます。この RESTful API から取得した使用量の詳細は、小数点以下 8 桁まで正確です。日々のコストがどのように累積され、小数点以下 2 桁に丸められるかを把握する必要がある場合は、RESTful API の使用をお勧めします。日々の使用量を合計すると、小数点以下 8 桁まで正確な総使用量が得られます。次に、この総使用量を小数点以下 2 桁に丸めます（例: &#36;60.56724390 は &#36;60.57 に丸められます）。最終的な総使用量は、請求書に表示される金額と一致する必要があります。

次の例では、組織の日々の使用量を照会する方法を示します。

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com/v2/usage/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-02-01T00:00:00Z"
}'
```

上記のコマンドでは、

- `start`: クエリ期間の開始時刻です。RFC 3339 形式（例: `2024-01-01T00:00:00Z`）で指定します。UTC の午前 0 時である必要があります。UTC 以外のオフセットはまず UTC に変換されるため、日付がずれます。UTC の午前 0 時でない開始時刻を指定すると、エラーにはならず、その日のバケットが空の `items` 配列と `0` の `total` を返します。

- `end`: クエリ期間の終了時刻です。RFC 3339 形式（例: `2024-02-01T00:00:00Z`）で指定します。終了日は両端を含みます。`end` を `start` と同じ値に設定すると、1 つの日次バケットが返されます。

## FAQ\{#faq}

**Zilliz Cloud の使用量の詳細に表示される金額はどの程度正確ですか？**

Zilliz Cloud は**小数点以下 10 桁**の精度で料金を計算し、すべての請求はこの精度で計算されます。日々の料金はまず小数点以下 10 桁で計算され、その後、請求プロセスで合計され小数点以下 10 桁に丸められます。

- **RESTful API**: すべての数値（Unit Price、Usage、Usage Amount など）は、常に小数点以下 10 桁まで正確に返されます。値の小数部が 10 桁未満の場合は、10 桁に達するまで末尾にゼロが付加されます。RESTful API の使用方法については、[Query Daily Usage](/reference/restful/query-daily-usage-v2) を参照してください。

- **Web Console UI**: 表示される金額は API の値と一致しますが、読みやすさのため末尾のゼロは省略されます。たとえば、`0.1234000000` は UI では `0.1234` と表示されます。
