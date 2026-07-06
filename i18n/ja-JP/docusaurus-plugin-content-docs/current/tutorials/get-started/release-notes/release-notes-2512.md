---
title: "2025年12月リリースノート | Cloud"
slug: /release-notes-2512
sidebar_key: release-notes-2512
sidebar_label: "2025年12月"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の2025年12月のリリースノートです。"
type: origin
token: LX0RwtoEEihhNukmt1DcSQGfnjb
sidebar_position: 7
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2025年12月リリースノート

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-26**

    </div>

    <div>

        ## Milvus v2.6 GA\{#milvus-v26-ga}

        このリリースは、Milvus v2.6.xのGAマイルストーンを記念するもので、Zilliz Cloud上で本番環境に対応した安定性と完全な機能サポートを提供します。これには、ジオメトリ、構造体、TimestampTzデータ型、ダウンタイムなしでのフィールド追加、強化された全文検索、高速化されたJSONフィルタリング、新しいリランキング関数、INT8ベクトルサポート、部分アップサート、およびMINHASH_LSHインデックスが含まれます。

        階層型ストレージもGAに到達し、強化されたホット/ウォーム/コールドアーキテクチャを導入し、コールドデータアクセスの課金を開始しました。詳細については、[ストレージコスト](./storage-cost#cold-data-access) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-10**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - Milvusエンドポイントの移行がジオメトリおよび構造体データ型をサポートするようになり、空間形状や深くネストされた属性を持つコレクションのシームレスな移行が可能になりました。

        - 課金コンソールに前払い残高が表示されるようになり、前払い使用量と残高の可視性が向上しました。

        - RESTful APIがAuto Scaling設定をサポートするようになり、クラスタの弾力性ポリシーをプログラムで管理できるようになりました。

        - ジョブセンターがより詳細な進捗更新を提供するようになり、ユーザーはジョブのステータスと実行ステージをより明確に把握できるようになりました。

        - 登録フローが簡素化されたフォームで最適化され、オンボーディングの効率性と全体的なユーザーエクスペリエンスが向上しました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-01**

    </div>

    <div>

        ## ボリューム GA（旧ステージ）\{#volume-ga-formerly-stage}

        **ステージがGAに到達しました** ことを発表し、正式に **ボリューム** に名称変更されました。ボリュームは、構造化テーブルまたは非構造化データファイルのコレクションのいずれかを保持するマネージドオブジェクトストアであり、Zilliz CloudでのスケーラブルなデータオンボーディングおよびETLワークフローの統合データレイヤーとして機能します。

        このGAリリースの新機能：

        - **ボリュームレベルRBAC** 

            読み取り/書き込み権限のきめ細かいロールベースのアクセス制御。

        - **コンソールサポート**

            Zilliz Cloudコンソールで直接ボリュームの作成、管理、監視が可能。

        - **GCPサポート** 

            ボリュームが**AWSおよびGCP**をサポートするようになり、マルチクラウドの柔軟性が実現。

        GAに伴い、ボリュームは2つの課金モードをサポートします：無料トライアルボリュームと従量課金制ボリューム。従量課金制ボリュームは、ストレージ使用量に基づいて課金が開始されます。

        詳細については、ボリューム Explained、Manage ボリュームs (SDK)、およびManage ボリュームs (Console)を参照してください。

        ## 組織レベルIPアクセス許可リスト\{#organization-level-ip-access-allowlist}

        セキュリティを強化し、エンタープライズのコンプライアンス要件を満たすため、Zilliz CloudはEnterpriseおよびビジネスクリティカルプラン向けに組織レベルIPアクセス許可リストをサポートするようになりました。

        - **きめ細かなアクセス制御** 

            組織のオーナーがコンソールアクセス用の信頼できるIPv4アドレスまたはCIDR範囲を定義でき、承認されていないソースからのトラフィックはブロックされます。

        - **包括的な監査**

            許可リストのライフサイクルイベント（有効化、無効化、ルール変更）はすべて、プラットフォーム監査ログに記録されます。

        詳細については、[コンソールIP許可リストの設定](./setup-console-ip-allowlist) を参照してください。

        ## MFAセキュリティアップグレード\{#mfa-security-upgrade}

        Zilliz Cloudは、**TOTPベースのMFA**（例：Google/Microsoft Authenticator）をサポートするようになり、Eメールベースの認証よりも強力な保護を提供します。

        - **組織レベルでの適用**: Enterpriseプランの管理者は、すべての組織メンバーに対してMFAポリシーの強制適用を行えるようになり、コンプライアンス基準の確保が可能になりました。

        - **レガシー移行**: EメールのみのMFAは廃止予定です。既存ユーザーは認証アプリへの移行を求められます。

        詳細については、[MFA](./multi-factor-auth) を参照してください。

    </div>

</Grid>

