---
title: "2025年12月リリースノート | Cloud"
slug: /release-notes-2512
sidebar_label: "2025年12月リリースノート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ボリュームGA メール | Cloud"
type: origin
token: LX0RwtoEEihhNukmt1DcSQGfnjb
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison

---

import Admonition from '@theme/Admonition';

import Grid from '@site/src/components/Grid';

# 2025年12月リリースノート

ボリュームGA メール

<Grid columnSize="2" widthRatios="16,83">

    <div>

        **2025-12-01**

    </div>

    <div>

        ## ボリュームGA（旧ステージ）\{#volume-ga-formerly-stage}

        私たちは、**ステージがGAに達し**、正式に**ボリューム**に名称変更されたことをお知らせできることを嬉しく思います。ボリュームは、構造化されたテーブルまたは非構造化データファイルのコレクションのいずれかを保持する管理されたオブジェクトストアであり、Zilliz CloudのスケーラブルなデータオンボーディングおよびETLワークフローの統一されたデータレイヤーとして機能します。

        このGAリリースの新機能：

        - **ボリュームレベルのRBAC**

            読み書き権限のきめ細かなロールベースアクセス制御。

        - **コンソールサポート**

            Zilliz Cloudコンソールでボリュームを直接作成、管理、および監視できます。

        - **GCP対応**

            ボリュームは現在**AWSとGCP**をサポートしており、マルチクラウドの柔軟性を実現します。

        GAにより、ボリュームは2つの請求モードをサポートするようになりました：フリートライアルボリュームと従量課金ボリューム。従量課金ボリュームは、ストレージ使用量に基づいて請求が始まります。

        詳細については、[ボリュームの説明](./volume-explained)、[ボリュームの管理（SDK）](./manage-stages)、および[ボリュームの管理（コンソール）](./manage-volumes-via-console)を参照してください。

        ## 組織レベルIPアクセス許可リスト\{#organization-level-ip-access-allowlist}

        セキュリティを強化し、エンタープライズコンプライアンス要件を満たすために、Zilliz CloudはEnterpriseおよびBusiness Criticalプランに組織レベルIPアクセス許可リストをサポートするようになりました。

        - **きめ細かなアクセス制御**

            組織の所有者は、コンソールアクセス用に信頼されたIPv4アドレスまたはCIDR範囲を定義できます。承認されていないソースからのトラフィックはブロックされます。

        - **包括的な監査

            すべての許可リストライフサイクルイベント（有効化、無効化、ルール変更）はプラットフォーム監査ログに記録されます。

        詳細については、[コンソールIP許可リストの設定](./setup-console-ip-allowlist)を参照してください。

        ## MFAセキュリティアップグレード：\{#mfa-security-upgrade}

        Zilliz Cloudは現在、電子メールベースの検証よりも強力な保護を提供する**TOTPベースのMFA**（例：Google/Microsoft Authenticator）をサポートしています。

        - **組織レベルの強制**：エンタープライズプランの管理者は、コンプライアンス基準を確実にするために、すべての組織メンバーに対する必須MFAポリシーを強制できるようになりました。

        - **レガシー移行**：電子メールのみのMFAは廃止予定です。既存のユーザーには認証アプリへの移行が促されます。

        詳細については、[MFA](./multi-factor-auth)を参照してください。

    </div>

</Grid>