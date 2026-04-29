---
title: "2026 年 2 月リリースノート | Cloud"
slug: /release-notes-2602
sidebar_key: release-notes-2602
sidebar_label: "2026 年 2 月"
beta: FALSE
notebook: FALSE
description: "2026 年 2 月の Zilliz Cloud リリースノートです。"
type: origin
token: KtAgwMSa6iEoFkkEqzAcEJgRnjc
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年2月リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-02-09**

    </div>

    <div>

        ## SSO強制\{#sso-enforcement}

        Organizationオーナーがすべてのメンバーに対してSSOを必須とできるようになりました。有効化されると、SSO以外の認証方法はすべて制限されます。このアップデートにより、ID管理を一元化し、企業のセキュリティポリシーへのコンプライアンスを確保できます。

        詳細については、[OrganizationでSSOを強制する](./enforce-sso-in-your-organization)をご参照ください。

        ## クラスターのアクセス制御\{#cluster-access-control}

        Zilliz Cloudでは、プロジェクト内でのきめ細かい権限管理を実現するクラスター単位のアクセス制御をサポートしました。管理者は個々のクラスターやボリュームに異なるロールを割り当てることができ、プロジェクトを分割することなく厳格なリソース分離を実施できます。

        - **クラスター単位のロール割り当て:** 同じプロジェクト内の個々のクラスターやボリュームに独立したロール（ReadOnly / ReadWrite）を付与でき、環境やワークロードごとに職務分掌を細かく分離できます。

        - **厳格なアクセス制御:** 認可されていないリソースへのAPIリクエストは拒否され、制限されたリソースはConsole上から非表示になります。すべてのアクセスはユーザーに付与された権限に厳密に限定されます。

        - **シームレスな移行:** 既存ユーザーは自動的に「すべてのリソース」へのアクセス権を持つように移行され、現在のプロジェクトロールが維持されます。手動での操作は不要です。

        詳細については、[Organizationユーザーの管理](./organization-users#organization-role)および[プロジェクトユーザーの管理](./project-users#project-access)をご参照ください。

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

