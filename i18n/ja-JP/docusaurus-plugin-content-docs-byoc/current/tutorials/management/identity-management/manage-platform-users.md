---
title: "プラットフォームユーザーの管理 | BYOC"
slug: /manage-platform-users
sidebar_label: "プラットフォームユーザーの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud における2種類のプラットフォームユーザー（組織ユーザーとプロジェクトユーザー）について紹介し、その管理方法を説明します。 | BYOC"
type: origin
token: XvTLwH1TEiEHdJksnyIcMCixnic
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プラットフォームユーザーの管理

このガイドでは、Zilliz Cloud における2種類のプラットフォームユーザー（組織ユーザーとプロジェクトユーザー）について紹介し、その管理方法を説明します。

## 組織ユーザー\{#organization-users}

組織ユーザーは、Zilliz Cloud 組織のメンバーです。コンソールにサインインでき、担当業務に応じて組織ロール、プロジェクトアクセス、その他の権限を割り当てられます。

<Admonition type="info" icon="📘" title="Note">

組織ユーザーを管理するには、Organization Owner や同等のカスタム組織ロールなど、メンバーおよびロールの管理権限を含む組織ロールが必要です。

</Admonition>

### 組織ユーザーを招待する\{#invite-organization-users}

<Admonition type="info" icon="📘" title="📘 Notes">

各組織には最大100人のユーザーを追加できます。

</Admonition>

次の画像は、組織ユーザーの招待手順を示しています。

