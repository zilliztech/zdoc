---
title: "2026年2月 リリースノート | Cloud"
slug: /release-notes-2602
sidebar_label: "2026年2月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
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

        ## SSO の強制\{#sso-enforcement}

        Organization のオーナーがすべてのメンバーに SSO を必須化できる機能を追加しました。強制を有効にすると、SSO 以外の認証方法はすべて制限されます。この更新により、ID 管理を一元化し、企業のセキュリティポリシーへの準拠を確保できます。

        詳細については、[組織で SSO を強制する](./enforce-sso-in-your-organization) を参照してください。

        ## クラスターのアクセス制御\{#cluster-access-control}

        Zilliz Cloud がクラスターレベルのアクセス制御に対応し、プロジェクト内でよりきめ細かな権限管理が可能になりました。管理者は個々のクラスターやボリュームに異なるロールを割り当てられ、プロジェクトを分割することなく厳密なリソース分離を実現できます。

        - **クラスターごとのロール割り当て:** 同じプロジェクト内の個々のクラスターやボリュームに独立したロール（ReadOnly / ReadWrite）を付与でき、環境やワークロードに応じて職務をきめ細かく分離できます。

        - **厳格なアクセス制御:** 権限のないリソースへの API リクエストは拒否され、制限されたリソースはコンソールに表示されません。すべてのアクセスは、ユーザーに付与された権限の範囲に厳密に限定されます。

        - **シームレスな移行:** 既存のユーザーは「すべてのリソース」へのアクセス権を持った状態で自動的に移行され、現在のプロジェクトロールも維持されます。手動での対応は不要です。

        詳細については、[プラットフォームユーザーの管理](./manage-platform-users) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-02-04**

    </div>

    <div>

        ## 新リージョン: 🇮🇪 AWS アイルランド\{#new-region-aws-ireland}

    </div>

</Grid>

