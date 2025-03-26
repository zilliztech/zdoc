---
title: "コスト分析 | Cloud"
slug: /analyze-cost
sidebar_label: "コスト分析"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudの使用状況ページでは、可視化されたコスト分析ツールが提供されており、Zilliz Cloudの使用状況と経費を複数の次元から表示および追跡できます。 | Cloud"
type: origin
token: PSzRweRpci2IRIkVcULcHcYznxX
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - invoice
  - view
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector

---

import Admonition from '@theme/Admonition';


# コスト分析

Zilliz Cloudの**使用状況**ページでは、可視化されたコスト分析ツールが提供されており、Zilliz Cloudの使用状況と経費を複数の次元から表示および追跡できます。

## 前提条件{#prerequisites}

Zilliz Cloudの利用ページからコストを分析するには、**Organization Owner**または**Billing Admin**の権限が必要です。

## 手続き{#procedures}

Zilliz Cloudでコストを分析する方法は2つあります。

- [Web UI経由](./analyze-cost#via-web-ui):コストの傾向を視覚化する必要がある場合は、Web UIを使用することをお勧めします。Web UIの使用状況の詳細は、**小数点以下2桁**まで丸められています（例:$60.0 0）。

- [RESTful API経由](./analyze-cost#via-restful-api):毎日の使用状況についてより詳細な情報が必要な場合は、RESTful APIを使用することをお勧めします。RESTful APIから得られる使用状況の詳細は、**小数点以下8桁**まで正確です（例:$60.0 0 257846）。

### Web UIから{#via-web-ui}

[**請求**]ページで、[**使用状況**]タブに切り替えます。さまざまな次元で使用状況とコストの傾向を監視できます。

<Admonition type="info" icon="📘" title="ノート">

<p>使用データは1時間ごとに更新されます。</p>

</Admonition>

![analyze_cost](/img/ja-JP/analyze_cost.png)

- **プロジェクト別**

    異なるビジネスまたは部門向けに複数のプロジェクトを作成した場合、特定のプロジェクトの使用状況とコストをフィルタリングして表示できます。

    例えば、R&D部門用の「Default Project」とマーケティング部門用の「Project_01」の2つのプロジェクトを作成した場合、プロジェクトフィルターで「Default Project」を選択して、過去1か月間のR&D部門の使用状況とコストを分析できます。

    使用量の棒グラフは毎日の使用量の変化を視覚的に表し、使用量の詳細表は表形式でデータを提供します。

- **クラスタ別**

    ビジネスに基づいて複数の異なるクラスターを作成した場合、クラスターに応じて特定のクラスターの特定の使用状況とコストをフィルタリングして表示できます。

    たとえば、ユーザ情報と注文情報のためにそれぞれ2つの異なるクラスタを作成した場合、注文情報を格納するクラスタの使用状況とコストを確認する必要がある場合は、フィルタで対応するクラスタを選択できます。

- **期間によって**

    特定の期間にわたる使用状況とコストの傾向を確認するには、フィルターで期間を選択できます。

    既定の期間は1か月で、最大期間は2か月です。

    例えば、2024年8月の毎日の使用量と支出を分析するには、日付フィルターで2024年8月1日から2024年8月31日を選択します。使用量の棒グラフには、選択した期間の毎日のコストの傾向が表示されます。

- **コストタイプ別**

    特定のコストタイプの使用状況とコストの傾向を調べるには、フィルターで必要な請求項目を選択します。

    利用可能なコストタイプには、CUコスト、書き込みコスト、読み取りコスト、ストレージコスト（サーバーレス）、ストレージコスト（専用）、バックアップコスト、パイプラインコストが含まれます。

    例えば、過去1ヶ月間のすべてのプロジェクトのバックアップコストの合計を分析するには、コストタイプフィルターで「バックアップコスト」を選択します。使用量の棒グラフには、選択した時間範囲の1日あたりのバックアップコストの合計が表示されます。

- **クラウド地域別**

    複数のクラウドリージョンにサービスをデプロイしている場合は、クラウドリージョンでフィルタリングして、リージョン固有の使用状況とコストを表示できます。

    たとえば、AWS us-east-1(Virginia)とGCP rope-west 3(Frankfurt)の両方にクラスターをデプロイした場合、AWS us-east-1(Virginia)リージョンの使用状況とコストをフィルタリングして表示できます。

分析ニーズに基づいて複数のフィルターを組み合わせて、使用状況とコストのデータを視覚化することができます。例えば、プロジェクト、期間、コストタイプ、地域別にフィルターをかけることで、使用傾向とコストを包括的に把握することができます。

### RESTful APIを使用する{#via-restful-api}

[毎日の使用を見るRESTful API](/reference/restful/query-daily-usage-v2)から得られる使用状況の詳細は、小数点以下8桁まで正確です。1日のコストがどのように蓄積され、小数点以下2桁に丸められるかを理解する必要がある場合は、RESTful APIを使用することをお勧めします。1日の使用量を合計すると、小数点以下8桁まで正確な総使用量が得られます。次に、この総使用量を小数点以下2桁に丸めます(例:$60.5 6 724390は$60.57に丸められます)。最終的な総使用量は、請求書に表示されている数字と一致する必要があります。

## よくある質問(FAQ){#faq}

- **Zilliz Cloudの利用詳細に表示される金額はどの程度正確ですか?**

    Zilliz Cloudは小数点以下8桁の精度で製品の価格を設定します。その結果、料金は小数点以下8桁で計算されます。請求過程で、これらの詳細な日次料金は合計され、小数点以下2桁に丸められます。

    ウェブUIでは、表示される金額は小数点以下2桁に丸められます（例:$60.0 0）。

    ![precision_usage](/img/ja-JP/precision_usage.png)

    Query Org Daily U sage APIから取得した使用状況の詳細には、小数点以下8桁の精度で金額が表示されます。以下は出力の例です。

    ```bash
    {
        "code": 0,
        "data": {
            "list": [
                {
                    "intervalStart": "2024-01-01T00:00:00Z",
                    "intervalEnd": "2024-01-02T00:00:00Z",
                    "total": 69.59794400,
                    "currency": "RMB"
                    "results": [
                        {
                            "costType": "compute",
                            "properties": {
                                "projectId": "prj-xxxxx",
                                "regionId": "ali-cn-hangzhou",
                                "cuType": "Performance-optimized",
                                "plan": "Enterprise",
                                "clusterId": "in01-xxxxx"
                            },
                            "quantity": 55.6778,
                            "unit": "CU-hours",
                            "listPrice": {
                                "unitPrice": 1.25000000
                            },
                            "price": {
                                "unitPrice": 1.25000000
                            },
                            "amount": 69.59725000 
                        },
                        {
                            "costType": "storage",
                            "properties": {
                                "projectId": "prj-xxxxx",
                                "regionId": "ali-cn-hangzhou",
                                "cuType": "Performance-optimized",
                                "plan": "Enterprise",
                                "clusterId": "in01-xxxxx",
                            },
                            "quantity": 323,
                            "unit": "GB-hours",
                            "listPrice": {
                                "unitPrice": 0.000694
                            },
                            "price": {
                                "unitPrice": 0.000694
                            },
                            "amount": 0.00069400
                        }
                    ]
                }
            ],
            "currentPage": 1,
            "pageSize": 100,
            "total": 10000
        }
    }
    ```

    