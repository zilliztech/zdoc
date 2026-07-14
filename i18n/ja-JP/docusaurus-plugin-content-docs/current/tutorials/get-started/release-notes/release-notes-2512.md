---
title: "2025年12月 リリースノート | Cloud"
slug: /release-notes-2512
sidebar_label: "2025年12月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: LX0RwtoEEihhNukmt1DcSQGfnjb
sidebar_position: 1
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

        このリリースは Milvus v2.6.x の GA マイルストーンとなり、本番環境対応の安定性と完全な機能サポートを Zilliz Cloud にもたらします。これには、Geometry、Struct、TimestampTz データ型、ダウンタイムなしのフィールド追加、強化された全文検索、高速化された JSON フィルタリング、新しい reranking 関数、INT8 vector サポート、partial upserts、MINHASH_LSH index が含まれます。

        Tiered Storage も GA に到達し、アップグレードされた hot/warm/cold アーキテクチャを導入するとともに、cold data-access billing を開始します。詳細は [Storage Cost](./storage-cost) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-10**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - Milvus Endpoint migration が Geometry および Struct データ型をサポートするようになり、空間形状や深くネストされた属性を持つ collections のシームレスな移行が可能になりました。

        - billing console に Advance balance が表示されるようになり、前払い利用状況と残高をより明確に把握できるようになりました。

        - RESTful APIs が Auto Scaling configuration をサポートするようになり、cluster の弾性ポリシーをプログラムで管理できるようになりました。

        - Job Center でより詳細な進捗更新が提供されるようになり、ジョブのステータスと実行段階をより明確に把握できるようになりました。

        - registration flow が簡素化されたフォームで最適化され、オンボーディング効率と全体的なユーザー体験が向上しました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-01**

    </div>

    <div>

        ## Volume GA（旧称 Stage）\{#volume-ga-formerly-stage}

        **Stage が GA に到達**し、正式に **Volume** に名称変更されたことをお知らせします。Volume は、構造化テーブルまたは非構造化データファイルの collection を保持するマネージドオブジェクトストアであり、Zilliz Cloud におけるスケーラブルなデータ取り込みおよび ETL ワークフローのための統合データレイヤーとして機能します。

        この GA リリースでの新機能：

        - **Volume-level RBAC** 

            読み取り/書き込み権限に対する、きめ細かなロールベースのアクセス制御。

        - **Console support**

            Zilliz Cloud console から直接 Volumes を作成、管理、監視できます。

        - **GCP support** 

            Volume は **AWS and GCP** をサポートするようになり、マルチクラウドの柔軟性を実現します。

        GA に伴い、Volume は Free Trial Volume と Pay-as-you-go Volume の 2 つの課金モードをサポートするようになりました。Pay-as-you-go Volumes はストレージ使用量に基づいて課金が開始されます。

        詳細については、[Managed Volumes](./managed-volume) を参照してください。

        ## 組織レベルの IP アクセス許可リスト\{#organization-level-ip-access-allowlist}

        セキュリティを強化し、エンタープライズのコンプライアンス要件を満たすため、Zilliz Cloud は Enterprise および Business Critical プラン向けに組織レベルの IP アクセス許可リストをサポートするようになりました。

        - **Granular Access Control** 

            組織オーナーは console アクセス用に信頼できる IPv4 アドレスまたは CIDR 範囲を定義でき、承認されていないソースからのトラフィックはブロックされます。

        - **Comprehensive Auditing**

            許可リストのライフサイクルイベント（有効化、無効化、ルール変更）はすべて Platform Audit Logs に記録されます。

        詳細については、[Set Up Console IP Allowlist](./setup-console-ip-allowlist) を参照してください。

        ## MFA セキュリティアップグレード：\{#mfa-security-upgrade}

        Zilliz Cloud は **TOTP-based MFA**（例: Google/Microsoft Authenticator）をサポートするようになり、メールベースの認証よりも強力な保護を提供します。

        - **Organization-Level Enforcement**: Enterprise Plan 管理者は、コンプライアンス基準を確保するために、組織内のすべてのメンバーに対して MFA の必須ポリシーを適用できるようになりました。

        - **Legacy Migration**: メールのみの MFA は非推奨になります。既存ユーザーには authenticator app への移行が促されます。

        詳細については、[MFA](./multi-factor-auth) を参照してください。

    </div>

</Grid>

