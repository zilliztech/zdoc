---
title: "プラットフォームユーザーの管理 | BYOC"
slug: /manage-platform-users
sidebar_label: "プラットフォームユーザーの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud における 2 種類のプラットフォームユーザーである組織メンバーとプロジェクトユーザーを紹介し、その管理方法について説明します。 | BYOC"
type: origin
token: XvTLwH1TEiEHdJksnyIcMCixnic
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プラットフォームユーザーの管理

このガイドでは、Zilliz Cloud における 2 種類のプラットフォームユーザーである組織メンバーとプロジェクトユーザーを紹介し、その管理方法について説明します。

## 組織メンバー\{#organization-members}

組織メンバーは、Zilliz Cloud 組織に所属するユーザーです。コンソールにサインインでき、担当業務に応じて組織ロール、プロジェクトアクセス、その他の権限が割り当てられる場合があります。

<Admonition type="info" title="Note">

組織メンバーを管理するには、Organization Owner や同等のカスタム組織ロールなど、メンバーとロールの管理権限を含む組織ロールが必要です。

</Admonition>

### 組織メンバーを招待する\{#invite-organization-members}

<Admonition type="info" title="Notes">

各組織には最大 100 人のメンバーを追加できます。

</Admonition>

次の図は、組織メンバーを招待する方法を示しています。