![PD1vwZlSihQVSZbGiVpcGr9Vnic](https://zdoc-images.s3.us-west-2.amazonaws.com/PD1vwZlSihQVSZbGiVpcGr9Vnic.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象の組織に移動します。

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. **Invite Member** をクリックします。

1. 以下の情報を入力します。

    - メールアドレス: 1つ以上のメールアドレスを入力できます。

    - 組織ロール: 適切な組織ロールを選択します。既定の組織ロールについては、下表を参照してください。

        | ロール | 使用場面 | 備考 |
        | --- | --- | --- |
        | Public | 追加のアクセス権が付与される前の、基本的なサインイン アクセスのみが必要な場合。 | すべての組織メンバーに自動的に付与されます。単独で削除することはできません。 |
        | Organization Owner | 組織の設定、メンバー、ロール、プロジェクト、セキュリティ、請求を管理する場合。 | 信頼できる管理者にのみ付与してください。 |
        | Billing Admin | 請求とサブスクリプションを管理する場合。 | 広範な技術的アクセスを必要としない、経理や調達の担当者向けに設計されています。 |

    - (任意) プロジェクトアクセス: プロジェクトと1つ以上のプロジェクトロールを選択して、プロジェクトへのアクセス権を設定します。

1. **Invite** をクリックします。

</Procedures>

招待されたユーザーにはメールが届き、組織に参加するには48時間以内に承諾する必要があります。または、Webコンソールから招待リンクをコピーして共有することもできます。

### 招待の取り消しまたは再送信\{#revoke-or-resend-an-invitation}

ユーザーを組織に招待すると、Zilliz Cloud から招待メールが送信されます。ユーザーが承諾する前であれば、招待を取り消したり再送信したりできます。

次の画像は、招待の取り消しまたは再送信の手順を示しています。

![APzwwVIWWhelahb5pOHcST7XnHd](https://zdoc-images.s3.us-west-2.amazonaws.com/APzwwVIWWhelahb5pOHcST7XnHd.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 保留中の招待を探し、**Actions** の **...** をクリックします。

1. **Resend Invitation** または **Revoke Invitation** をクリックします。

</Procedures>

### 組織ユーザーのロールを編集する\{#edit-the-roles-of-organization-users}

ユーザーが組織に参加した後、そのユーザーの組織ロールやプロジェクトアクセスを更新できます。1人のユーザーに複数の組織ロールやプロジェクトロールを割り当てることができ、最終的な権限は直接割り当てられたロールとグループ経由のロールの和集合となります。

次の画像は、組織ユーザーのロール編集手順を示しています。

![GWNRwg2P8hVKvLb3ZiZcvAcFn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/GWNRwg2P8hVKvLb3ZiZcvAcFn0c.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 対象のメンバーを探し、**Actions** のペンアイコン (**Edit Role**) をクリックします。

1. 組織ロールとプロジェクトアクセスを更新します。

1. Save をクリックします。

</Procedures>

### 組織ユーザーの詳細を表示する\{#view-organization-user-details}

メンバー詳細パネルでは、ステータス、組織ロール、プロジェクトアクセス、参加日時、最終ログイン日時などの情報を確認できます。

これは、ユーザーがプロジェクトにアクセスできる理由や、特定の操作を実行できない原因を調査する際に役立ちます。

### 組織ユーザーを削除する\{#remove-organization-users}

不要になったユーザーは組織から削除します。組織ユーザーを削除すると、組織への所属および組織内で直接割り当てられたロールも解除されます。

<Admonition type="danger" icon="🚧" title="Notes">

メンバーを削除すると、該当する個人用 API キーは直ちに無効化され、アクセスが拒否されます。サービスの中断を防ぐため、削除前に環境で使用している個人用キーを必ず置き換えてください。この操作は元に戻せません。

</Admonition>

次の画像は、組織ユーザーの削除手順を示しています。

![B9ewwOBXBh7PFNbod0VcJX2dnXg](https://zdoc-images.s3.us-west-2.amazonaws.com/B9ewwOBXBh7PFNbod0VcJX2dnXg.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 対象のユーザーを探し、**Actions** の **...** をクリックします。

1. **Remove** をクリックします。

1. 削除を確認します。

</Procedures>

### 組織から脱退する\{#leave-an-organization}

アクセスが不要になったユーザーは、組織から脱退できます。各組織には少なくとも1人の Organization Owner が必要ですので、自分が唯一の Organization Owner である場合は、脱退前に別のメンバーを Organization Owner に指定してください。

<Admonition type="info" icon="📘" title="Note">

一度組織から脱退すると、他の管理者から再度招待されない限り、その組織やリソースにはアクセスできなくなります。

</Admonition>

組織からの脱退方法は以下の2通りです。

- 組織一覧ページから脱退する場合:

    ![GQYgwcvcHhtLtBbjwqtcOQ0Kn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/GQYgwcvcHhtLtBbjwqtcOQ0Kn3g.png)

    <Procedures>

    1. 対象の組織を探します。

    1. 組織カードの右下にある **...** をクリックします。

    1. **Leave** をクリックします。

    </Procedures>

- 組織内の **Organization Members** ページから脱退する場合:

    ![HvXvwczKahhrF5b1Qj5c6mdLnQh](https://zdoc-images.s3.us-west-2.amazonaws.com/HvXvwczKahhrF5b1Qj5c6mdLnQh.png)

    <Procedures>

    1. **Access Control** をクリックします。

    1. **Members** タブに切り替えます。

    1. 自分自身を探し、**Actions** の **...** をクリックします。

    1. **Leave** をクリックします。

    1. 操作を確認します。

    </Procedures>

## プロジェクトユーザー\{#project-users}

プロジェクトユーザー（プロジェクトコラボレーター）とは、特定のプロジェクトへのアクセス権を持つユーザーまたはグループのことです。プロジェクトユーザー機能を使うことで、組織レベルの広範な権限を付与することなく、プロジェクトリソースへのアクセスを許可できます。

<Admonition type="info" icon="📘" title="Note">

プロジェクトアクセスは明示的に設定する必要があります。プロジェクトロールの割り当ては特定のプロジェクトに対して行う必要があり、Zilliz Cloud は現在および将来の全プロジェクトを対象とするワイルドカード割り当てをサポートしていません。

</Admonition>

プロジェクトユーザー管理に関連する主な概念を下表に示します。

| 概念 | 説明 |
| --- | --- |
| プロジェクトコラボレーター | 特定のプロジェクトへのアクセスを許可されたユーザーまたはグループ。 |
| プロジェクトロール | コラボレーターがプロジェクト内で実行できる操作を制御するロール。 |
| 直接割り当て | プロジェクト内のユーザーに直接割り当てられたロール。 |
| グループ割り当て | グループに割り当てられたロール。グループ内のユーザーはそのロールの権限を継承します。 |
| 有効なアクセス権 | 直接割り当てられたプロジェクトロールと、グループ経由のプロジェクトロールの和集合。 |

### プロジェクトユーザーの招待\{#invite-project-users}

プロジェクトへのアクセスを付与するには、ユーザーまたはグループをプロジェクトのコラボレーターとして招待し、1つ以上のプロジェクトロールを割り当てます。

次の画像は、プロジェクトユーザーを招待する手順を示しています。

![WCxgw9gEqhFvxMb1vw5cEAIGnce](https://zdoc-images.s3.us-west-2.amazonaws.com/WCxgw9gEqhFvxMb1vw5cEAIGnce.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトを開きます。

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. **Invite Collaborator** をクリックします。

1. ユーザーのメールアドレスを入力するか、招待するユーザーを選択します。

1. 1つ以上のプロジェクトロールを選択します。プロジェクトロールの詳細は、次の表を参照してください。

    | ロール | 推奨対象 | 主なアクセス権限 |
    | --- | --- | --- |
    | Project Admin | プロジェクトオーナーおよびプラットフォーム管理者 | コラボレーター、ロール、クラスターのライフサイクル、コンピューティング、データアクセスを含む、プロジェクト全体の管理 |
    | Data Admin | データベース管理者およびプラットフォームエンジニア | プロビジョニング権限を除く、プロジェクトデータの完全な管理 |
    | Data Operator | データエンジニアおよびアプリケーションオペレーター | プロジェクト全体の管理権限なしでの、データの読み取りおよび書き込み操作 |
    | Data Viewer | アナリスト、開発者、および読み取り専用アプリケーション | 書き込み権限なしでの、リソースの読み取り、クエリ、および確認 |
    | カスタムプロジェクトロール | 最小権限でのプロジェクトアクセスが必要なチーム | ロールに設定された権限セットに応じて異なる |

1. **Invite** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="Note">

まだ組織のメンバーでないユーザーをプロジェクトに招待した場合、そのユーザーは招待を承認すると組織のメンバーになります。

</Admonition>

### プロジェクトユーザーのロールを編集する\{#edit-the-roles-of-project-users}

コラボレーターの担当業務が変更された場合は、プロジェクトへのアクセス権を編集します。たとえば、ユーザーのロールを Data Viewer から Data Operator に変更できます。

次の画像は、プロジェクトユーザーのロールを編集する手順を示しています。

![BpgTwmFtVhskOXbg0mxcwrqPn4f](https://zdoc-images.s3.us-west-2.amazonaws.com/BpgTwmFtVhskOXbg0mxcwrqPn4f.png)

<Procedures>

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. 対象のメンバーを探し、**Actions** 列のペンアイコン（**Edit Role**）をクリックします。

1. 割り当てられているプロジェクトロールを更新します。

1. **Save** をクリックします。

</Procedures>

### プロジェクトユーザーを削除する\{#remove-project-users}

プロジェクトへのアクセスが不要になったユーザーまたはグループは削除します。プロジェクトへのアクセス権を削除しても、ユーザー自体は組織から削除されません。

次の画像は、プロジェクトユーザーを削除する手順を示しています。

![Y05Lw38LohlzEBbDIKZcNLwUnfh](https://zdoc-images.s3.us-west-2.amazonaws.com/Y05Lw38LohlzEBbDIKZcNLwUnfh.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 対象のユーザーを探し、**Actions** 列の **...** をクリックします。

1. **Remove** をクリックします。

1. 削除を確認します。

</Procedures>

### プロジェクトから退出する\{#leave-a-project}

アクセスが不要になったユーザーは、プロジェクトから退出できます。各プロジェクトには少なくとも1人の Project Admin が必要です。自分が唯一の Project Admin である場合は、退出する前に別のユーザーを Project Admin に割り当ててください。

<Admonition type="info" icon="📘" title="Note">

プロジェクトから退出すると、他の管理者から再度招待されない限り、そのプロジェクトやリソースにアクセスできなくなります。

</Admonition>

次の画像は、プロジェクトから退出する手順を示しています。

![HdwPw8fTxhaPCHbNzK0cHrhsnB8](https://zdoc-images.s3.us-west-2.amazonaws.com/HdwPw8fTxhaPCHbNzK0cHrhsnB8.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 自分のアカウントを探し、**Actions** 列の **...** をクリックします。

1. **Leave** をクリックします。

1. 操作を確認します。

</Procedures>
