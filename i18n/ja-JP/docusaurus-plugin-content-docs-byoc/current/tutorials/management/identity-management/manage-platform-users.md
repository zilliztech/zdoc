---
title: "プラットフォームユーザーの管理 | BYOC"
slug: /manage-platform-users
sidebar_label: "プラットフォームユーザーの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud における2種類のプラットフォームユーザー（組織メンバーとプロジェクトユーザー）について紹介し、それぞれの管理方法を説明します。 | BYOC"
type: origin
token: XvTLwH1TEiEHdJksnyIcMCixnic
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プラットフォームユーザーの管理

このガイドでは、Zilliz Cloud における2種類のプラットフォームユーザー（組織メンバーとプロジェクトユーザー）について紹介し、それぞれの管理方法を説明します。

## 組織メンバー\{#organization-members}

組織メンバーは、Zilliz Cloud 組織に所属するユーザーです。コンソールへのサインインが可能で、担当業務に応じて組織ロール、プロジェクトアクセス、その他の権限を割り当てることができます。

<Admonition type="info" icon="📘" title="Note">

組織メンバーを管理するには、Organization Owner や同等のカスタム組織ロールなど、メンバーおよびロールの管理権限を含む組織ロールが必要です。

</Admonition>

### 組織メンバーの招待\{#invite-organization-members}

<Admonition type="info" icon="📘" title="📘 Notes">

各組織には最大100人のメンバーを追加できます。

</Admonition>

次の図は、組織メンバーを招待する手順を示しています。