![PD1vwZlSihQVSZbGiVpcGr9Vnic](https://zdoc-images.s3.us-west-2.amazonaws.com/PD1vwZlSihQVSZbGiVpcGr9Vnic.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象の組織に移動します。

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. **Invite Member** をクリックします。

1. 以下の情報を入力します。

    - メールアドレス: 1 つ以上のメールアドレスを入力できます。

    - 組織ロール: 適切な組織ロールを選択します。定義済みの組織ロールについては、次の表で説明します。

        | ロール | 使用する場合 | 備考 |
        | --- | --- | --- |
        | Public | 追加のアクセス権が付与される前に、基本的なサインインアクセスのみが必要な場合です。 | すべての組織メンバーに自動的に付与されます。単独では削除できません。 |
        | Organization Owner | 組織の設定、メンバー、ロール、プロジェクト、セキュリティ、請求を管理する場合です。 | 信頼できる管理者にのみ付与してください。 |
        | Billing Admin | 請求とサブスクリプションを管理する場合です。 | 広範な技術的アクセスを必要としない財務・調達担当のユーザー向けです。 |

    - （任意）プロジェクトアクセス: プロジェクトと 1 つ以上のプロジェクトロールを選択して、プロジェクトアクセスを設定します。

1. **Invite** をクリックします。

</Procedures>

招待されたユーザーには招待メールが届きます。組織に参加するには、48 時間以内にその招待を承諾する必要があります。または、Web コンソールから招待リンクをコピーして、招待されたユーザーに共有することもできます。

### 招待を取り消すか再送信する\{#revoke-or-resend-an-invitation}

ユーザーを組織に招待すると、Zilliz Cloud からそのユーザーに招待メールが送信されます。ユーザーが招待を承諾する前であれば、招待を取り消したり再送信したりできます。

次の図は、招待を取り消すか再送信する方法を示しています。

![APzwwVIWWhelahb5pOHcST7XnHd](https://zdoc-images.s3.us-west-2.amazonaws.com/APzwwVIWWhelahb5pOHcST7XnHd.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 保留中の招待を見つけ、**Actions** の **...** をクリックします。

1. **Resend Invitation** または **Revoke Invitation** をクリックします。

</Procedures>

### 組織メンバーのロールを編集する\{#edit-the-roles-of-organization-members}

ユーザーが組織に参加した後は、そのユーザーの組織ロールとプロジェクトアクセスを更新できます。1 人のユーザーに複数の組織ロールと複数のプロジェクトロールを割り当てることができます。最終的な権限は、直接割り当てられたロールとグループベースのロールの割り当ての和集合になります。

次の図は、組織メンバーのロールを編集する方法を示しています。

![GWNRwg2P8hVKvLb3ZiZcvAcFn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/GWNRwg2P8hVKvLb3ZiZcvAcFn0c.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 対象のメンバーを見つけ、**Actions** のペンアイコン（**Edit Role**）をクリックします。

1. 組織ロールとプロジェクトアクセスを更新します。

1. Save をクリックします。

</Procedures>

### 組織メンバーの詳細を表示する\{#view-organization-member-details}

メンバー詳細パネルを使用すると、メンバーのステータス、組織ロール、プロジェクトアクセス、参加日時、最終ログイン日時などの詳細を確認できます。

これは、メンバーが特定のプロジェクトにアクセスできる理由や、特定の操作を実行できない理由を確認する際に役立ちます。

### 組織メンバーを削除する\{#remove-organization-members}

メンバーが組織に所属する必要がなくなった場合は、そのメンバーを削除します。組織メンバーを削除すると、組織への所属と、組織内での直接的なロール割り当てが解除されます。

<Admonition type="danger" title="Notes">

メンバーを削除すると、対応する個人用 API キーが直ちに無効化され、アクセスが拒否されます。サービスの中断を防ぐには、削除前に環境で使用している個人用キーをすべて置き換えてください。この操作は元に戻せません。

</Admonition>

次の図は、組織メンバーを削除する方法を示しています。

![B9ewwOBXBh7PFNbod0VcJX2dnXg](https://zdoc-images.s3.us-west-2.amazonaws.com/B9ewwOBXBh7PFNbod0VcJX2dnXg.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 対象のユーザーを見つけ、**Actions** の **...** をクリックします。

1. **Remove** をクリックします。

1. 削除を確認します。

</Procedures>

### 組織から脱退する\{#leave-an-organization}

メンバーは、アクセスが必要なくなったときに組織から脱退できます。各組織には少なくとも 1 人の Organization Owner を残す必要があります。自分が唯一の Organization Owner である場合は、脱退する前に別のユーザーを Organization Owner に指定してください。

<Admonition type="info" title="Note">

組織から脱退すると、別の管理者から再度招待されない限り、その組織とそのリソースにアクセスできなくなります。

</Admonition>

組織からは、次のいずれかの方法で脱退できます。

- 組織一覧ページで組織から脱退する場合:

    ![GQYgwcvcHhtLtBbjwqtcOQ0Kn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/GQYgwcvcHhtLtBbjwqtcOQ0Kn3g.png)

    <Procedures>

    1. 対象の組織を見つけます。

    1. 組織カードの右下にある **...** をクリックします。

    1. **Leave** をクリックします。

    </Procedures>

- 組織に入り、**Organization Members** ページで脱退する場合:

    ![HvXvwczKahhrF5b1Qj5c6mdLnQh](https://zdoc-images.s3.us-west-2.amazonaws.com/HvXvwczKahhrF5b1Qj5c6mdLnQh.png)

    <Procedures>

    1. **Access Control** をクリックします。

    1. **Members** タブに切り替えます。

    1. 自分自身を見つけ、**Actions** の **...** をクリックします。

    1. **Leave** をクリックします。

    1. 操作を確認します。

    </Procedures>

## プロジェクトユーザー\{#project-users}

プロジェクトユーザーは、プロジェクトメンバーとも呼ばれ、特定のプロジェクトへのアクセス権を持つユーザーまたはグループです。プロジェクトユーザーを使用すると、組織レベルの広範な権限を付与することなく、プロジェクトのリソースへのアクセス権を付与できます。

<Admonition type="info" title="Note">

プロジェクトアクセスは明示的です。プロジェクトロールの割り当ては、特定のプロジェクトを対象とする必要があります。Zilliz Cloud は、現在および将来のすべてのプロジェクトを対象とするプロジェクト横断のワイルドカード割り当てをサポートしていません。

</Admonition>

次の表では、プロジェクトユーザーの管理に関連する概念について説明します。

| 概念 | 説明 |
| --- | --- |
| プロジェクトメンバー | 特定のプロジェクトへのアクセス権を付与されたユーザーまたはグループです。 |
| プロジェクトロール | プロジェクト内でメンバーが実行できる操作を制御するロールです。 |
| 直接割り当て | プロジェクト内のユーザーに直接割り当てられたロールです。 |
| グループ割り当て | グループに割り当てられたロールです。グループ内のユーザーはそのロールの権限を継承します。 |
| 実効アクセス | 直接割り当てられたプロジェクトロールとグループベースのプロジェクトロールの和集合です。 |

### プロジェクトメンバーを招待する\{#invite-project-members}

プロジェクトへのアクセス権を付与するには、ユーザーまたはグループをプロジェクトメンバーとして招待し、1 つ以上のプロジェクトロールを割り当てます。

次の図は、プロジェクトユーザーを招待する方法を示しています。

![WCxgw9gEqhFvxMb1vw5cEAIGnce](https://zdoc-images.s3.us-west-2.amazonaws.com/WCxgw9gEqhFvxMb1vw5cEAIGnce.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトを開きます。

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. **Invite Member** をクリックします。

1. 招待するユーザーのメールアドレスを入力するか、招待するユーザーを選択します。

1. 1 つ以上のプロジェクトロールを選択します。次の表では、プロジェクトロールについて説明します。

    | ロール | 最適な用途 | 一般的なアクセス |
    | --- | --- | --- |
    | Project Admin | プロジェクトのオーナーおよびプラットフォーム管理者 | メンバー、ロール、クラスターのライフサイクル、コンピューティング、データアクセスを含む、プロジェクトの完全な管理 |
    | Data Admin | データベース管理者およびプラットフォームエンジニア | プロビジョニング権限を除く、プロジェクトデータの完全な管理 |
    | Data Operator | データエンジニアおよびアプリケーション運用担当者 | プロジェクトの完全な管理権限を除く、データの読み取りおよび書き込み操作 |
    | Data Viewer | アナリスト、開発者、および読み取り専用アプリケーション | 書き込みアクセスを除く、リソースの読み取り、クエリ、および検査 |
    | Custom project role | 最小権限のプロジェクトアクセスを必要とするチーム | ロールで構成された権限セットによって異なります。 |

1. **Invite** をクリックします。

</Procedures>

<Admonition type="info" title="Note">

ユーザーをプロジェクトに招待した時点でそのユーザーがまだ組織のメンバーでない場合、そのユーザーは招待を承諾した後に組織のメンバーになります。

</Admonition>

### プロジェクトメンバーのロールを編集する\{#edit-the-roles-of-project-members}

メンバーの担当業務が変更された場合は、プロジェクトアクセスを編集します。たとえば、ユーザーのロールを Data Viewer から Data Operator に変更できます。

次の図は、プロジェクトユーザーのロールを編集する方法を示しています。

![BpgTwmFtVhskOXbg0mxcwrqPn4f](https://zdoc-images.s3.us-west-2.amazonaws.com/BpgTwmFtVhskOXbg0mxcwrqPn4f.png)

<Procedures>

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. 対象のメンバーを見つけ、**Actions** のペンアイコン（**Edit Role**）をクリックします。

1. 割り当てられているプロジェクトロールを更新します。

1. **Save** をクリックします。

</Procedures>

### プロジェクトメンバーを削除する\{#remove-project-members}

プロジェクトへのアクセスが不要になったユーザーまたはグループを削除します。プロジェクトアクセスを削除しても、そのユーザーは組織から削除されません。

次の図は、プロジェクトユーザーを削除する方法を示しています。

![Y05Lw38LohlzEBbDIKZcNLwUnfh](https://zdoc-images.s3.us-west-2.amazonaws.com/Y05Lw38LohlzEBbDIKZcNLwUnfh.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 対象のユーザーを見つけ、**Actions** の **...** をクリックします。

1. **Remove** をクリックします。

1. 削除を確認します。

</Procedures>

### プロジェクトから脱退する\{#leave-a-project}

ユーザーは、アクセスが必要なくなったときにプロジェクトから脱退できます。各プロジェクトには少なくとも 1 人の Project Admin を残す必要があります。自分が唯一の Project Admin である場合は、脱退する前に別のユーザーを Project Admin に指定してください。

<Admonition type="info" title="Note">

プロジェクトから脱退すると、別の管理者から再度招待されない限り、そのプロジェクトとそのリソースにアクセスできなくなります。

</Admonition>

次の図は、プロジェクトから脱退する方法を示しています。

![HdwPw8fTxhaPCHbNzK0cHrhsnB8](https://zdoc-images.s3.us-west-2.amazonaws.com/HdwPw8fTxhaPCHbNzK0cHrhsnB8.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 自分自身を見つけ、**Actions** の **...** をクリックします。

1. **Leave** をクリックします。

1. 操作を確認します。

</Procedures>
