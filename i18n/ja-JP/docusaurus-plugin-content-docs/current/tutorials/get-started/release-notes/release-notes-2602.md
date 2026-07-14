---
title: " 2026年2月 リリースノート | Cloud"
slug: /release-notes-2602
sidebar_label: "2026年2月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: KtAgwMSa6iEoFkkEqzAcEJgRnjc
sidebar_position: 6
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

#  2026年2月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-02-09**

    </div>

    <div>

        ## SSO の強制適用\{#sso-enforcement}

        Organization オーナーがすべてのメンバーに対して SSO を必須化できる機能を追加しました。これを強制適用すると、SSO 以外のすべての認証方法が制限されます。この更新により、ID 管理の一元化が可能になり、企業のセキュリティポリシーへの準拠を確保できます。 

        詳細については、[Organization で SSO を強制適用する](./enforce-sso-in-your-organization) を参照してください。

        ## Cluster アクセス制御\{#cluster-access-control}

        Zilliz Cloud は cluster レベルのアクセス制御をサポートするようになり、project 内でよりきめ細かな権限管理が可能になりました。管理者は個々の cluster や volume に異なるロールを割り当てることができ、project を分割することなく厳格なリソース分離を実現できます。

        - **Cluster ごとのロール割り当て:** 同じ project 内の個々の cluster と volume に対して独立したロール（ReadOnly / ReadWrite）を付与できるため、環境やワークロードごとに職務をきめ細かく分離できます。

        - **厳格なアクセス強制:** 権限のないリソースへの API リクエストは拒否され、制限されたリソースは Console に表示されません。すべてのアクセスは、ユーザーに付与された権限の範囲内に厳密に制限されます。

        - **シームレスな移行:** 既存ユーザーは現在の project ロールを維持したまま、自動的に「All Resources」アクセスへ移行されます。手動での対応は不要です。

        詳細については、[Organization ユーザーを管理する](./organization-users#organization-role) および [Project ユーザーを管理する](./project-users#project-access) を参照してください。

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

