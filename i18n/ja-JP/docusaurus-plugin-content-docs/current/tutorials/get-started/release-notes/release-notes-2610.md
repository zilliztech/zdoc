---
title: "2026年10月 リリースノート | Cloud"
slug: /release-notes-2610
sidebar_label: "2026年10月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: A4jhweVMMigHOpkwDlLcKo0SnFe
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年10月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-10-19**

    </div>

    <div>

        ## Zero Downtime Migration | ON REQUEST\{#zero-downtime-migration}

        ソースクラスターを利用可能なまま、データベース内のすべてのコレクションまたは選択したコレクションを、同じ組織内の既存の Dedicated クラスターに移行します。

        - **柔軟なソース:** ソースには、同じプロジェクトまたは同じ組織内の別のプロジェクトにある Dedicated、Serverless、または Free クラスターを使用できます。

        - **既存データと増分データ:** Zilliz Cloud はまず既存データをコピーし、その後、最大 7 日間、insert、upsert、delete の同期を継続します。

        - **制御された切り替え:** 同期ラグが 10 秒未満になったら、ソースへの書き込みを停止し、同期を停止して、アプリケーションをターゲットクラスターに切り替えます。

        - **バージョン要件:** 両方のクラスターが最新の Milvus v2.6.x バージョンを実行している必要があります。

        この機能はリクエストに応じて利用できます。有効にするには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。詳細は、[Zero Downtime Migration](./zero-downtime-migration) を参照してください。

        ## Data Backfill | ON REQUEST\{#data-backfill}

        Zilliz Cloud ボリューム内の Parquet ファイルから、既存エンティティの選択したフィールドを大規模に更新します。たとえば、新しく追加したフィールドへのデータ投入や欠損値の補完に使用できます。

        - **プライマリキーによる照合:** バックフィルジョブは、プライマリキーによって入力レコードをエンティティと照合し、新しいエンティティを挿入することはありません。

        - **3 つのバックフィルモード:** NULL 値のみを埋める `coalesce`（デフォルト）、一致したエンティティの値を置き換える `overwrite`、または一致しないエンティティのフィールドも NULL に設定する `replace` から選択します。

        - **事前チェック:** コレクションを変更せずに、最初に事前チェックを実行して入力を検証できます。

        - **Spark バッチジョブ:** Data Backfill は RESTful API を通じて Spark バッチジョブとして実行され、AWS us-west-2（オレゴン）でのみ利用できます。

        この機能はリクエストに応じて利用できます。有効にするには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。詳細は、[Data Backfill](./data-backfill) を参照してください。

        ## Google Cloud クラスターで CMEK をサポート\{#cmek-is-supported-with-google-cloud-clusters}

        - Google Cloud の `Business Critical` プロジェクトで、Google Cloud KMS キーを **カスタマーマネージド暗号化キー（CMEK）** として追加し、同じリージョンで Dedicated クラスターを作成するとき、または暗号化されたバックアップから復元するときに選択できるようになりました。

        詳細は、[Google Cloud KMS](./gcp-kms) を参照してください。

        ## BYOC の利用可能リージョンを拡大\{#more-regions-for-byoc}

        - BYOC プロジェクトを、さらに 2 つのリージョンにデプロイできるようになりました。Google Cloud europe-west9（パリ、フランス）および AWS ap-southeast-7（タイ）です。

        詳細は、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

        ## 機能強化\{#enhancements}

        - **Organization Owner を SSO の強制対象から除外するかどうかを選択可能** — SSO を強制するとき、**Enable SSO Enforcement** ダイアログで、Organization Owner が SSO なしでログインできるようにするかどうかを選択できるようになりました。オーナーの適用除外はデフォルトで有効になっているため、すでに SSO を強制している組織に変更はありません。すべてのメンバー（Organization Owner を含む）に SSO を必須とするには、**Allow Organization Owners to log in without SSO** をオフにします。詳細は、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

        - **SAML 2.0 を使用した SSO 向け Ping Identity（PingOne プラットフォーム）** — **Configure Single Sign-On (SSO)** ダイアログで、専用の **Ping Identity (SAML 2.0)** オプションを選択できるようになり、PingOne との SSO を設定するためのステップバイステップガイドが提供されます。詳細は、[PingOne (SAML 2.0)](./single-sign-on-with-ping-one) を参照してください。

        - **オンデマンドクラスターのキープウォームスケジュール** — オンデマンドクラスターが稼働し続ける週次タイムウィンドウを設定します。ウィンドウが開始すると、クラスターがサスペンドされている場合は Zilliz Cloud がクラスターを再開し、ウィンドウが終了するまで自動サスペンドを一時停止します。ウィンドウの終了後は、通常の自動サスペンド設定が再び適用されます。スケジュールには、組織のシステムタイムゾーンで最大 10 個のルールを設定でき、コンソールまたはオンデマンドクラスター API の `keepWarm` オブジェクトを通じて管理できます。詳細は、[Manage On-Demand Cluster](./manage-on-demand-clusters) を参照してください。

        - **Milvus からの移行時にインデックス作成をスキップ** — エンドポイント経由で Milvus から移行するときに、**Advanced Settings** で個々のコレクションに対して **Skip インデックス Creation** をオンにすることで、インデックスを作成せずにスキーマとデータを移行し、準備ができたときにインデックスを作成してコレクションをロードできます。詳細は、[Migrate from Milvus to Zilliz Cloud Via Endpoint](./via-endpoint) を参照してください。

    </div>

</Grid>