![PD1vwZlSihQVSZbGiVpcGr9Vnic](https://zdoc-images.s3.us-west-2.amazonaws.com/PD1vwZlSihQVSZbGiVpcGr9Vnic.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象の組織に移動します。

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. **Invite Member** をクリックします。

1. 以下の情報を入力します。

    - メールアドレス: 1つ以上のメールアドレスを入力できます。

    - 組織ロール: 適切な組織ロールを選択します。定義済みの組織ロールについては、下表を参照してください。

        | ロール | 使用場面 | 備考 |
        | --- | --- | --- |
        | Public | 追加のアクセス権が付与される前に、基本的なサインイン アクセスのみが必要な場合。 | すべての組織メンバーに自動的に付与されます。このロール単体での削除はできません。 |
        | Organization Owner | 組織設定、メンバー、ロール、プロジェクト、セキュリティ、請求を管理する場合。 | 信頼できる管理者にのみ付与してください。 |
        | Billing Admin | 請求とサブスクリプションを管理する場合。 | 広範な技術的アクセスを必要としない財務・調達担当者向けです。 |

    - （任意）プロジェクトアクセス: プロジェクトと1つ以上のプロジェクトロールを選択して、プロジェクトアクセスを設定します。

1. **Invite** をクリックします。

</Procedures>

招待されたユーザーにはメールが届きます。組織に参加するには、48時間以内にその招待を承諾する必要があります。または、Webコンソールから招待リンクをコピーして招待者に共有することもできます。

### 招待の取り消しまたは再送信\{#revoke-or-resend-an-invitation}

ユーザーを組織に招待すると、Zilliz Cloud から招待メールが送信されます。ユーザーが承諾する前であれば、招待の取り消しや再送信が可能です。

次の図は、招待を取り消すか再送信する手順を示しています。

![APzwwVIWWhelahb5pOHcST7XnHd](https://zdoc-images.s3.us-west-2.amazonaws.com/APzwwVIWWhelahb5pOHcST7XnHd.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 保留中の招待を見つけ、**Actions** の **...** をクリックします。

1. **Resend Invitation** または **Revoke Invitation** をクリックします。

</Procedures>

### 組織メンバーのロール編集\{#edit-the-roles-of-organization-members}

ユーザーが組織に参加した後、そのユーザーの組織ロールやプロジェクトアクセスを更新できます。1人のユーザーに複数の組織ロールやプロジェクトロールを割り当てることが可能です。最終的な権限は、直接割り当てられたロールとグループベースのロールの和集合となります。

次の図は、組織メンバーのロールを編集する手順を示しています。

![GWNRwg2P8hVKvLb3ZiZcvAcFn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/GWNRwg2P8hVKvLb3ZiZcvAcFn0c.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 対象のメンバーを見つけ、**Actions** のペンアイコン（**Edit Role**）をクリックします。

1. 組織ロールとプロジェクトアクセスを更新します。

1. Save をクリックします。

</Procedures>

### 組織メンバーの詳細表示\{#view-organization-member-details}

メンバー詳細パネルでは、ステータス、組織ロール、プロジェクトアクセス、参加日時、最終ログイン日時などの情報を確認できます。

これは、メンバーが特定のプロジェクトにアクセスできる理由や、特定の操作を実行できない原因を調査する際に役立ちます。

### 組織メンバーの削除\{#remove-organization-members}

不要になったメンバーは組織から削除できます。組織メンバーを削除すると、組織への所属および組織内での直接的なロール割り当てが解除されます。

<Admonition type="danger" icon="🚧" title="Notes">

メンバーを削除すると、該当する個人用 API キーは即座に無効化され、アクセスが拒否されます。サービスの中断を防ぐため、削除前に環境で使用している個人用キーを必ず置き換えてください。この操作は元に戻せません。

</Admonition>

次の図は、組織メンバーを削除する手順を示しています。

![B9ewwOBXBh7PFNbod0VcJX2dnXg](https://zdoc-images.s3.us-west-2.amazonaws.com/B9ewwOBXBh7PFNbod0VcJX2dnXg.png)

<Procedures>

1. **Access Control** をクリックします。

1. **Members** タブに切り替えます。

1. 対象のユーザーを見つけ、**Actions** の **...** をクリックします。

1. **Remove** をクリックします。

1. 削除を確認します。

</Procedures>

### 組織からの脱退\{#leave-an-organization}

アクセスが不要になったメンバーは、組織から脱退できます。各組織には少なくとも1人の Organization Owner が必要です。自分が唯一の Organization Owner である場合は、脱退前に別のメンバーを Organization Owner に指定してください。

<Admonition type="info" icon="📘" title="Note">

組織から脱退すると、他の管理者から再度招待されない限り、その組織やリソースにアクセスできなくなります。

</Admonition>

組織からの脱退は、以下のいずれかの方法で行えます。

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

    1. 自分自身を見つけ、**Actions** の **...** をクリックします。

    1. **Leave** をクリックします。

    1. 操作を確認します。

    </Procedures>

## プロジェクトユーザー\{#project-users}

プロジェクトユーザー（プロジェクトメンバーとも呼ばれます）は、特定のプロジェクトへのアクセス権を持つユーザーまたはグループです。組織レベルの広範な権限を付与することなく、プロジェクトリソースへのアクセス権を付与するために使用します。

<Admonition type="info" icon="📘" title="Note">

プロジェクトアクセスは明示的に設定されます。プロジェクトロールの割り当ては、特定のプロジェクトを対象とする必要があります。Zilliz Cloud は、現在および将来の全プロジェクトを対象としたワイルドカードによる一括割り当てをサポートしていません。

</Admonition>

プロジェクトユーザー管理に関連する主な概念を下表に示します。

| 概念 | 説明 |
| --- | --- |
| プロジェクトメンバー | 特定のプロジェクトへのアクセス権を付与されたユーザーまたはグループ。 |
| プロジェクトロール | プロジェクト内でメンバーが実行できる操作を制御するロール。 |
| 直接割り当て | プロジェクト内のユーザーに直接割り当てられたロール。 |
| グループ割り当て | グループに割り当てられたロール。グループ内のユーザーはそのロールの権限を継承します。 |
| 実効アクセス | 直接割り当てられたプロジェクトロールとグループベースのプロジェクトロールの和集合。 |

### プロジェクトメンバーを招待する\{#invite-project-members}

プロジェクトへのアクセスを付与するには、ユーザーまたはグループをプロジェクトメンバーとして招待し、1つ以上のプロジェクトロールを割り当てます。

次の画像は、プロジェクトユーザーを招待する手順を示しています。

![WCxgw9gEqhFvxMb1vw5cEAIGnce](https://zdoc-images.s3.us-west-2.amazonaws.com/WCxgw9gEqhFvxMb1vw5cEAIGnce.png)

<Procedures>

1. Zilliz Cloud コンソールで、対象のプロジェクトを開きます。

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. **Invite Member** をクリックします。

1. 招待するユーザーのメールアドレスを入力するか、ユーザーを選択します。

1. 1つ以上のプロジェクトロールを選択します。プロジェクトロールの詳細は、次の表を参照してください。

    | ロール | 推奨対象 | 主なアクセス権限 |
    | --- | --- | --- |
    | Project Admin | プロジェクト所有者およびプラットフォーム管理者 | メンバー、ロール、クラスターのライフサイクル、コンピュート、データアクセスを含む、プロジェクト全体の管理 |
    | Data Admin | データベース管理者およびプラットフォームエンジニア | プロビジョニング権限を除く、プロジェクトデータの完全な管理 |
    | Data Operator | データエンジニアおよびアプリケーションオペレーター | プロジェクト管理権限を除く、データの読み取りおよび書き込み操作 |
    | Data Viewer | アナリスト、開発者、読み取り専用アプリケーション | 書き込み権限を除く、リソースの読み取り、クエリ、参照 |
    | カスタムプロジェクトロール | 最小権限でのプロジェクトアクセスが必要なチーム | ロールに設定された権限セットに応じて異なる |

1. **Invite** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="Note">

まだ組織のメンバーでないユーザーをプロジェクトに招待した場合、そのユーザーは招待を承諾すると自動的に組織のメンバーになります。

</Admonition>

### プロジェクトメンバーのロールを編集する\{#edit-the-roles-of-project-members}

メンバーの担当業務が変更になった場合は、プロジェクトへのアクセス権限を編集します。たとえば、ユーザーのロールを Data Viewer から Data Operator に変更できます。

次の画像は、プロジェクトユーザーのロールを編集する手順を示しています。

![BpgTwmFtVhskOXbg0mxcwrqPn4f](https://zdoc-images.s3.us-west-2.amazonaws.com/BpgTwmFtVhskOXbg0mxcwrqPn4f.png)

<Procedures>

1. **Access Control** に移動します。

1. **Members** タブに切り替えます。

1. 対象のメンバーを探し、**Actions** 列のペンアイコン（**Edit Role**）をクリックします。

1. 割り当てられているプロジェクトロールを更新します。

1. **Save** をクリックします。

</Procedures>

### プロジェクトメンバーを削除する\{#remove-project-members}

プロジェクトへのアクセスが不要になったユーザーまたはグループは削除します。プロジェクトから削除しても、そのユーザーが組織から削除されることはありません。

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

アクセスが不要になったユーザーは、プロジェクトから退出できます。各プロジェクトには少なくとも1人の Project Admin が必要です。自分が唯一の Project Admin である場合は、退出前に別のユーザーを Project Admin に指定してください。

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
