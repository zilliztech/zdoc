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
sidebar_position: 8
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

        今回のリリースは Milvus v2.6.x の GA マイルストーンとなり、Geometry、Struct、TimestampTz データ型、ダウンタイムなしのフィールド追加、強化された全文検索、高速化された JSON フィルタリング、新しい reranking 関数、INT8 vector のサポート、partial upsert、MINHASH_LSH index などを含む、本番運用対応の安定性と完全な機能サポートを Zilliz Cloud 上にもたらします。

        Tiered Storage も GA に到達し、アップグレードされた hot/warm/cold アーキテクチャを導入するとともに、cold データアクセス課金を開始します。詳細は [Storage Cost](./storage-cost) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-10**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - Milvus Endpoint migration が Geometry および Struct データ型をサポートするようになり、空間形状や深くネストされた属性を持つ collection のシームレスな移行が可能になりました。

        - 請求コンソールに Advance balance が表示されるようになり、前払い利用額と残高をより明確に把握できるようになりました。

        - RESTful API が Auto Scaling 設定をサポートするようになり、cluster の弾性ポリシーをプログラムで管理できるようになりました。

        - Job Center がより詳細な進捗更新を提供するようになり、ユーザーはジョブのステータスと実行段階をより明確に把握できるようになりました。

        - 登録フローが簡略化されたフォームで最適化され、オンボーディング効率と全体的なユーザー体験が向上しました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-01**

    </div>

    <div>

        ## Volume GA（旧 Stage）\{#volume-ga-formerly-stage}

        **Stage が GA に到達**し、正式に **Volume** へ名称変更されたことをお知らせします。Volume は、構造化テーブルまたは非構造化データファイルの collection を保持するマネージドオブジェクトストアであり、Zilliz Cloud におけるスケーラブルなデータ取り込みおよび ETL ワークフローのための統合データレイヤーとして機能します。

        この GA リリースの新機能：

        - **Volume レベル RBAC** 

            読み取り/書き込み権限に対する、きめ細かなロールベースのアクセス制御。

        - **コンソールサポート**

            Zilliz Cloud コンソールから直接 Volume の作成、管理、監視が可能です。

        - **GCP サポート** 

            Volume が **AWS と GCP** をサポートするようになり、マルチクラウドの柔軟性を実現します。

        GA により、Volume は Free Trial Volume と Pay-as-you-go Volume の 2 つの課金モードをサポートするようになりました。Pay-as-you-go Volume では、ストレージ使用量に基づく課金が開始されます。

        詳細については、[Managed Volumes](./managed-volume) を参照してください。

        ## 組織レベル IP Access Allowlist\{#organization-level-ip-access-allowlist}

        セキュリティ強化とエンタープライズコンプライアンス要件への対応のため、Zilliz Cloud は Enterprise および Business Critical プラン向けに組織レベルの IP Access Allowlist をサポートするようになりました。

        - **きめ細かなアクセス制御** 

            Organization owner は、コンソールアクセス用に信頼できる IPv4 アドレスまたは CIDR 範囲を定義でき、承認されていない送信元からのトラフィックはブロックされます。

        - **包括的な監査**

            allowlist のライフサイクルイベント（有効化、無効化、ルール変更）はすべて Platform Audit Logs に記録されます。

        詳細については、[Set Up Console IP Allowlist](./setup-console-ip-allowlist) を参照してください。

        ## MFA セキュリティアップグレード：\{#mfa-security-upgrade}

        Zilliz Cloud は現在、**TOTP ベースの MFA**（例：Google/Microsoft Authenticator）をサポートしており、メールベースの認証よりも強力な保護を提供します。

        - **組織レベルの強制適用**: Enterprise Plan 管理者は、コンプライアンス基準を確保するために、すべての組織メンバーに対して必須の MFA ポリシーを適用できるようになりました。

        - **レガシー移行**: メールのみの MFA は廃止予定です。既存ユーザーには authenticator app への移行が促されます。

        詳細については、[MFA](./multi-factor-auth) を参照してください。

    </div>

</Grid>

