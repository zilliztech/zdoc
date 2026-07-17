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

        このリリースは Milvus v2.6.x の GA マイルストーンとなり、本番環境対応の安定性と完全な機能サポートを Zilliz Cloud 上にもたらします。これには、Geometry、Struct、TimestampTz データ型、ダウンタイムなしの field 追加、強化されたフルテキスト検索、高速化された JSON フィルタリング、新しい reranking 関数、INT8 vector サポート、partial upserts、MINHASH_LSH index が含まれます。

        Tiered Storage も GA に到達し、アップグレードされた hot/warm/cold アーキテクチャが導入されるとともに、cold data-access billing が開始されます。詳細は [Storage Cost](./storage-cost) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-10**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - Milvus Endpoint migration が Geometry および Struct データ型をサポートするようになり、空間形状や深くネストされた属性を持つ collection のシームレスな migration が可能になりました。

        - billing console に Advance balance が表示されるようになり、前払い使用量と残高をより明確に把握できるようになりました。

        - RESTful API が Auto Scaling configuration をサポートするようになり、cluster elasticity policies をプログラムから管理できるようになりました。

        - Job Center がより詳細な進捗更新を提供するようになり、ジョブの状態や実行ステージをより明確に把握できるようになりました。

        - registration フローが簡素化されたフォームによって最適化され、オンボーディング効率と全体的なユーザー体験が向上しました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-01**

    </div>

    <div>

        ## Volume GA（旧 Stage）\{#volume-ga-formerly-stage}

        **Stage が GA に到達**し、正式に **Volume** に名称変更されたことをお知らせします。Volume は、構造化テーブルまたは非構造化データファイルの collection を保持するマネージド object store であり、Zilliz Cloud におけるスケーラブルなデータ取り込みと ETL ワークフローのための統合データレイヤーとして機能します。

        この GA リリースにおける新機能：

        - **Volume-level RBAC** 

            読み取り/書き込み権限のための、きめ細かなロールベースのアクセス制御。

        - **Console support**

            Zilliz Cloud console から直接 Volume を作成、管理、監視できます。

        - **GCP support** 

            Volume は **AWS と GCP** をサポートするようになり、マルチクラウドの柔軟性を実現します。

        GA に伴い、Volume は Free Trial Volume と Pay-as-you-go Volume の 2 つの課金モードをサポートするようになりました。Pay-as-you-go Volume は、ストレージ使用量に基づく課金が開始されます。

        詳細は [Managed Volumes](./managed-volume) を参照してください。

        ## Organization-Level IP Access Allowlist\{#organization-level-ip-access-allowlist}

        セキュリティを強化し、エンタープライズのコンプライアンス要件を満たすために、Zilliz Cloud は Enterprise および Business Critical プラン向けに Organization-Level IP Access Allowlist をサポートするようになりました。

        - **Granular Access Control** 

            Organization owner は、console access のための信頼できる IPv4 アドレスまたは CIDR 範囲を定義でき、未承認のソースからのトラフィックはブロックされます。

        - **Comprehensive Auditing**

            allowlist のライフサイクルイベント（有効化、無効化、ルール変更）はすべて Platform Audit Logs に記録されます。

        詳細は [Set Up Console IP Allowlist](./setup-console-ip-allowlist) を参照してください。

        ## MFA セキュリティアップグレード：\{#mfa-security-upgrade}

        Zilliz Cloud は現在、**TOTP ベースの MFA**（例：Google/Microsoft Authenticator）をサポートしており、メールベースの認証よりも強力な保護を提供します。

        - **Organization-Level Enforcement**: Enterprise Plan 管理者は、コンプライアンス基準を満たすために、organization のすべてのメンバーに対して MFA の必須ポリシーを適用できるようになりました。

        - **Legacy Migration**: メールのみの MFA は非推奨になります。既存ユーザーには authenticator app への移行が求められます。

        詳細は [MFA](./multi-factor-auth) を参照してください。

    </div>

</Grid>

