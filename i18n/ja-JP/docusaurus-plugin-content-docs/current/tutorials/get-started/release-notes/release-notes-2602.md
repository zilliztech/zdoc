---
title: "2026年2月リリースノート | Cloud"
slug: /release-notes-2602
sidebar_key: release-notes-2602
sidebar_label: "2026年2月"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の2026年2月のリリースノートです。"
type: origin
token: KtAgwMSa6iEoFkkEqzAcEJgRnjc
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

#  2026年2月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-02-09**

    </div>

    <div>

        ## SSOの強制適用\{#sso-enforcement}

        組織のオーナーがすべてのメンバーに対してSSOを義務付ける機能を追加しました。強制適用後、SSO以外の認証方法はすべて制限されます。このアップデートにより、一元化されたID管理が可能になり、企業のセキュリティポリシーへの準拠が確保されます。

        詳細については、[組織でのSSOの強制適用](./enforce-sso-in-your-organization) を参照してください。

        ## クラスターアクセス制御\{#cluster-access-control}

        Zilliz Cloud は、プロジェクト内でのきめ細かい権限管理を可能にするクラスターレベルのアクセス制御をサポートするようになりました。管理者は、個別のクラスターとボリュームに異なるロールを割り当てることができ、プロジェクトを分割することなく厳格なリソースの分離を実現できます。

        - **クラスターごとのロール割り当て:** 同一プロジェクト内の個別のクラスターとボリュームに独立したロール（ReadOnly / ReadWrite）を付与し、環境やワークロード間でのきめ細かな職務分離を可能にします。

        - **厳格なアクセス強制:** 権限のないリソースへのAPIリクエストは拒否され、制限されたリソースはコンソールから非表示になります。すべてのアクセスは、ユーザーに付与された権限に厳密にスコープされます。

        - **シームレスな移行:** 既存のユーザーは「すべてのリソース」へのアクセス権を持つ状態で自動的に移行され、現在のプロジェクトロールが維持されます。手動での操作は不要です。

        詳細については、[組織ユーザーの管理](./organization-users#organization-role) および [プロジェクトユーザーの管理](./project-users#project-access) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-02-04**

    </div>

    <div>

        ## 新しいリージョン: 🇮🇪 AWS Ireland\{#new-region-aws-ireland}

    </div>

</Grid>

