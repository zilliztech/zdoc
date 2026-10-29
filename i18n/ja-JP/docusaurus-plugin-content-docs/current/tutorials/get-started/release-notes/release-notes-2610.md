---
title: "2026年10月 リリースノート | Cloud"
slug: /release-notes-2610
sidebar_label: "2026年10月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "（プレースホルダー） | Cloud"
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

        **2026-10-29**

    </div>

    <div>

        ## Milvus v3.0.x パブリックプレビュー\{#milvus-v30x-public-preview}

        Milvus v3.0.x は現在、Zilliz Cloud の Dedicated クラスター向けにパブリックプレビューで提供されています。このリリースでは、より柔軟なスキーマ変更、より強力なテキスト処理、およびクエリと検索のためのサーバー側の並べ替えと集計が利用可能になります。試すには、Milvus v2.6.x を実行する Dedicated クラスターをデプロイまたは使用し、クラスター Overview ページで **Try Preview Features** を選択します。

        **検索と取得**

        - **クエリと検索での ORDER BY:** `order_by` を使用してクエリ結果を 1 つ以上のスカラーフィールドで並べ替え、`order_by_fields` を使用して検索ヒットまたはグループを価格や評価などのフィールドで並べ替えます。詳細は、[Query](./get-and-scalar-query) および [Basic ベクトル Search](./single-vector-search) を参照してください。

        - **クエリ集計:** `group_by_fields` でクエリ結果をグループ化し、各グループの `count`、`min`、`max`、`sum`、`avg` をサーバー上で計算します。詳細は、[Query](./get-and-scalar-query) を参照してください。

        - **検索集計:** ANN 検索候補をスカラーフィールド別のバケットに整理し、各バケットのメトリクスを計算してバケットを並べ替え、代表的なヒットを返します。1 回のリクエストで最大 4 レベルの集計が可能です。単一の検索で、ファセット結果ページの背後にあるデータを返せるようになりました。詳細は、[Search Aggregation](./search-aggregation) を参照してください。

        - **正規表現フィルタリング:** RE2 構文を使用する `=~` および `!~` 演算子で、`VARCHAR` フィールド、JSON 文字列パス、およびインデックス経由でアクセスする配列要素（例: `tags[0]`）を、クエリ、検索、ハイブリッド検索でフィルタリングします。詳細は、[Pattern Matching](./pattern-match) を参照してください。

        - **Membership Match フィルタリング:** スカラーフィールドの値が指定したセットに含まれるかどうかでエンティティをフィルタリングします。セットは、大きな `IN [...]` リストの代わりに、式テンプレートを通じて 1 つのコンパクトなバイナリ BLOB として送信します。符号付き整数フィールドの完全一致には `type=roaring` を使用します。この指定は `delete` 式でも許可されています。整数、`VARCHAR`、JSON パスフィールドの近似一致で、まれな誤検出が許容される場合は `type=bloom` を使用します。BLOB は gRPC SDK で 1 回構築し、複数のリクエストで再利用します。RESTful API はバイナリ BLOB を伝送できません。詳細は、[Membership Match](/docs/membership-match) を参照してください。

        - **MinHash Function:** 生のテキストを送信すると、Zilliz Cloud がサーバー上で MinHash 署名を生成します。その後、`MINHASH_LSH` インデックスで検索し、外部モデルなしで近似重複検出や大規模な重複排除を行えます。詳細は、[MinHash Function](./minhash-function) を参照してください。

        **テキストと NLP**

        - **`TEXT` データ型:** `VARCHAR` の 65,535 バイト制限を超えるパッセージ、長いドキュメント、チケット、ログを、`max_length` を設定せずに格納します。`output_fields` を通じてテキストを返すか、全文検索用の BM25 Function の入力として使用します。詳細は、[Text Field](./use-text-field) を参照してください。

        **柔軟なスキーマとデータ型**

        - **既存のコレクションに Function とそのフィールドを追加:** 既存の `VARCHAR` フィールドを読み取る BM25 または MinHash Function を、生成されるベクトルフィールドおよびインデックスとともに 1 回のスキーマ変更で既存のコレクションにアタッチします。これにより、コレクションを再作成せずに全文検索または重複排除を有効にできます。詳細は、[Alter コレクション スキーマ](./add-fields-to-an-existing-collection) を参照してください。

        - **フィールドと Function の削除:** 不要になったスカラーフィールド、ベクトルフィールド、StructArray フィールド全体を削除するか、Function を生成されたフィールドとともに削除します。コレクションには少なくとも 1 つのベクトルフィールドが必要です。詳細は、[Alter コレクション スキーマ](./add-fields-to-an-existing-collection) を参照してください。

        **ネストされたデータ構造**

        - **StructArray の要素レベルの検索:** 通常のクエリベクトルで StructArray のベクトルサブフィールドを検索し、一致する要素のオフセットを含む要素レベルのヒットを取得します。要素レベルの検索は、範囲検索、グループ検索、ハイブリッド検索にも対応しています。サブフィールドは、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`、`BINARY_VECTOR` も受け付けるようになりました。詳細は、[StructArray Overview](./use-array-of-structs) を参照してください。

        - **StructArray のマッチフィルター:** `element_filter` を使用して同じ Struct 要素に複数の条件を適用し、`MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、`MATCH_EXACT` 演算子を使用して、一致する要素の数でエンティティをフィルタリングします。詳細は、[StructArray Operators](./struct-array-filtering) を参照してください。

        **データ操作**

        - **エンティティレベルの TTL:** `ttl_field` コレクションプロパティを `TIMESTAMPTZ` フィールドに設定して、個々のエンティティを期限切れにします。TTL 値が `NULL` のエンティティは期限切れにならず、より後のタイムスタンプを upsert することでエンティティの有効期間を延長できます。詳細は、[Set Collection TTL](./set-collection-ttl) を参照してください。

        <Admonition type="info" title="Notes">

        **Dedicated クラスターはコンソールからアップグレードします。** Milvus v2.6.x を実行する Dedicated クラスターをデプロイし、クラスター Overview ページで **Try Preview Features** を選択して、Milvus v3.0.x にアップグレードします。
        
        **Milvus v2.5.x クラスターは先に v2.6.x にアップグレードします。** v2.5.x から v3.0.x への直接のアップグレードパスはありません。
        
        **ダウンタイムはなく、インデックスの再構築も不要です。** アップグレード中もクラスターはリクエストの処理を続けますが、ノードの再起動中に一時的なジッターが発生する場合があります。既存のインデックスとアナライザー設定は変更されずに引き継がれ、アップグレード後も Milvus v2.6.x の機能を引き続き利用できます。
        
        **グローバルクラスターは対象外です。** グローバルクラスターは Milvus v2.6.x のままです。

        </Admonition>

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-10-19**

    </div>

    <div>

        ## Zero Downtime Migration | ON REQUEST\{#zero-downtime-migration}

        ソースクラスターを利用可能な状態に保ちながら、データベース内のすべてのコレクションまたは選択したコレクションを、同じ組織内の既存の Dedicated クラスターに移行します。

        - **柔軟な移行元:** 移行元には、同じプロジェクトまたは同じ組織内の別のプロジェクトにある Dedicated、Serverless、または Free クラスターを指定できます。

        - **既存データと増分データ:** Zilliz Cloud はまず既存データをコピーし、その後、最大 7 日間、insert、upsert、delete の同期を継続します。

        - **制御されたカットオーバー:** 同期ラグが 10 秒未満になったら、移行元への書き込みを停止し、同期を停止して、アプリケーションをターゲットクラスターに切り替えます。

        - **バージョン要件:** 両方のクラスターで最新の Milvus v2.6.x バージョンを実行している必要があります。

        この機能はリクエストに応じて利用できます。有効にするには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。詳細は、[Zero Downtime Migration](./zero-downtime-migration) を参照してください。

        ## Data Backfill | ON REQUEST\{#data-backfill}

        Zilliz Cloud ボリューム内の Parquet ファイルから、既存エンティティの選択したフィールドを大規模に更新します。たとえば、新しく追加したフィールドへのデータ投入や欠損値の補完に使用できます。

        - **プライマリキーによる照合:** バックフィルジョブは、プライマリキーによって入力レコードをエンティティと照合し、新しいエンティティを挿入することはありません。

        - **3 つのバックフィルモード:** NULL 値のみを埋める `coalesce`（デフォルト）、一致したエンティティの値を置き換える `overwrite`、または一致しないエンティティのフィールドも NULL に設定する `replace` から選択します。

        - **事前チェック:** コレクションを変更せずに、最初に事前チェックを実行して入力を検証できます。

        - **Spark バッチジョブ:** Data Backfill は RESTful API を通じて Spark バッチジョブとして実行され、該当するすべての AWS リージョンで利用できます。

        この機能はリクエストに応じて利用できます。有効にするには、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。詳細は、[Data Backfill](./data-backfill) を参照してください。

        ## Google Cloud クラスターでの CMEK のサポート\{#cmek-is-supported-with-google-cloud-clusters}

        - Google Cloud の `Business Critical` プロジェクトでは、Google Cloud KMS キーを**カスタマーマネージド暗号化キー（CMEK）**として追加し、同じリージョンで Dedicated クラスターを作成するとき、または暗号化されたバックアップから復元するときに選択できるようになりました。

        詳細は、[Google Cloud KMS](./gcp-kms) を参照してください。

        ## BYOC の利用可能なリージョンの拡大\{#more-regions-for-byoc}

        - BYOC プロジェクトを、さらに 2 つのリージョンにデプロイできるようになりました。Google Cloud europe-west9（フランス、パリ）および AWS ap-southeast-7（タイ）です。

        詳細は、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

        ## 機能強化\{#enhancements}

        - **Organization Owner を SSO の強制対象から除外するかどうかの選択** — SSO を強制するとき、**Enable SSO Enforcement** ダイアログで、Organization Owner が SSO なしでログインできるようにするかどうかを選択できるようになりました。オーナーの免除はデフォルトで有効になっているため、すでに SSO を強制している組織に変更はありません。すべてのメンバー（Organization Owner を含む）に SSO を必須とするには、**Allow Organization Owners to log in without SSO** をオフにします。詳細は、[Enforce SSO in Your Organization](./enforce-sso-in-your-organization) を参照してください。

        - **SAML 2.0 を使用した SSO 向け Ping Identity（PingOne プラットフォーム）** — **Configure Single Sign-On (SSO)** ダイアログで、専用の **Ping Identity (SAML 2.0)** オプションを選択できるようになり、PingOne との SSO を設定するためのステップバイステップガイドが提供されます。詳細は、[PingOne (SAML 2.0)](./single-sign-on-with-ping-one) を参照してください。

        - **オンデマンドクラスターのキープウォームスケジュール** — オンデマンドクラスターが稼働し続ける週次タイムウィンドウを設定します。ウィンドウが開始すると、クラスターがサスペンドされている場合は Zilliz Cloud がクラスターを再開し、ウィンドウが終了するまで自動サスペンドを一時停止します。ウィンドウの終了後は、通常の自動サスペンド設定が再び適用されます。スケジュールには、組織のシステムタイムゾーンで最大 10 個のルールを設定でき、コンソールまたはオンデマンドクラスター API の `keepWarm` オブジェクトを通じて管理できます。詳細は、[Manage On-Demand Cluster](./manage-on-demand-clusters) を参照してください。

        - **Milvus からの移行時にインデックス作成をスキップ** — エンドポイント経由で Milvus から移行するときに、**Advanced Settings** で個々のコレクションに対して **Skip インデックス Creation** をオンにすることで、インデックスを作成せずにスキーマとデータを移行し、準備ができたときにインデックスを作成してコレクションをロードできます。詳細は、[Migrate from Milvus to Zilliz Cloud Via Endpoint](./via-endpoint) を参照してください。

    </div>

</Grid>
