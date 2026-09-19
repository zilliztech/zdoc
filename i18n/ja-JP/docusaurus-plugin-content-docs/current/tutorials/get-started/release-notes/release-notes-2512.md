---
title: "2025年12月 リリースノート | Cloud"
slug: /release-notes-2512
sidebar_label: "2025年12月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: LX0RwtoEEihhNukmt1DcSQGfnjb
sidebar_position: 9
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2025年12月 リリースノート

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-26**

    </div>

    <div>

        ## Milvus v2.6 GA\{#milvus-v26-ga}

        今回のリリースは Milvus v2.6.x の GA マイルストーンであり、Geometry、Struct、TimestampTz データ型、ダウンタイムなしのフィールド追加、強化された全文検索、高速化された JSON フィルタリング、新しい reranking 関数、INT8 ベクトルへの対応、partial upserts、MINHASH_LSH インデックスなどを含め、本番運用に対応した安定性と完全な機能サポートを Zilliz Cloud にもたらします。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-10**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - Milvus Endpoint migration が Geometry および Struct データ型に対応し、空間形状や深くネストされた属性を持つコレクションをシームレスに移行できるようになりました。

        - 請求コンソールに Advance balance が表示されるようになり、前払いの利用額と残高をより明確に把握できるようになりました。

        - RESTful API が Auto Scaling 設定に対応し、クラスターの伸縮ポリシーをプログラムで管理できるようになりました。

        - Job Center がより詳細な進捗状況の更新を提供するようになり、ジョブのステータスと実行段階をより明確に把握できるようになりました。

        - 登録フローが簡素化されたフォームで最適化され、オンボーディングの効率と全体的なユーザー体験が向上しました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-01**

    </div>

    <div>

        ## ボリューム GA（旧 Stage）\{#volume-ga-formerly-stage}

        **Stage が GA に到達**し、正式に **ボリューム** へ名称変更されたことをお知らせします。ボリュームは、構造化テーブルまたは非構造化データファイルのコレクションを格納するマネージドオブジェクトストアであり、Zilliz Cloud におけるスケーラブルなデータオンボーディングと ETL ワークフローのための統合データレイヤーとして機能します。

        この GA リリースの新機能：

        - **ボリュームレベルの RBAC** 

            read/write 権限に対する、きめ細かなロールベースのアクセス制御。

        - **コンソールサポート**

            Zilliz Cloud コンソールから直接ボリュームを作成、管理、監視できます。

        - **GCP サポート** 

            ボリュームが **AWS と GCP** をサポートするようになり、マルチクラウドの柔軟性を実現します。

        GA により、ボリュームは Free Trial Volume と Pay-as-you-go Volume の 2 つの課金モードをサポートするようになりました。Pay-as-you-go Volume では、ストレージ使用量に基づく課金が開始されます。

        詳細については、[マネージドボリューム](./managed-volume) を参照してください。

        ## 組織レベルの IP Access Allowlist\{#organization-level-ip-access-allowlist}

        セキュリティの強化とエンタープライズのコンプライアンス要件への対応のため、Zilliz Cloud は Enterprise および Business Critical プラン向けに組織レベルの IP Access Allowlist をサポートするようになりました。

        - **きめ細かなアクセス制御** 

            Organization owner は、コンソールアクセス用に信頼できる IPv4 アドレスまたは CIDR 範囲を定義できます。承認されていないソースからのトラフィックはブロックされます。

        - **包括的な監査**

            allowlist のライフサイクルイベント（有効化、無効化、ルール変更）はすべて Platform Audit Logs に記録されます。

        詳細については、[Console IP Allowlist を設定する](./setup-console-ip-allowlist) を参照してください。

        ## MFA セキュリティアップグレード：\{#mfa-security-upgrade}

        Zilliz Cloud は **TOTP ベースの MFA**（例：Google/Microsoft Authenticator）をサポートするようになり、メールベースの検証よりも強力な保護を提供します。

        - **組織レベルでの強制適用**: Enterprise Plan の管理者は、コンプライアンス基準を確実に満たすために、組織のすべてのメンバーに MFA ポリシーを必須として適用できるようになりました。

        - **レガシーからの移行**: メールのみの MFA は廃止される予定です。既存のユーザーには、認証アプリへの移行が促されます。

        詳細については、[MFA](./multi-factor-auth) を参照してください。

    </div>

</Grid>
